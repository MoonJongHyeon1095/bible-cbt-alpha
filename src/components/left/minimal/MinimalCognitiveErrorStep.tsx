import { RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  analyzeCognitiveErrorDetails,
  COGNITIVE_ERRORS_BY_INDEX,
  rankCognitiveErrors,
  type ErrorIndex,
} from "../../../lib/ai";
import type { SelectedCognitiveError } from "../../../types/sessionHistory";
import { MinimalLoadingScreen } from "../../center/minimal/MinimalLoadingScreen";
import { MinimalFloatingNextButton } from "../../common/MinimalFloatingNextButton";

interface MinimalCognitiveErrorStepProps {
  userInput: string;
  thought: string;
  onSelect: (errors: SelectedCognitiveError[]) => void;
}

type DetailItem = {
  index: ErrorIndex;
  analysis: string;
};

const BATCH_SIZE = 3;

export function MinimalCognitiveErrorStep({
  userInput,
  thought,
  onSelect,
}: MinimalCognitiveErrorStepProps) {
  const [ranked, setRanked] = useState<
    Array<{ index: ErrorIndex; reason: string; evidenceQuote?: string }>
  >([]);
  const [detailByIndex, setDetailByIndex] = useState<
    Partial<Record<ErrorIndex, DetailItem>>
  >({});
  const [pageIndex, setPageIndex] = useState(0);
  const [withinIndex, setWithinIndex] = useState(0);
  const [rankLoading, setRankLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setRanked([]);
    setDetailByIndex({});
    setPageIndex(0);
    setWithinIndex(0);
    setError(null);
  };

  const fetchDetails = async (indices: ErrorIndex[]) => {
    if (!indices.length) return;
    setDetailLoading(true);
    try {
      const detail = await analyzeCognitiveErrorDetails(
        userInput,
        thought,
        indices,
      );
      setDetailByIndex((prev) => {
        const next = { ...prev };
        detail.errors.forEach((item) => {
          next[item.index] = { index: item.index, analysis: item.analysis };
        });
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setDetailLoading(false);
    }
  };

  const loadRanked = async () => {
    setRankLoading(true);
    resetState();
    try {
      const result = await rankCognitiveErrors(userInput, thought);
      setRanked(result.ranked);
      const firstBatch = result.ranked
        .slice(0, BATCH_SIZE)
        .map((item) => item.index);
      await fetchDetails(firstBatch);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setRankLoading(false);
    }
  };

  useEffect(() => {
    if (!userInput.trim() || !thought.trim()) return;
    void loadRanked();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInput, thought]);

  const currentIndices = useMemo(() => {
    const start = pageIndex * BATCH_SIZE;
    return ranked.slice(start, start + BATCH_SIZE).map((item) => item.index);
  }, [pageIndex, ranked]);

  useEffect(() => {
    const missing = currentIndices.filter((idx) => !detailByIndex[idx]);
    if (missing.length === 0) return;
    void fetchDetails(missing);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndices]);

  useEffect(() => {
    setWithinIndex(0);
  }, [pageIndex]);

  const currentRankItem = useMemo(() => {
    const start = pageIndex * BATCH_SIZE;
    return ranked[start + withinIndex] ?? null;
  }, [pageIndex, ranked, withinIndex]);

  const currentDetail = currentRankItem
    ? detailByIndex[currentRankItem.index]
    : null;

  const handleNext = async () => {
    if (rankLoading || detailLoading) return;
    if (withinIndex < currentIndices.length - 1) {
      setWithinIndex((prev) => prev + 1);
      return;
    }
    const nextStart = (pageIndex + 1) * BATCH_SIZE;
    if (nextStart < ranked.length) {
      setPageIndex((prev) => prev + 1);
      return;
    }
    void loadRanked();
  };

  const handleSelect = () => {
    if (!currentRankItem) {
      toast.error("인지오류를 불러오는 중입니다.");
      return;
    }
    const currentMeta = COGNITIVE_ERRORS_BY_INDEX[currentRankItem.index];
    if (!currentMeta) return;
    const detail = detailByIndex[currentRankItem.index];
    if (!detail) {
      toast.error("설명을 불러오는 중입니다.");
      return;
    }
    const payload: SelectedCognitiveError = {
      id: currentMeta.id,
      index: currentMeta.index,
      title: currentMeta.title,
      detail: detail.analysis,
    };
    onSelect([payload]);
  };

  const loading = rankLoading && ranked.length === 0;

  if (loading) {
    return <MinimalLoadingScreen message="인지오류를 분석하고 있어요." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-12 pb-10">
        <div className="w-full max-w-md text-center space-y-4">
          <p className="text-base text-slate-600">{error}</p>
          <button
            type="button"
            onClick={() => void loadRanked()}
            className="rounded-3xl border border-slate-300 bg-white/90 px-6 py-3 text-sm font-medium text-slate-700"
          >
            다시 불러오기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-12 pb-10">
      <div className="w-full max-w-xl space-y-8">
        <div className="space-y-3">
          <p className="text-base sm:text-lg text-slate-500 leading-relaxed">
            고르라고 하지 말고 매번 새로고침 하는 거 같은 문구
          </p>
        </div>

        {currentRankItem && (
          <div className="w-full rounded-3xl border border-slate-200 bg-white/80 px-6 py-5 text-left">
            <p className="text-base sm:text-lg font-semibold text-slate-900">
              {COGNITIVE_ERRORS_BY_INDEX[currentRankItem.index]?.title ??
                "인지오류"}
            </p>
            {currentRankItem.evidenceQuote && (
              <p className="mt-2 text-xs sm:text-sm text-slate-500">
                “{currentRankItem.evidenceQuote}”
              </p>
            )}
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
              {currentRankItem.reason}
            </p>
            {currentDetail ? (
              <p className="mt-3 text-sm sm:text-base text-slate-700 leading-relaxed">
                {currentDetail.analysis}
              </p>
            ) : (
              <div className="mt-3 flex items-center gap-3 text-sm text-slate-500">
                <div className="size-4 rounded-full border-2 border-slate-300 border-t-transparent animate-spin" />
                <span>설명을 불러오는 중입니다.</span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <MinimalFloatingNextButton
            onClick={handleSelect}
            ariaLabel="이 오류로 진행"
          />
          <button
            type="button"
            onClick={() => void handleNext()}
            aria-label="다른 오류 보기"
            disabled={rankLoading}
            className={`inline-flex size-8 items-center justify-center text-slate-500 transition active:scale-95 ${
              rankLoading
                ? "opacity-40 cursor-not-allowed"
                : "hover:text-slate-900"
            }`}
          >
            <RefreshCw className="size-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
