import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { SelectedCognitiveError } from "../../../types/sessionHistory";
import { MinimalFloatingNextButton } from "../../common/MinimalFloatingNextButton";
import { MinimalCognitiveErrorCard } from "./components/MinimalCognitiveErrorCard";
import { MinimalCognitiveErrorErrorState } from "./components/MinimalCognitiveErrorErrorState";
import { MinimalCognitiveErrorHeaderSection } from "./components/MinimalCognitiveErrorHeaderSection";
import { MinimalCognitiveErrorLoadingState } from "./components/MinimalCognitiveErrorLoadingState";
import { useCognitiveErrorRanking } from "./hooks/useCognitiveErrorRanking";

interface MinimalCognitiveErrorSectionProps {
  userInput: string;
  thought: string;
  onSelect: (errors: SelectedCognitiveError[]) => void;
}

const HEADER_TEXT = "고르라고 하지 말고 매번 새로고침 하는 거 같은 문구";

export function MinimalCognitiveErrorSection({
  userInput,
  thought,
  onSelect,
}: MinimalCognitiveErrorSectionProps) {
  const {
    currentRankItem,
    currentDetail,
    currentMeta,
    loading,
    error,
    rankLoading,
    handleNext,
    reload,
  } = useCognitiveErrorRanking({ userInput, thought });

  const handleSelect = () => {
    if (!currentRankItem) {
      toast.error("인지오류를 불러오는 중입니다.");
      return;
    }
    if (!currentMeta) return;
    if (!currentDetail) {
      toast.error("설명을 불러오는 중입니다.");
      return;
    }
    const payload: SelectedCognitiveError = {
      id: currentMeta.id,
      index: currentMeta.index,
      title: currentMeta.title,
      detail: currentDetail.analysis,
    };
    onSelect([payload]);
  };

  if (loading) {
    return (
      <MinimalCognitiveErrorLoadingState
        description={HEADER_TEXT}
        message="인지오류를 분석하고 있어요."
      />
    );
  }

  if (error) {
    return <MinimalCognitiveErrorErrorState error={error} onRetry={reload} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-12 pb-10">
      <div className="w-full max-w-xl space-y-8">
        <MinimalCognitiveErrorHeaderSection description={HEADER_TEXT} />

        {currentRankItem && (
          <MinimalCognitiveErrorCard
            title={currentMeta?.title ?? "인지오류"}
            infoLabel={currentMeta?.title}
            evidenceQuote={currentRankItem.evidenceQuote}
            reason={currentRankItem.reason}
            detail={currentDetail?.analysis}
          />
        )}

        <div className="flex flex-col gap-3">
          <MinimalFloatingNextButton
            onClick={handleSelect}
            ariaLabel="이 오류로 진행"
          />
          <button
            type="button"
            onClick={handleNext}
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
