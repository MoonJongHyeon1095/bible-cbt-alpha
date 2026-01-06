// src/components/center/CenterPanel.tsx
import type { User } from "@supabase/supabase-js";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { generateExtendedAutomaticThoughts } from "../../lib/ai";
import type { EmotionThoughtPair } from "../../types";
import { CbtMode } from "../header/ModePicker";
import { Card } from "../ui/card";
import { CenterHeader } from "./CenterHeader";
import { ALL_EXAMPLES } from "./constants/examples";
import { EmotionDetailCard } from "./EmotionDetailCard";
import { EmotionGrid } from "./EmotionGrid";
import { FirstEmotionIntensityModal } from "./FirstEmotionIntensityModal";
import { SavedDetailsModal } from "./SavedDetailsModal";
import { IncidentStepCard } from "./IncidentStepCard";
import { SavedTriggersModal } from "./SavedTriggersModal";
import { ThoughtSelectionCard } from "./ThoughtSelectionCard";
import type {
  EmotionData,
  EmotionNote,
  EmotionNoteDetail,
  EmotionNoteDetailWithNote,
} from "./types";
import {
  createDetailAPI,
  createNoteAPI,
  deleteDetailAPI,
  fetchDetailsAPI,
  fetchNotesAPI,
} from "./utils/api";
import {
  flattenLocalDetails,
  getLocalNotes,
  saveLocalNotes,
} from "./utils/storage";

interface CenterPanelProps {
  step: number;
  userInput: string;
  emotionThoughtPairs: EmotionThoughtPair[];
  onInputChange: (input: string) => void;
  onSetEmotionThoughtPairs: (pairs: EmotionThoughtPair[]) => void;
  onNext: () => void;
  mode: CbtMode;
  user: User | null;
}

type PrefetchKey = string;

function makePrefetchKey(emotion: string, input: string): PrefetchKey {
  return `${emotion}::${input.trim()}`;
}

function formatAutoTitle(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const yy = date.getFullYear().toString().slice(2);
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${yy}년 ${mm}월 ${dd}일 ${hh}시 ${min}분에 저장`;
}

export function CenterPanel({
  step,
  userInput,
  emotionThoughtPairs,
  onInputChange,
  onSetEmotionThoughtPairs,
  onNext,
  mode,
  user,
}: CenterPanelProps) {
  const isDeep = mode.detailMode === "deep";

  // ref for scrolling
  const containerRef = useRef<HTMLDivElement>(null);

  // ✅ 랜덤 예시 4개
  const [randomExamples, setRandomExamples] = useState(() => {
    const shuffled = [...ALL_EXAMPLES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  });

  const refreshExamples = () => {
    const shuffled = [...ALL_EXAMPLES].sort(() => Math.random() - 0.5);
    setRandomExamples(shuffled.slice(0, 4));
  };

  // 현재 선택된 감정
  const [selectedEmotion, setSelectedEmotion] = useState<string>("");
  const [emotionIntensity, setEmotionIntensity] = useState(50);
  const [emotionSet, setEmotionSet] = useState(false);
  const [showIntensityModal, setShowIntensityModal] = useState(false);

  // 감정 상세 뷰 상태
  const [showEmotionDetail, setShowEmotionDetail] = useState(false);
  const [selectedEmotionData, setSelectedEmotionData] =
    useState<EmotionData | null>(null);

  // “확인 체크”
  const [emotionDetailConfirmed, setEmotionDetailConfirmed] = useState(false);

  // AI가 생성한 자동사고
  const [generatedThoughts, setGeneratedThoughts] = useState<string[]>([]);
  const [selectedThoughtIndex, setSelectedThoughtIndex] = useState<
    number | null
  >(null);

  // 사용자 직접 입력 자동사고
  const [customThought, setCustomThought] = useState<string>("");

  // 저장된 자동사고(감정 노트)
  const [showSavedDetailsModal, setShowSavedDetailsModal] = useState(false);
  const [savedDetails, setSavedDetails] = useState<EmotionNoteDetailWithNote[]>(
    []
  );
  const [notesLoading, setNotesLoading] = useState(false);

  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activeNoteTitle, setActiveNoteTitle] = useState<string | null>(null);
  const activeNoteIdRef = useRef<string | null>(null);

  const [showSavedTriggersModal, setShowSavedTriggersModal] = useState(false);
  const [savedTriggerNotes, setSavedTriggerNotes] = useState<EmotionNote[]>([]);

  // 로딩/에러
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeNoteTrigger, setActiveNoteTrigger] = useState<string | null>(
    null
  );

  const setActiveNote = (
    noteId: string | null,
    title?: string | null,
    trigger?: string | null
  ) => {
    setActiveNoteId(noteId);
    setActiveNoteTitle(title ?? null);
    setActiveNoteTrigger(trigger ?? null);
    activeNoteIdRef.current = noteId;

    try {
      if (noteId) {
        sessionStorage.setItem(
          "cbt_active_note",
          JSON.stringify({ noteId, title, trigger })
        );
      } else {
        sessionStorage.removeItem("cbt_active_note");
      }
      window.dispatchEvent(new Event("cbt-active-note-update"));
    } catch {
      /* ignore */
    }
  };

  /**
   * ✅ 프리페치 캐시
   */
  const prefetchPromiseRef = useRef<Promise<void> | null>(null);
  const prefetchKeyRef = useRef<PrefetchKey | null>(null);

  const currentPrefetchKey = useMemo(() => {
    if (!selectedEmotion) return null;
    if (!userInput.trim()) return null;
    return makePrefetchKey(selectedEmotion, userInput);
  }, [selectedEmotion, userInput]);

  const useServerNotes = Boolean(user);

  const mapServerNote = (row: any): EmotionNote => ({
    id: row.id?.toString() ?? `${Date.now()}`,
    title: row.title ?? "",
    trigger: row.trigger ?? row.trigger_text ?? "",
    behavior: row.behavior ?? "",
    frequency: Number(row.frequency) || 1,
    createdAt: row.created_at ?? new Date().toISOString(),
    timestamp: row.created_at ?? new Date().toISOString(),
  });

  const mapServerDetail = (row: any): EmotionNoteDetailWithNote => ({
    id: row.id?.toString() ?? `${Date.now()}`,
    noteId: row.note_id?.toString() ?? "",
    automaticThought: row.automatic_thought ?? row.automaticThought ?? "",
    emotion: row.emotion ?? "",
    alternative: row.alternative ?? "",
    createdAt: row.created_at ?? new Date().toISOString(),
    noteTitle:
      row.noteTitle ??
      row.note_title ??
      row.emotion_notes?.title ??
      "",
    noteTrigger:
      row.noteTrigger ??
      row.note_trigger ??
      row.emotion_notes?.trigger ??
      row.emotion_notes?.trigger_text ??
      "",
  });

  const fetchServerNotes = async ({ silent = false } = {}) => {
    if (!useServerNotes) return;
    if (!silent) setNotesLoading(true);

    try {
      const { ok, payload } = await fetchNotesAPI();
      if (!ok)
        throw new Error(payload?.error || "노트를 불러오지 못했습니다.");
      const notes = Array.isArray(payload?.notes)
        ? payload.notes.map(mapServerNote)
        : [];
      setSavedTriggerNotes(notes);
    } catch (e) {
      console.error("감정 노트 불러오기 실패:", e);
      if (!silent) toast.error("감정 노트를 불러오지 못했습니다.");
    } finally {
      if (!silent) setNotesLoading(false);
    }
  };

  useEffect(() => {
    if (useServerNotes) {
      void fetchServerNotes({ silent: true });
    } else {
      const locals = getLocalNotes();
      setSavedTriggerNotes(locals);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useServerNotes]);

  // 예시 클릭
  const handleInputChange = (value: string, preserveNote = false) => {
    if (!preserveNote && value !== userInput) {
      setActiveNote(null, null, null);
    }
    onInputChange(value);
  };

  const handleExampleClick = (example: string) => {
    handleInputChange(example);
  };

  // ✅ 공통: 감정 바뀔 때 상태 리셋(프리페치 무효화 포함)
  const resetForNewEmotion = () => {
    setEmotionDetailConfirmed(false);

    // 감정 바뀌면 이전 프리페치 무효화
    prefetchPromiseRef.current = null;
    prefetchKeyRef.current = null;

    // 자동사고 화면 관련 초기화
    setGeneratedThoughts([]);
    setSelectedThoughtIndex(null);
    setCustomThought("");
    setShowSavedDetailsModal(false);

    // 상태 초기화(안전)
    setEmotionSet(false);
    setShowIntensityModal(false);

    setError(null);
  };

  const handleSaveTriggerOnly = async () => {
    const triggerText = userInput.trim();
    if (!triggerText) {
      toast.error("먼저 상황을 입력해주세요.");
      return;
    }

    const now = new Date();
    const title = activeNoteTitle ?? formatAutoTitle(now);

    if (useServerNotes) {
      const existing = savedTriggerNotes.find(
        (note) => note.trigger === triggerText
      );
      if (existing) {
        setActiveNote(existing.id, existing.title, existing.trigger);
        toast.success("이미 저장된 상황을 불러왔습니다.");
        return;
      }

      try {
        setNotesLoading(true);
        const { ok, payload } = await createNoteAPI({
          title,
          trigger: triggerText,
        });
        if (!ok || !payload?.note) {
          throw new Error(payload?.error || "상황을 저장하지 못했습니다.");
        }
        const note = mapServerNote(payload.note);
        setActiveNote(note.id, note.title, note.trigger);
        setSavedTriggerNotes((prev) => [note, ...prev]);
        toast.success("상황이 저장되었습니다.");
      } catch (e) {
        console.error("상황 저장 실패:", e);
        toast.error("상황을 저장하지 못했습니다.");
      } finally {
        setNotesLoading(false);
      }
      return;
    }

    const existingLocal = getLocalNotes().find(
      (note) => note.trigger === triggerText
    );
    if (existingLocal) {
      setActiveNote(
        existingLocal.id,
        existingLocal.title,
        existingLocal.trigger
      );
      toast.success("이미 저장된 상황을 불러왔습니다.");
      return;
    }

    const nowIso = now.toISOString();
    const newNote: EmotionNote = {
      id: Date.now().toString(),
      title,
      trigger: triggerText,
      createdAt: nowIso,
      timestamp: nowIso,
      frequency: 1,
      behavior: "",
      details: [],
    };
    const current = getLocalNotes();
    const next = [newNote, ...current];
    saveLocalNotes(next);
    setSavedTriggerNotes(next);
    setActiveNote(newNote.id, newNote.title, newNote.trigger);
    toast.success("상황이 저장되었습니다.");
  };

  const openSavedTriggersModal = async () => {
    setShowSavedTriggersModal(true);
    if (useServerNotes) {
      await fetchServerNotes();
    } else {
      const locals = getLocalNotes();
      setSavedTriggerNotes(locals);
    }
  };

  const closeSavedTriggersModal = () => setShowSavedTriggersModal(false);

  const handleTriggerPick = (note: EmotionNote) => {
    handleInputChange(note.trigger, true);
    setActiveNote(note.id, note.title, note.trigger);
    resetForNewEmotion();
    setShowSavedTriggersModal(false);
    onNext();
  };

  useEffect(() => {
    if (showSavedDetailsModal) {
      void fetchSavedDetails(activeNoteIdRef.current ?? undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSavedDetailsModal, useServerNotes]);

  /**
   * ✅ 프리페치 시작 (deep에서 강도 모달 열리기 전에 미리 생성)
   */
  const startPrefetchThoughts = () => {
    if (!selectedEmotion || !userInput.trim()) return;

    const key = makePrefetchKey(selectedEmotion, userInput);

    if (prefetchKeyRef.current === key && prefetchPromiseRef.current) return;

    prefetchKeyRef.current = key;
    setLoading(true);
    setError(null);

    const p = (async () => {
      const result = await generateExtendedAutomaticThoughts(
        userInput,
        selectedEmotion
      );

      const thoughts = result.sdtThoughts.map((st) => st.thought);

      if (prefetchKeyRef.current === key) {
        setGeneratedThoughts(thoughts);
        setSelectedThoughtIndex(null);
        setCustomThought("");
    setShowSavedDetailsModal(false);
      }
    })()
      .catch((err) => {
        if (prefetchKeyRef.current === key) {
          setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
        }
      })
      .finally(() => {
        if (prefetchKeyRef.current === key) {
          setLoading(false);
        }
      });

    prefetchPromiseRef.current = p;
  };

  /**
   * ✅ 자동사고 생성/표시
   * - 핵심: emotionOverride를 받아 state race를 제거
   */
  const finalizeEmotionAndShowThoughts = async (emotionOverride?: string) => {
    const emotion = emotionOverride ?? selectedEmotion;
    if (!emotion || !userInput.trim()) return;

    const key = makePrefetchKey(emotion, userInput);

    setEmotionSet(true);
    setError(null);

    // ✅ deep 흐름: prefetch 결과가 이미 있으면 그것을 기다려 사용
    if (prefetchKeyRef.current === key && prefetchPromiseRef.current) {
      await prefetchPromiseRef.current;

      if (containerRef.current) containerRef.current.scrollTop = 0;
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);
    try {
      const result = await generateExtendedAutomaticThoughts(
        userInput,
        emotion
      );
      const thoughts = result.sdtThoughts.map((st) => st.thought);
      setGeneratedThoughts(thoughts);
      setSelectedThoughtIndex(null);
      setCustomThought("");
    setShowSavedDetailsModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }

    if (containerRef.current) containerRef.current.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * 감정 선택:
   * - lite/deep 모두 감정상세 화면은 보여준다.
   */
  const handleEmotionSelect = (emotionData: EmotionData) => {
    if (!userInput.trim()) {
      toast.error("먼저 Step 1에서 내용을 입력해주세요.");
      return;
    }

    setSelectedEmotionData(emotionData);
    setSelectedEmotion(emotionData.label);
    resetForNewEmotion();

    // ✅ lite/deep 공통: 상세 화면 보여주기
    setShowEmotionDetail(true);
  };

  /**
   * 감정 상세에서 "이 감정 다루기" 클릭
   * - deep: 강도 모달(다이얼)로 이동
   * - lite: 강도 모달 생략, 바로 생성
   */
  const handleSelectThisEmotion = async () => {
    if (!selectedEmotionData) return;
    if (!emotionDetailConfirmed) return;

    const emotionLabel = selectedEmotionData.label;

    setShowEmotionDetail(false);

    if (isDeep) {
      // ✅ deep: 강도 모달 열기 (prefetch는 모달 step1 완료 시점에)
      setShowIntensityModal(true);
      return;
    }

    // ✅ lite: 강도 모달 생략
    setShowIntensityModal(false);

    // ✅ 바로 자동사고 생성 (emotionOverride로 state race 방지)
    await finalizeEmotionAndShowThoughts(emotionLabel);
  };

  // 자동사고 선택
  const handleThoughtSelect = (index: number) => {
    setSelectedThoughtIndex(index);
  };

  const handleCustomThoughtChange = (value: string) => {
    setCustomThought(value);
    if (
      value &&
      selectedThoughtIndex !== null &&
      selectedThoughtIndex !== 999
    ) {
      setSelectedThoughtIndex(null);
    }
  };

  const handleCustomThoughtSelect = () => {
    setSelectedThoughtIndex(999);
  };

  const submitThoughtSelection = () => {
    if (selectedThoughtIndex === null) return;

    if (selectedThoughtIndex === 999 && customThought.trim()) {
      const storedIntensity = isDeep ? emotionIntensity : null;
      const newPair: EmotionThoughtPair = {
        emotion: selectedEmotion,
        intensity: storedIntensity,
        thought: customThought.trim(),
      };
      onSetEmotionThoughtPairs([...emotionThoughtPairs, newPair]);
      onNext();
      return;
    }

    handleComplete();
  };

  // 선택 완료 → Step 3로
  const handleComplete = () => {
    if (selectedThoughtIndex === null) return;

    const storedIntensity = isDeep ? emotionIntensity : null;

    const newPair: EmotionThoughtPair = {
      emotion: selectedEmotion,
      intensity: storedIntensity,
      thought: generatedThoughts[selectedThoughtIndex],
    };

    onSetEmotionThoughtPairs([...emotionThoughtPairs, newPair]);

    if (containerRef.current) containerRef.current.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "smooth" });

    onNext();
  };

  // 저장된 자동사고 불러오기
  const loadFavorites = async () => {
    setShowSavedDetailsModal(true);
    await fetchSavedDetails(activeNoteIdRef.current ?? undefined);
  };

  const fetchSavedDetails = async (noteId?: string) => {
    setNotesLoading(true);
    try {
      if (useServerNotes) {
        const effectiveNoteId =
          noteId ||
          activeNoteIdRef.current ||
          savedTriggerNotes.find((n) => n.trigger === userInput.trim())?.id ||
          undefined;

        const params = new URLSearchParams();
        if (effectiveNoteId) params.set("noteId", effectiveNoteId);

        const { ok, payload } = await fetchDetailsAPI(
          params.get("noteId") || undefined
        );
        if (!ok)
          throw new Error(payload?.error || "감정 노트를 불러오지 못했습니다.");
        const details = Array.isArray(payload?.details)
          ? payload.details.map(mapServerDetail)
          : [];
        setSavedDetails(details);
      } else {
        const notes = getLocalNotes();
        const effectiveNoteId =
          noteId ||
          activeNoteIdRef.current ||
          savedTriggerNotes.find((n) => n.trigger === userInput.trim())?.id ||
          undefined;
        const filtered = effectiveNoteId
          ? notes.filter((n) => n.id === effectiveNoteId)
          : notes;
        setSavedDetails(flattenLocalDetails(filtered));
      }
    } catch (e) {
      console.error("감정 노트 불러오기 실패:", e);
      toast.error("감정 노트를 불러오지 못했습니다.");
    } finally {
      setNotesLoading(false);
    }
  };

  // 자동사고를 감정 노트에 저장
  const addThoughtToFavorites = async (
    thought: string,
    emotion: string,
    _intensity: number
  ) => {
    if (!userInput.trim()) {
      toast.error("상황을 먼저 입력해주세요.");
      return;
    }

    const triggerText = userInput.trim();
    const now = new Date();
    const nowIso = now.toISOString();
    const title = activeNoteTitle ?? formatAutoTitle(now);

    if (useServerNotes) {
      try {
        setNotesLoading(true);
        let noteId = activeNoteId;
        let noteTitle = activeNoteTitle ?? title;
        let noteTrigger = activeNoteTrigger ?? triggerText;

        if (!noteId) {
          const existing = savedTriggerNotes.find(
            (n) => n.trigger === triggerText
          );
          if (existing) {
            noteId = existing.id;
            noteTitle = existing.title;
            noteTrigger = existing.trigger;
          }
        }

        if (!noteId) {
          const { ok, payload } = await createNoteAPI({
            title,
            trigger: triggerText,
          });
          if (!ok || !payload?.note) {
            throw new Error(
              payload?.error || "상황을 저장하지 못했습니다."
            );
          }
          const mappedNote = mapServerNote(payload.note);
          setSavedTriggerNotes((prev) => [mappedNote, ...prev]);
          noteId = mappedNote.id;
          noteTitle = mappedNote.title;
          noteTrigger = mappedNote.trigger;
        }

        const { ok, payload } = await createDetailAPI({
          noteId,
          automaticThought: thought,
          emotion,
          alternative: "",
        });
        if (!ok || !payload?.detail) {
          throw new Error(
            payload?.error || "자동사고를 저장하지 못했습니다."
          );
        }

        const savedDetail = mapServerDetail(payload.detail);
        setActiveNote(noteId, noteTitle, noteTrigger);
        setSavedDetails((prev) => [savedDetail, ...prev]);
        toast.success("자동사고가 감정 노트에 저장되었습니다.");
        return;
      } catch (e) {
        console.error("감정 노트 저장 실패:", e);
        toast.error("감정 노트를 저장하지 못했습니다.");
        return;
      } finally {
        setNotesLoading(false);
      }
    }

    const notes = getLocalNotes();
    const existingNote =
      notes.find((n) => n.id === activeNoteId) ||
      notes.find((n) => n.trigger === triggerText);

    const noteToUse =
      existingNote ??
      ({
        id: Date.now().toString(),
        title,
        trigger: triggerText,
        createdAt: nowIso,
        timestamp: nowIso,
        behavior: "",
        frequency: 1,
        details: [],
      } as EmotionNote);

    const detail: EmotionNoteDetail = {
      id: Date.now().toString(),
      noteId: noteToUse.id,
      automaticThought: thought,
      emotion,
      alternative: "",
      createdAt: nowIso,
    };

    const updatedNotes = (() => {
      const without = notes.filter((n) => n.id !== noteToUse.id);
      const mergedDetails = [detail, ...(noteToUse.details ?? [])];
      const mergedNote = { ...noteToUse, details: mergedDetails };
      return [mergedNote, ...without];
    })();

    saveLocalNotes(updatedNotes);
    setSavedTriggerNotes(updatedNotes);
    setActiveNote(noteToUse.id, noteToUse.title, noteToUse.trigger);
    setSavedDetails((prev) => [
      { ...detail, noteTitle: noteToUse.title, noteTrigger: noteToUse.trigger },
      ...prev,
    ]);
    toast.success("자동사고가 감정 노트에 저장되었습니다.");
  };

  // 저장된 노트에서 자동사고 불러오기
  const loadFromFavorites = (detail: EmotionNoteDetailWithNote) => {
    const emotion = detail.emotion || selectedEmotion;
    const thought = detail.automaticThought;
    const storedIntensity = isDeep ? emotionIntensity : null;

    if (detail.noteTrigger) {
      handleInputChange(detail.noteTrigger, true);
    }
    setSelectedEmotion(emotion);
    setEmotionSet(true);
    setShowSavedDetailsModal(false);
    setActiveNote(detail.noteId, detail.noteTitle, detail.noteTrigger);

    const newPair: EmotionThoughtPair = {
      emotion,
      intensity: storedIntensity,
      thought,
    };

    onSetEmotionThoughtPairs([...emotionThoughtPairs, newPair]);

    if (containerRef.current) containerRef.current.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "smooth" });
    onNext();
  };

  // 저장된 노트 삭제
  const removeFromFavorites = async (id: string) => {
    if (useServerNotes) {
      try {
        const { ok, payload } = await deleteDetailAPI(id);
        if (!ok) throw new Error(payload?.error || "삭제하지 못했습니다.");
        setSavedDetails((prev) => prev.filter((f) => f.id !== id));
        return;
      } catch (e) {
        console.error("감정 노트 삭제 실패:", e);
        toast.error("삭제하지 못했습니다.");
        return;
      }
    }

    const stored = getLocalNotes();
    const next = stored.map((note) => {
      const filteredDetails = (note.details ?? []).filter(
        (detail) => detail.id !== id
      );
      return { ...note, details: filteredDetails };
    });

    saveLocalNotes(next);
    setSavedTriggerNotes(next);
    setSavedDetails((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <Card className="bg-slate-50/95 backdrop-blur-sm p-6 shadow-2xl border border-slate-200/50 min-h-[600px] flex flex-col">
      <CenterHeader
        step={step}
        emotionSet={emotionSet}
        showEmotionDetail={showEmotionDetail}
      />

      <FirstEmotionIntensityModal
        // ✅ deep일 때만 실제로 열리게 방지
        open={isDeep && showIntensityModal}
        emotion={selectedEmotion}
        intensity={emotionIntensity}
        onIntensityChange={setEmotionIntensity}
        onPrefetchThoughts={() => {
          startPrefetchThoughts();
        }}
        onConfirm={async () => {
          setShowIntensityModal(false);
          await finalizeEmotionAndShowThoughts();
        }}
        onClose={() => setShowIntensityModal(false)}
        isLoading={loading}
      />

      <SavedTriggersModal
        open={showSavedTriggersModal}
        onClose={closeSavedTriggersModal}
        loading={notesLoading}
        triggers={savedTriggerNotes}
        onSelect={handleTriggerPick}
      />
      <SavedDetailsModal
        open={showSavedDetailsModal}
        onClose={() => setShowSavedDetailsModal(false)}
        loading={notesLoading}
        details={savedDetails}
        showNoteScopeOnly={Boolean(activeNoteId && useServerNotes)}
        activeNoteTrigger={activeNoteTrigger}
        onSelect={loadFromFavorites}
        onDelete={(id) => void removeFromFavorites(id)}
      />

      <div className="flex-1 space-y-6 overflow-y-auto" ref={containerRef}>
        {/* ================= Step 1: 사건 기록 (지금 UI 반영) ================= */}
        {step === 1 && (
          <IncidentStepCard
            userInput={userInput}
            onInputChange={handleInputChange}
            onNext={onNext}
            randomExamples={randomExamples}
            onExampleClick={handleExampleClick}
            onRefreshExamples={refreshExamples}
            onSaveTrigger={handleSaveTriggerOnly}
            onOpenSavedTriggers={openSavedTriggersModal}
          />
        )}

        {/* ================= Step 2: 감정 선택 (목록) ================= */}
        {step === 2 && !emotionSet && !showEmotionDetail && (
          <EmotionGrid
            selectedEmotion={selectedEmotion}
            onSelect={(emotion) => handleEmotionSelect(emotion)}
          />
        )}

        {/* ================= Step 2: 감정 상세 ================= */}
        {step === 2 &&
          !emotionSet &&
          showEmotionDetail &&
          selectedEmotionData && (
            <EmotionDetailCard
              emotion={selectedEmotionData}
              confirmed={emotionDetailConfirmed}
              onConfirmChange={setEmotionDetailConfirmed}
              onBack={() => {
                setShowEmotionDetail(false);
                setSelectedEmotionData(null);
                setEmotionDetailConfirmed(false);
              }}
              onSelect={handleSelectThisEmotion}
            />
          )}

        {/* ================= Step 2: AI 자동사고 생성 → 1개 선택 ================= */}
        {step === 2 && emotionSet && (
        <ThoughtSelectionCard
          selectedEmotion={selectedEmotion}
          selectedEmotionData={selectedEmotionData}
          loading={loading}
          error={error}
          generatedThoughts={generatedThoughts}
          selectedThoughtIndex={selectedThoughtIndex}
          customThought={customThought}
          currentPrefetchKey={currentPrefetchKey}
          activeNoteTrigger={activeNoteTrigger}
          onSelectThought={handleThoughtSelect}
          onRegenerate={() => {
            prefetchPromiseRef.current = null;
            prefetchKeyRef.current = null;
            void finalizeEmotionAndShowThoughts(selectedEmotion);
            }}
            onRetry={() => {
              prefetchPromiseRef.current = null;
              prefetchKeyRef.current = null;
              startPrefetchThoughts();
            }}
          onAddFavorite={(thought) =>
            addThoughtToFavorites(thought, selectedEmotion, emotionIntensity)
          }
          onLoadFavorites={() => void loadFavorites()}
          onCustomThoughtChange={handleCustomThoughtChange}
          onCustomThoughtSelect={handleCustomThoughtSelect}
          onSubmit={submitThoughtSelection}
          canSubmit={selectedThoughtIndex !== null}
        />
        )}

        {/* ================= Step 3 이상: 완료 ================= */}
        {step >= 3 && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <p className="text-green-800 mb-2">✓ 자동사고 체크 완료</p>
            <div className="space-y-2 text-slate-700">
              {emotionThoughtPairs.map((pair, i) => (
                <div
                  key={i}
                  className="bg-white p-3 rounded border border-green-300"
                >
                  <p className="text-sm mb-1">
                    <strong>{pair.emotion}</strong>
                    {pair.intensity != null && ` (강도: ${pair.intensity})`}
                  </p>
                  <p className="text-xs text-slate-600">"{pair.thought}"</p>
                </div>
              ))}
            </div>
            <p className="text-emerald-600 mt-3 text-base">
              인지오류를 검토해주세요.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
