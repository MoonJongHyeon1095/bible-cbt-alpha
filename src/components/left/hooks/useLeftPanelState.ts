import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import {
  analyzeCognitiveErrorDetails,
  COGNITIVE_ERRORS_BY_INDEX,
  type ErrorIndex,
  generateBurnsEmpathy,
  rankCognitiveErrors,
} from "../../../lib/ai";
import type { EmotionThoughtPair } from "../../../types";
import type { SelectedCognitiveError } from "../../../types/sessionHistory";
import { formatAutoTitle } from "../../../utils/formatAutoTitle";
import type { CbtMode } from "../../header/navigation/ModePicker";
import type { Pattern } from "../../feature/emotion-note/types";
import {
  createErrorDetailsAPI,
  createNoteAPI,
  fetchNotesAPI,
} from "../../feature/emotion-note/utils/api";
import {
  loadLocalPatterns,
  saveLocalPatterns,
} from "../../feature/emotion-note/utils/storage";

type BurnsEmpathyShape = {
  thoughtEmpathy: string;
  emotionEmpathy: string;
  iStatement: string;
  soothing: string;
  observedSelf: string;
};

type RankItem = {
  index: ErrorIndex;
  reason: string;
  evidenceQuote?: string;
};

type DetailItem = {
  index: ErrorIndex;
  analysis: string;
};

type UseLeftPanelStateParams = {
  step: number;
  emotionThoughtPairs: EmotionThoughtPair[];
  userInput: string;
  user: User | null;
  onSelectCognitiveErrors: (errors: SelectedCognitiveError[]) => void;
  onNext: () => void;
  mode: CbtMode;
};

export function useLeftPanelState({
  step,
  emotionThoughtPairs,
  userInput,
  user,
  onSelectCognitiveErrors,
  onNext,
  mode,
}: UseLeftPanelStateParams) {
  const currentPair =
    emotionThoughtPairs.length > 0 ? emotionThoughtPairs[0] : null;

  const isLite = mode.detailMode === "lite";

  // 1) Burns 공감
  const [burnsEmpathy, setBurnsEmpathy] = useState<BurnsEmpathyShape | null>(
    null
  );
  const [empathyLoading, setEmpathyLoading] = useState(false);
  const [empathyError, setEmpathyError] = useState<string | null>(null);

  // 2) 목표 감정 강도
  const [targetIntensity, setTargetIntensity] = useState(30);
  const [intensitySet, setIntensitySet] = useState(false);
  const [showIntensityModal, setShowIntensityModal] = useState(false);

  // 2.a 랭킹
  const [ranked, setRanked] = useState<RankItem[] | null>(null);
  const [rankLoading, setRankLoading] = useState(false);
  const [rankError, setRankError] = useState<string | null>(null);

  // 2.b 상세(후보만)
  const [detailByIndex, setDetailByIndex] = useState<
    Partial<Record<ErrorIndex, DetailItem>>
  >({});
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const PAGE_SIZE = 3;

  const [detailOrder, setDetailOrder] = useState<ErrorIndex[]>([]);
  const [pageIndex, setPageIndex] = useState(0);

  // 선택(최대 2개)
  const [selected, setSelected] = useState<ErrorIndex[]>([]);
  const [pinnedSelected, setPinnedSelected] = useState<ErrorIndex[]>([]);
  const [savingErrorId, setSavingErrorId] = useState<ErrorIndex | null>(null);
  const [activeNoteIdState, setActiveNoteIdState] = useState<string | null>(
    null
  );
  const [savedTriggerNotes, setSavedTriggerNotes] = useState<
    { id: string; title: string; trigger: string }[]
  >([]);
  const [savedErrorKeys, setSavedErrorKeys] = useState<Set<string>>(
    () => new Set()
  );

  const MIN_TRIGGER_LENGTH = 10;

  const pairKey = useMemo(() => {
    if (!currentPair) return "";
    return `${currentPair.emotion}::${currentPair.thought}::${currentPair.intensity}`;
  }, [currentPair]);

  const header = useMemo(() => {
    if (step < 3) {
      return {
        badge: "STEP 3 · 준비 중",
        title: "인지오류 검토 단계로 곧 이동해요.",
        desc: "감정과 자동사고를 먼저 선택해주세요.",
      };
    }

    if (step === 3 && !intensitySet) {
      return {
        badge: "STEP 3 · 공감 및 목표",
        title: "생각 속 오류를 함께 찾아볼까요?",
        desc: "숨어있는 오류 가능성을 검토해보려 합니다.",
      };
    }

    if (step === 3 && intensitySet) {
      return {
        badge: "STEP 3 · 인지오류 검토",
        title: "인지오류 중 2가지를 선택해주세요.",
        desc: "제안된 오류를 검토하고 맞다고 느끼는 것을 선택하세요.",
      };
    }

    return {
      badge: "STEP 4 · 대안사고 준비",
      title: "이제 대안사고를 만들 준비가 되었어요.",
      desc: "선택한 오류를 바탕으로 오른쪽에서 대안사고를 확인하세요.",
    };
  }, [step, intensitySet]);

  const lastPairKeyRef = useRef<string>("");

  useEffect(() => {
    if (!pairKey) return;

    if (lastPairKeyRef.current && lastPairKeyRef.current !== pairKey) {
      setBurnsEmpathy(null);
      setEmpathyError(null);
      setEmpathyLoading(false);

      setTargetIntensity(30);
      setIntensitySet(false);
      setShowIntensityModal(false);

      setRanked(null);
      setRankLoading(false);
      setRankError(null);

      setDetailByIndex({});
      setDetailLoading(false);
      setDetailError(null);

      setDetailOrder([]);
      setPageIndex(0);
      setSelected([]);
      setPinnedSelected([]);
    }

    lastPairKeyRef.current = pairKey;
  }, [pairKey]);

  const mapServerNote = useCallback(
    (row: any) => ({
      id: String(row.id ?? ""),
      title: row.title ?? "",
      trigger: row.trigger ?? row.trigger_text ?? "",
    }),
    []
  );

  const persistActiveNote = useCallback((note: {
    id: string;
    title: string;
    trigger: string;
  } | null) => {
    setActiveNoteIdState(note?.id ?? null);
    try {
      if (note) {
        sessionStorage.setItem(
          "cbt_active_note",
          JSON.stringify({
            noteId: note.id,
            title: note.title,
            trigger: note.trigger,
          })
        );
      } else {
        sessionStorage.removeItem("cbt_active_note");
      }
      window.dispatchEvent(new Event("cbt-active-note-update"));
    } catch {
      /* ignore */
    }
  }, []);

  const loadServerNotes = useCallback(async () => {
    try {
      const { ok, payload } = await fetchNotesAPI(false);
      if (!ok) throw new Error(payload?.error || "노트를 불러오지 못했습니다.");
      const notes = Array.isArray(payload?.notes)
        ? payload.notes.map(mapServerNote)
        : [];
      setSavedTriggerNotes(notes);
      return notes;
    } catch (e) {
      console.error("노트 로드 실패:", e);
      return [];
    }
  }, [mapServerNote]);

  const loadLocalNotes = useCallback(() => {
    const patterns = loadLocalPatterns();
    const notes = patterns.map((pattern) => ({
      id: pattern.id,
      title: pattern.title,
      trigger: pattern.trigger,
    }));
    setSavedTriggerNotes(notes);
    return notes;
  }, []);

  useEffect(() => {
    const key = "cbt_active_note";
    const read = () => {
      try {
        const raw = sessionStorage.getItem(key);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed?.noteId) setActiveNoteIdState(String(parsed.noteId));
      } catch {
        /* ignore */
      }
    };
    read();
    const handler = () => read();
    window.addEventListener("cbt-active-note-update", handler as any);
    return () => {
      window.removeEventListener("cbt-active-note-update", handler as any);
    };
  }, []);

  useEffect(() => {
    if (user) {
      void loadServerNotes();
      return;
    }
    loadLocalNotes();
  }, [loadLocalNotes, loadServerNotes, user]);

  useEffect(() => {
    const key = "cbt_saved_error_keys";
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setSavedErrorKeys(new Set(parsed.map((id) => String(id))));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const persistSavedErrorKey = useCallback((key: string) => {
    setSavedErrorKeys((prev) => {
      const next = new Set(prev);
      next.add(key);
      try {
        sessionStorage.setItem(
          "cbt_saved_error_keys",
          JSON.stringify(Array.from(next))
        );
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const resolveServerNote = useCallback(
    async (triggerText: string, title: string) => {
      let notes = savedTriggerNotes;
      let noteId = activeNoteIdState;
      let noteTitle = "";
      let noteTrigger = "";

      if (!noteId && notes.length === 0) {
        notes = await loadServerNotes();
      }

      if (noteId) {
        const matchedById = notes.find((note) => note.id === noteId);
        if (matchedById) {
          noteTitle = matchedById.title;
          noteTrigger = matchedById.trigger;
        }
      }

      if (!noteId) {
        const existing = notes.find((note) => note.trigger === triggerText);
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
          throw new Error(payload?.error || "상황을 저장하지 못했습니다.");
        }
        const created = mapServerNote(payload.note);
        setSavedTriggerNotes((prev) => [created, ...prev]);
        noteId = created.id;
        noteTitle = created.title;
        noteTrigger = created.trigger;
      }

      const activeNote = {
        id: noteId,
        title: noteTitle || title,
        trigger: noteTrigger || triggerText,
      };
      persistActiveNote(activeNote);
      return activeNote;
    },
    [
      activeNoteIdState,
      loadServerNotes,
      mapServerNote,
      persistActiveNote,
      savedTriggerNotes,
    ]
  );

  const resolveLocalNote = useCallback(
    (patterns: Pattern[], triggerText: string, title: string, nowIso: string) =>
      (activeNoteIdState
        ? patterns.find((p) => p.id === activeNoteIdState)
        : null) ?? patterns.find((p) => p.trigger === triggerText) ?? {
        id: Date.now().toString(),
        title,
        trigger: triggerText,
        behavior: "",
        frequency: 1,
        timestamp: nowIso,
        details: [],
        alternatives: [],
        behaviorDetails: [],
        errorDetails: [],
      },
    [activeNoteIdState]
  );

  const isStale = useCallback(
    (keyAtStart: string) => lastPairKeyRef.current !== keyAtStart,
    []
  );

  const generateEmpathy = useCallback(async () => {
    if (!currentPair) return;
    const keyAtStart = pairKey;

    setEmpathyLoading(true);
    setEmpathyError(null);

    try {
      const pairIntensity = currentPair.intensity ?? null;
      const result = await generateBurnsEmpathy(
        userInput,
        currentPair.emotion,
        currentPair.thought,
        pairIntensity
      );
      if (isStale(keyAtStart)) return;

      setBurnsEmpathy(result);
      if (pairIntensity != null) {
        setTargetIntensity(Math.round(pairIntensity * 0.6));
      } else {
        setTargetIntensity(30);
      }
    } catch (err) {
      if (isStale(keyAtStart)) return;
      setEmpathyError(
        err instanceof Error ? err.message : "오류가 발생했습니다."
      );
    } finally {
      if (isStale(keyAtStart)) return;
      setEmpathyLoading(false);
    }
  }, [currentPair, isStale, pairKey, userInput]);

  const handleIntensitySet = useCallback(() => {
    setIntensitySet(true);
  }, []);

  const resetIntensitySet = useCallback(() => {
    setIntensitySet(false);
  }, []);

  const fetchDetails = useCallback(
    async (candidates: ErrorIndex[]) => {
      if (!currentPair) return;
      if (candidates.length === 0) return;

      const keyAtStart = pairKey;

      setDetailOrder((prev) => {
        const next = [...prev];
        candidates.forEach((idx) => {
          if (!next.includes(idx)) next.push(idx);
        });
        return next;
      });

      setDetailLoading(true);
      setDetailError(null);

      try {
        const detail = await analyzeCognitiveErrorDetails(
          userInput,
          currentPair.thought,
          candidates
        );

        if (isStale(keyAtStart)) return;

        setDetailByIndex((prev) => {
          const next = { ...prev };
          for (const e of detail.errors) {
            next[e.index] = e;
          }
          return next;
        });
      } catch (err) {
        if (isStale(keyAtStart)) return;
        setDetailError(
          err instanceof Error ? err.message : "오류가 발생했습니다."
        );
      } finally {
        if (isStale(keyAtStart)) return;
        setDetailLoading(false);
      }
    },
    [currentPair, isStale, pairKey, userInput]
  );

  const runRankThenKickoffTop3Details = useCallback(async () => {
    if (!currentPair) return;
    const keyAtStart = pairKey;

    setRankLoading(true);
    setRankError(null);
    setDetailError(null);

    try {
      const r = await rankCognitiveErrors(userInput, currentPair.thought);
      if (isStale(keyAtStart)) return;

      setRanked(r.ranked);

      setDetailByIndex({});
      setDetailOrder([]);
      setPageIndex(0);
      setSelected([]);
      setPinnedSelected([]);

      const top3 = r.ranked.map((x) => x.index).slice(0, 3);

      if (top3.length > 0) {
        void fetchDetails(top3);
      }
    } catch (err) {
      if (isStale(keyAtStart)) return;
      setRankError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      if (isStale(keyAtStart)) return;
      setRankLoading(false);
    }
  }, [currentPair, fetchDetails, isStale, pairKey, userInput]);

  // Step3 진입: Burns 시작
  useEffect(() => {
    if (step === 3 && currentPair && !burnsEmpathy && !empathyLoading) {
      void generateEmpathy();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, currentPair, burnsEmpathy, empathyLoading]);

  // Step3 진입: 랭킹 시작(독립적으로)
  useEffect(() => {
    if (step === 3 && currentPair && !ranked && !rankLoading) {
      void runRankThenKickoffTop3Details();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, currentPair, ranked, rankLoading]);

  const rerollCandidates = useCallback(async () => {
    if (!currentPair) return;

    if (!ranked || ranked.length === 0) {
      await runRankThenKickoffTop3Details();
      return;
    }

    const exclude = new Set<ErrorIndex>();
    for (const idx of selected) exclude.add(idx);
    for (const k of Object.keys(detailByIndex)) {
      exclude.add(Number(k) as ErrorIndex);
    }

    const next: ErrorIndex[] = [];
    for (const item of ranked) {
      if (next.length >= 3) break;
      if (exclude.has(item.index)) continue;
      next.push(item.index);
    }

    if (next.length === 0) {
      toast.error("더 이상 새로운 인지오류 후보가 없습니다.");
      return;
    }

    setPinnedSelected(selected);
    setPageIndex(0);

    void fetchDetails(next);
  }, [
    currentPair,
    detailOrder,
    ranked,
    selected,
    detailByIndex,
    fetchDetails,
    runRankThenKickoffTop3Details,
  ]);

  const toggleSelect = useCallback((idx: ErrorIndex) => {
    setSelected((prev) => {
      if (prev.includes(idx)) {
        setPinnedSelected((pinned) => pinned.filter((x) => x !== idx));
        return prev.filter((x) => x !== idx);
      }
      if (prev.length >= 2) return prev;
      return [...prev, idx];
    });
  }, []);

  const handleSaveError = useCallback(
    async (idx: ErrorIndex) => {
      const meta = COGNITIVE_ERRORS_BY_INDEX[idx];
      if (!meta) return;

      const triggerText = userInput.trim();
      if (!triggerText) {
        toast.error("먼저 상황을 입력해주세요.");
        return;
      }
      if (triggerText.length < MIN_TRIGGER_LENGTH) {
        toast.error("상황을 10자 이상 입력해주세요.");
        return;
      }

      if (savingErrorId === idx) return;

      const errorDescription =
        detailByIndex[idx]?.analysis ?? meta.description ?? "";
      const now = new Date();
      const nowIso = now.toISOString();
      const title = formatAutoTitle(now);

      if (user) {
        try {
          setSavingErrorId(idx);
          const activeNote = await resolveServerNote(triggerText, title);
          const errorKey = `${activeNote.id}:${meta.id}`;
          if (savedErrorKeys.has(errorKey)) {
            toast.info("이미 저장된 인지오류입니다.");
            return;
          }
          const numericId = Number(activeNote.id);
          const resolvedId = Number.isNaN(numericId)
            ? activeNote.id
            : numericId;

          const { ok, payload } = await createErrorDetailsAPI({
            noteId: resolvedId,
            errors: [
              {
                errorLabel: meta.title,
                errorDescription,
              },
            ],
          });
          if (!ok) {
            throw new Error(payload?.error || "인지오류 저장에 실패했습니다.");
          }
          persistSavedErrorKey(errorKey);
          toast.success("인지오류가 저장되었습니다.");
        } catch (e) {
          console.error("인지오류 저장 실패:", e);
          toast.error("인지오류를 저장하지 못했습니다.");
        } finally {
          setSavingErrorId(null);
        }
        return;
      }

      try {
        setSavingErrorId(idx);
        const patterns = loadLocalPatterns();
        const note = resolveLocalNote(patterns, triggerText, title, nowIso);
        const errorKey = `${note.id}:${meta.id}`;
        if (savedErrorKeys.has(errorKey)) {
          toast.info("이미 저장된 인지오류입니다.");
          return;
        }

        const newError = {
          id: `${Date.now()}-${meta.id}`,
          noteId: note.id,
          errorLabel: meta.title,
          errorDescription,
          createdAt: nowIso,
        };

        const nextNote: Pattern = {
          ...note,
          errorDetails: [newError, ...(note.errorDetails ?? [])],
        };

        const updatedPatterns = [
          nextNote,
          ...patterns.filter((p) => p.id !== note.id),
        ];
        saveLocalPatterns(updatedPatterns);
        setSavedTriggerNotes(
          updatedPatterns.map((p) => ({
            id: p.id,
            title: p.title,
            trigger: p.trigger,
          }))
        );
        persistActiveNote({
          id: nextNote.id,
          title: nextNote.title,
          trigger: nextNote.trigger,
        });
        persistSavedErrorKey(errorKey);
        toast.success("인지오류가 저장되었습니다.");
      } catch (e) {
        console.error("인지오류 저장 실패:", e);
        toast.error("인지오류를 저장하지 못했습니다.");
      } finally {
        setSavingErrorId(null);
      }
    },
    [
      detailByIndex,
      persistActiveNote,
      persistSavedErrorKey,
      resolveLocalNote,
      resolveServerNote,
      savedErrorKeys,
      savingErrorId,
      user,
      userInput,
    ]
  );

  const isErrorSaved = useCallback(
    (idx: ErrorIndex) => {
      if (!activeNoteIdState) return false;
      const meta = COGNITIVE_ERRORS_BY_INDEX[idx];
      if (!meta) return false;
      return savedErrorKeys.has(`${activeNoteIdState}:${meta.id}`);
    },
    [activeNoteIdState, savedErrorKeys]
  );

  const handleConfirm2Errors = useCallback(() => {
    if (selected.length !== 2) return;

    const payload: SelectedCognitiveError[] = selected.flatMap((idx) => {
      const meta = COGNITIVE_ERRORS_BY_INDEX[idx];
      if (!meta) return [];
      return [
        {
          id: meta.id,
          index: meta.index,
          title: meta.title,
          detail: detailByIndex[idx]?.analysis,
        },
      ];
    });

    onSelectCognitiveErrors(payload);
    onNext();
  }, [detailByIndex, onNext, onSelectCognitiveErrors, selected]);

  const nonSelectedOrder = useMemo(
    () => detailOrder.filter((idx) => !pinnedSelected.includes(idx)),
    [detailOrder, pinnedSelected]
  );
  const orderedForPaging = useMemo(
    () => [...nonSelectedOrder].reverse(),
    [nonSelectedOrder]
  );
  const totalPages = Math.max(1, Math.ceil(orderedForPaging.length / PAGE_SIZE));
  const pageSlice = useMemo(() => {
    const start = pageIndex * PAGE_SIZE;
    return orderedForPaging.slice(start, start + PAGE_SIZE);
  }, [orderedForPaging, pageIndex]);

  useEffect(() => {
    if (pageIndex > totalPages - 1) {
      setPageIndex(Math.max(0, totalPages - 1));
    }
  }, [pageIndex, totalPages]);

  const pageIndices = pageSlice;

  const goPrevPage = useCallback(() => {
    setPinnedSelected(selected);
    setPageIndex((prev) => Math.max(0, prev - 1));
  }, [selected]);

  const goNextPage = useCallback(() => {
    setPinnedSelected(selected);
    setPageIndex((prev) => Math.min(totalPages - 1, prev + 1));
  }, [selected, totalPages]);

  const canConfirmSelection = useMemo(() => {
    if (selected.length !== 2) return false;
    const allDetailsReady = selected.every((idx) => detailByIndex[idx]);
    return allDetailsReady && !detailLoading && !rankLoading;
  }, [detailByIndex, detailLoading, rankLoading, selected]);

  return {
    burnsEmpathy,
    canConfirmSelection,
    currentPair,
    detailByIndex,
    detailError,
    detailLoading,
    pageIndices,
    pinnedSelected,
    pageIndex,
    totalPages,
    empathyError,
    empathyLoading,
    generateEmpathy,
    handleConfirm2Errors,
    handleIntensitySet,
    header,
    isLite,
    intensitySet,
    rankError,
    rankLoading,
    ranked,
    rerollCandidates,
    runRankThenKickoffTop3Details,
    selected,
    handleSaveError,
    savingErrorId,
    isErrorSaved,
    goPrevPage,
    goNextPage,
    setShowIntensityModal,
    setTargetIntensity,
    showIntensityModal,
    targetIntensity,
    toggleSelect,
    resetIntensitySet,
  };
}
