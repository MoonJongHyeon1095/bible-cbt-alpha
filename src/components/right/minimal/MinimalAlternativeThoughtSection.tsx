import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import type { EmotionThoughtPair } from "../../../types";
import type { SelectedCognitiveError } from "../../../types/sessionHistory";
import { MinimalFloatingNextButton } from "../../common/MinimalFloatingNextButton";
import { MinimalStepHeaderSection } from "../../common/MinimalStepHeaderSection";
import { MinimalAlternativeThoughtBodySection } from "./components/MinimalAlternativeThoughtBodySection";
import { MinimalAlternativeThoughtErrorState } from "./components/MinimalAlternativeThoughtErrorState";
import { MinimalAlternativeThoughtLoadingState } from "./components/MinimalAlternativeThoughtLoadingState";
import { useAlternativeThoughts } from "./hooks/useAlternativeThoughts";

interface MinimalAlternativeThoughtSectionProps {
  userInput: string;
  emotionThoughtPairs: EmotionThoughtPair[];
  selectedCognitiveErrors: SelectedCognitiveError[];
  seed: number;
  onSelect: (thought: string) => void;
}

const TITLE = "어떤 생각이 마음에 와닿나요?";
const DESCRIPTION = "가장 힘이 되는 생각을 골라주세요.";

export function MinimalAlternativeThoughtSection({
  userInput,
  emotionThoughtPairs,
  selectedCognitiveErrors,
  seed,
  onSelect,
}: MinimalAlternativeThoughtSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const {
    alternativeThoughts,
    thoughtsLoading,
    thoughtsError,
    generateAlternatives,
  } = useAlternativeThoughts({
    step: 4,
    userInput,
    emotionThoughtPairs,
    selectedCognitiveErrors,
  });

  useEffect(() => {
    if (seed === 0) return;
    void generateAlternatives({ force: true });
  }, [generateAlternatives, seed]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [alternativeThoughts]);

  const currentThought = alternativeThoughts[currentIndex];

  const handleNext = async () => {
    if (currentIndex < alternativeThoughts.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }
    await generateAlternatives({ force: true });
  };

  if (thoughtsLoading) {
    return (
      <MinimalAlternativeThoughtLoadingState
        title={TITLE}
        description={DESCRIPTION}
        message="대안사고를 정리하고 있어요."
      />
    );
  }

  if (thoughtsError) {
    return (
      <MinimalAlternativeThoughtErrorState
        error={thoughtsError}
        onRetry={() => void generateAlternatives({ force: true })}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-12 pb-10">
      <div className="w-full max-w-xl space-y-8">
        <MinimalStepHeaderSection title={TITLE} description={DESCRIPTION} />

        <MinimalAlternativeThoughtBodySection
          thought={currentThought?.thought ?? ""}
          technique={currentThought?.technique}
          fallback="대안사고를 불러오는 중입니다."
        />

        <div className="flex flex-col gap-3">
          <MinimalFloatingNextButton
            onClick={() =>
              currentThought?.thought && onSelect(currentThought.thought)
            }
            ariaLabel="이 생각으로 진행"
            disabled={!currentThought?.thought}
          />
          <button
            type="button"
            onClick={() => void handleNext()}
            aria-label="다른 생각 보기"
            className="inline-flex size-8 items-center justify-center text-slate-500 transition hover:text-slate-900 active:scale-95"
          >
            <RefreshCw className="size-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
