import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  analyzeCognitiveErrorDetails,
  COGNITIVE_ERRORS_BY_INDEX,
  rankCognitiveErrors,
  type ErrorIndex,
} from "../../../lib/ai";
import type { EmotionThoughtPair } from "../../../types";
import type { SelectedCognitiveError } from "../../../types/sessionHistory";
import type { DetailItem, RankItem } from "./useLeftPageTypes";

type UseCognitiveErrorCandidatesParams = {
  step: number;
  currentPair: EmotionThoughtPair | null;
  pairKey: string;
  userInput: string;
  onSelectCognitiveErrors: (errors: SelectedCognitiveError[]) => void;
  onNext: () => void;
};

const PAGE_SIZE = 3;

const rankCache = new Map<string, RankItem[]>();
const detailCache = new Map<
  string,
  {
    detailByIndex: Partial<Record<ErrorIndex, DetailItem>>;
    detailOrder: ErrorIndex[];
  }
>();

export function useCognitiveErrorCandidates({
  step,
  currentPair,
  pairKey,
  userInput,
  onSelectCognitiveErrors,
  onNext,
}: UseCognitiveErrorCandidatesParams) {
  const [ranked, setRanked] = useState<RankItem[] | null>(null);
  const [rankLoading, setRankLoading] = useState(false);
  const [rankError, setRankError] = useState<string | null>(null);

  const [detailByIndex, setDetailByIndex] = useState<
    Partial<Record<ErrorIndex, DetailItem>>
  >({});
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailOrder, setDetailOrder] = useState<ErrorIndex[]>([]);
  const [pageIndex, setPageIndex] = useState(0);

  const [selected, setSelected] = useState<ErrorIndex[]>([]);
  const [pinnedSelected, setPinnedSelected] = useState<ErrorIndex[]>([]);

  const lastPairKeyRef = useRef<string>("");

  const isStale = useCallback(
    (keyAtStart: string) => lastPairKeyRef.current !== keyAtStart,
    []
  );

  useEffect(() => {
    if (!pairKey) return;

    if (lastPairKeyRef.current && lastPairKeyRef.current !== pairKey) {
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

    const cachedRank = rankCache.get(pairKey);
    if (cachedRank) {
      setRanked(cachedRank);
      setRankError(null);
      setRankLoading(false);
    }

    const cachedDetail = detailCache.get(pairKey);
    if (cachedDetail) {
      setDetailByIndex(cachedDetail.detailByIndex);
      setDetailOrder(cachedDetail.detailOrder);
      setDetailError(null);
      setDetailLoading(false);
      setPageIndex(0);
      setSelected([]);
      setPinnedSelected([]);
    }
  }, [pairKey]);

  const fetchDetails = useCallback(
    async (candidates: ErrorIndex[]) => {
      if (!currentPair) return;
      if (candidates.length === 0) return;

      const keyAtStart = pairKey;
      const cachedDetail = detailCache.get(pairKey);
      if (cachedDetail) {
        const hasAll = candidates.every(
          (idx) => cachedDetail.detailByIndex[idx]
        );
        if (hasAll) {
          setDetailByIndex(cachedDetail.detailByIndex);
          setDetailOrder(cachedDetail.detailOrder);
          setDetailError(null);
          setDetailLoading(false);
          return;
        }
      }

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
          detailCache.set(pairKey, {
            detailByIndex: next,
            detailOrder: Object.keys(next).map((k) => Number(k) as ErrorIndex),
          });
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

    const cachedRank = rankCache.get(pairKey);
    if (cachedRank) {
      setRanked(cachedRank);
      setRankError(null);
      setRankLoading(false);

      const cachedDetail = detailCache.get(pairKey);
      if (cachedDetail) {
        setDetailByIndex(cachedDetail.detailByIndex);
        setDetailOrder(cachedDetail.detailOrder);
        setDetailError(null);
        setDetailLoading(false);
        setPageIndex(0);
        setSelected([]);
        setPinnedSelected([]);
        return;
      }

      const top3 = cachedRank.map((x) => x.index).slice(0, 3);
      if (top3.length > 0) {
        void fetchDetails(top3);
      }
      return;
    }

    setRankLoading(true);
    setRankError(null);
    setDetailError(null);

    try {
      const r = await rankCognitiveErrors(userInput, currentPair.thought);
      if (isStale(keyAtStart)) return;

      setRanked(r.ranked);
      rankCache.set(pairKey, r.ranked);

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
  const totalPages = Math.max(
    1,
    Math.ceil(orderedForPaging.length / PAGE_SIZE)
  );
  const pageSlice = useMemo(() => {
    const start = pageIndex * PAGE_SIZE;
    return orderedForPaging.slice(start, start + PAGE_SIZE);
  }, [orderedForPaging, pageIndex]);

  useEffect(() => {
    if (pageIndex > totalPages - 1) {
      setPageIndex(Math.max(0, totalPages - 1));
    }
  }, [pageIndex, totalPages]);

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
    canConfirmSelection,
    detailByIndex,
    detailError,
    detailLoading,
    goNextPage,
    goPrevPage,
    handleConfirm2Errors,
    pageIndex,
    pageIndices: pageSlice,
    pinnedSelected,
    rankError,
    rankLoading,
    ranked,
    rerollCandidates,
    runRankThenKickoffTop3Details,
    selected,
    toggleSelect,
    totalPages,
  };
}
