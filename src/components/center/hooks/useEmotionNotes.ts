import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import type { EmotionThoughtPair } from "../../../types";
import type {
  EmotionNote,
  EmotionNoteDetail,
  EmotionNoteDetailWithNote,
} from "../types";
import { formatAutoTitle } from "../../../utils/formatAutoTitle";
import { validateUserText } from "../../../utils/validation";
import {
  createDetailAPI,
  createNoteAPI,
  deleteDetailAPI,
  fetchDetailsAPI,
  fetchNotesAPI,
} from "../utils/api";
import {
  flattenLocalDetails,
  getLocalNotes,
  saveLocalNotes,
} from "../utils/storage";

const MIN_TRIGGER_LENGTH = 10;

type ActiveNote = {
  id: string;
  title: string;
  trigger: string;
};

interface UseEmotionNotesParams {
  user: User | null;
  userInput: string;
  selectedEmotion: string;
  emotionIntensity: number;
  isDeep: boolean;
  emotionThoughtPairs: EmotionThoughtPair[];
  onSetEmotionThoughtPairs: (pairs: EmotionThoughtPair[]) => void;
  onNext: () => void;
  onScrollTop: () => void;
  onInputPreserveNote: (value: string) => void;
  onSetSelectedEmotion: (emotion: string) => void;
}

export function useEmotionNotes({
  user,
  userInput,
  selectedEmotion,
  emotionIntensity,
  isDeep,
  emotionThoughtPairs,
  onSetEmotionThoughtPairs,
  onNext,
  onScrollTop,
  onInputPreserveNote,
  onSetSelectedEmotion,
}: UseEmotionNotesParams) {
  const [showSavedDetailsModal, setShowSavedDetailsModal] = useState(false);
  const [savedDetails, setSavedDetails] = useState<EmotionNoteDetailWithNote[]>(
    []
  );
  const [savingDetailId, setSavingDetailId] = useState<string | null>(null);
  const [notesLoading, setNotesLoading] = useState(false);
  const [showSavedTriggersModal, setShowSavedTriggersModal] = useState(false);
  const [savedTriggerNotes, setSavedTriggerNotes] = useState<EmotionNote[]>([]);
  const [savingTrigger, setSavingTrigger] = useState(false);
  const [activeNote, setActiveNoteState] = useState<ActiveNote | null>(null);
  const [savedDetailKeys, setSavedDetailKeys] = useState<Set<string>>(
    () => new Set()
  );

  const savingDetail = savingDetailId !== null;
  const activeNoteIdRef = useRef<string | null>(null);

  const useServerNotes = Boolean(user);

  const setActiveNote = (
    noteId: string | null,
    title?: string | null,
    trigger?: string | null
  ) => {
    if (noteId) {
      setActiveNoteState({
        id: noteId,
        title: title ?? "",
        trigger: trigger ?? "",
      });
    } else {
      setActiveNoteState(null);
    }

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

  const clearActiveNote = () => setActiveNote(null, null, null);

  const mapServerNote = (row: any): EmotionNote => ({
    id: row.id?.toString() ?? `${Date.now()}`,
    title: row.title ?? "",
    trigger: row.trigger ?? row.trigger_text ?? "",
    behavior: row.behavior ?? "",
    frequency: Number(row.frequency) || 1,
    createdAt: row.created_at ?? new Date().toISOString(),
    timestamp: row.created_at ?? new Date().toISOString(),
  });

  const mapServerDetail = (row: any): EmotionNoteDetailWithNote => {
    const resolvedNoteId =
      row.note_id ??
      row.noteId ??
      row.note?.id ??
      row.emotion_note_id ??
      row.emotion_notes?.id ??
      row.emotion_note?.id ??
      null;

    return {
      id: row.id?.toString() ?? `${Date.now()}`,
      noteId: resolvedNoteId != null ? resolvedNoteId.toString() : "",
      automaticThought: row.automatic_thought ?? row.automaticThought ?? "",
      emotion: row.emotion ?? "",
      alternative: row.alternative ?? "",
      createdAt: row.created_at ?? new Date().toISOString(),
      noteTitle:
        row.noteTitle ??
        row.note_title ??
        row.emotion_notes?.title ??
        row.note?.title ??
        "",
      noteTrigger:
        row.noteTrigger ??
        row.note_trigger ??
        row.emotion_notes?.trigger ??
        row.emotion_notes?.trigger_text ??
        row.note?.trigger ??
        row.note?.trigger_text ??
        "",
    };
  };

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

  useEffect(() => {
    const key = "cbt_saved_detail_keys";
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setSavedDetailKeys(new Set(parsed.map((id) => String(id))));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const persistSavedDetailKey = (key: string) => {
    setSavedDetailKeys((prev) => {
      const next = new Set(prev);
      next.add(key);
      try {
        sessionStorage.setItem(
          "cbt_saved_detail_keys",
          JSON.stringify(Array.from(next))
        );
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const handleSaveTriggerOnly = async () => {
    if (savingTrigger) return;

    const triggerText = userInput.trim();
    if (!triggerText) {
      toast.error("먼저 상황을 입력해주세요.");
      return;
    }
    if (triggerText.length < MIN_TRIGGER_LENGTH) {
      toast.error("상황을 10자 이상 입력해주세요.");
      return;
    }

    const now = new Date();
    const title = activeNote?.title ?? formatAutoTitle(now);

    setSavingTrigger(true);
    await new Promise((resolve) => setTimeout(resolve, 0));

    if (useServerNotes) {
      const existing = savedTriggerNotes.find(
        (note) => note.trigger === triggerText
      );
      if (existing) {
        setActiveNote(existing.id, existing.title, existing.trigger);
        toast.success("이미 저장된 상황을 불러왔습니다.");
        setSavingTrigger(false);
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
        setSavingTrigger(false);
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
      setSavingTrigger(false);
      return;
    }

    try {
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
    } finally {
      setSavingTrigger(false);
    }
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
  const closeSavedDetailsModal = () => setShowSavedDetailsModal(false);

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

  const openSavedDetailsModal = async () => {
    setShowSavedDetailsModal(true);
    await fetchSavedDetails(activeNoteIdRef.current ?? undefined);
  };

  useEffect(() => {
    if (showSavedDetailsModal) {
      void fetchSavedDetails(activeNoteIdRef.current ?? undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSavedDetailsModal, useServerNotes]);

  const addThoughtToFavorites = async (
    thought: string,
    emotion: string,
    _intensity: number
  ) => {
    if (savingDetail) return;
    if (!userInput.trim()) {
      toast.error("상황을 먼저 입력해주세요.");
      return;
    }

    const triggerText = userInput.trim();
    const now = new Date();
    const nowIso = now.toISOString();
    const title = activeNote?.title ?? formatAutoTitle(now);

    setSavingDetailId(thought || "__custom__");

    if (useServerNotes) {
      try {
        setNotesLoading(true);
        let noteId = activeNote?.id ?? null;
        let noteTitle = activeNote?.title ?? title;
        let noteTrigger = activeNote?.trigger ?? triggerText;

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

        const detailKey = `${noteId}:${thought}`;
        if (savedDetailKeys.has(detailKey)) {
          toast.info("이미 저장된 자동사고입니다.");
          return;
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
        persistSavedDetailKey(detailKey);
        toast.success("자동사고가 감정 노트에 저장되었습니다.");
        return;
      } catch (e) {
        console.error("감정 노트 저장 실패:", e);
        toast.error("감정 노트를 저장하지 못했습니다.");
        return;
      } finally {
        setNotesLoading(false);
        setSavingDetailId(null);
      }
    }

    try {
      const notes = getLocalNotes();
      const existingNote =
        notes.find((n) => n.id === activeNote?.id) ||
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

      const detailKey = `${noteToUse.id}:${thought}`;
      if (savedDetailKeys.has(detailKey)) {
        toast.info("이미 저장된 자동사고입니다.");
        return;
      }

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
        {
          ...detail,
          noteTitle: noteToUse.title,
          noteTrigger: noteToUse.trigger,
        },
        ...prev,
      ]);
      persistSavedDetailKey(detailKey);
      toast.success("자동사고가 감정 노트에 저장되었습니다.");
    } finally {
      setSavingDetailId(null);
    }
  };

  const loadFromFavorites = (detail: EmotionNoteDetailWithNote) => {
    const emotion = detail.emotion || selectedEmotion;
    const thought = detail.automaticThought;
    const storedIntensity = isDeep ? emotionIntensity : null;
    const validation = validateUserText(thought);
    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }

    const matchedNote =
      savedTriggerNotes.find((n) => n.id === detail.noteId) ||
      (detail.noteTrigger
        ? savedTriggerNotes.find((n) => n.trigger === detail.noteTrigger)
        : null);
    const resolvedNoteId = matchedNote?.id || detail.noteId;
    const resolvedTitle = matchedNote?.title || detail.noteTitle;
    const resolvedTrigger = matchedNote?.trigger || detail.noteTrigger;

    if (detail.noteTrigger) {
      onInputPreserveNote(detail.noteTrigger);
    }
    onSetSelectedEmotion(emotion);
    setShowSavedDetailsModal(false);
    if (resolvedNoteId) {
      setActiveNote(resolvedNoteId, resolvedTitle, resolvedTrigger);
    }

    const newPair: EmotionThoughtPair = {
      emotion,
      intensity: storedIntensity,
      thought,
    };

    const nextPairs = [
      ...emotionThoughtPairs.filter((pair) => pair.emotion !== newPair.emotion),
      newPair,
    ];
    onSetEmotionThoughtPairs(nextPairs);

    onScrollTop();
    onNext();
  };

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

  return {
    useServerNotes,
    showSavedDetailsModal,
    showSavedTriggersModal,
    savedDetails,
    savedTriggerNotes,
    notesLoading,
    savingTrigger,
    savingDetail,
    savingDetailId,
    activeNoteId: activeNote?.id ?? null,
    activeNoteTitle: activeNote?.title ?? null,
    activeNoteTrigger: activeNote?.trigger ?? null,
    setActiveNote,
    clearActiveNote,
    handleSaveTriggerOnly,
    openSavedTriggersModal,
    closeSavedTriggersModal,
    openSavedDetailsModal,
    closeSavedDetailsModal,
    addThoughtToFavorites,
    isDetailSaved: (thought: string) => {
      if (!activeNote?.id) return false;
      const text = thought.trim();
      if (!text) return false;
      return savedDetailKeys.has(`${activeNote.id}:${text}`);
    },
    loadFromFavorites,
    removeFromFavorites,
  };
}
