import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  analyzeCognitiveErrorDetails,
  COGNITIVE_ERRORS_BY_INDEX,
  type ErrorIndex,
  generateBurnsEmpathy,
  rankCognitiveErrors,
} from "../../../lib/ai";
import type { EmotionThoughtPair } from "../../../types";
import type { SelectedCognitiveError } from "../../../types/sessionHistory";
import type { CbtMode } from "../../header/navigation/ModePicker";

type BurnsEmpathyShape = {
  thoughtEmpathy: string;
  emotionEmpathy: string;
  iStatement: string;
  question: string;
  soothing: string;
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
  onSelectCognitiveErrors: (errors: SelectedCognitiveError[]) => void;
  onNext: () => void;
  mode: CbtMode;
};

export function useLeftPanelState({
  step,
  emotionThoughtPairs,
  userInput,
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
      const pairIntensity = currentPair.intensity ?? 50;
      const result = await generateBurnsEmpathy(
        userInput,
        currentPair.emotion,
        currentPair.thought,
        pairIntensity
      );
      if (isStale(keyAtStart)) return;

      setBurnsEmpathy(result);
      setTargetIntensity(Math.round(pairIntensity * 0.6));
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
    goPrevPage,
    goNextPage,
    setShowIntensityModal,
    setTargetIntensity,
    showIntensityModal,
    targetIntensity,
    toggleSelect,
  };
}
