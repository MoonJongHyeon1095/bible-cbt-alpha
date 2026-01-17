import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import type { EmotionThoughtPair } from "../../../types";
import type { SelectedCognitiveError } from "../../../types/sessionHistory";
import { MinimalLoadingScreen } from "../../center/minimal/MinimalLoadingScreen";
import { MinimalFloatingNextButton } from "../../common/MinimalFloatingNextButton";
import { useAlternativeThoughts } from "../hooks/useAlternativeThoughts";

interface MinimalAlternativeThoughtStepProps {
  userInput: string;
  emotionThoughtPairs: EmotionThoughtPair[];
  selectedCognitiveErrors: SelectedCognitiveError[];
  seed: number;
  onSelect: (thought: string) => void;
}

export function MinimalAlternativeThoughtStep({
  userInput,
  emotionThoughtPairs,
  selectedCognitiveErrors,
  seed,
  onSelect,
}: MinimalAlternativeThoughtStepProps) {
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
    return <MinimalLoadingScreen message="대안사고를 정리하고 있어요." />;
  }

  if (thoughtsError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-12 pb-10">
        <div className="w-full max-w-md text-center space-y-4">
          <p className="text-base text-slate-600">{thoughtsError}</p>
          <button
            type="button"
            onClick={() => void generateAlternatives({ force: true })}
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
          <h1 className="text-3xl sm:text-4xl font-serif font-semibold leading-tight text-slate-900">
            어떤 대안사고가 가장 마음에 와닿나요?
          </h1>
          <p className="text-base sm:text-lg text-slate-500 leading-relaxed">
            고르라고 하지말고 매번 새로고침 하는 거 같은 문구
          </p>
        </div>

        <div className="bg-transparent px-1 py-2 text-base sm:text-lg text-slate-800 font-serif leading-relaxed">
          {currentThought?.thought ?? "대안사고를 불러오는 중입니다."}
        </div>
        {currentThought?.technique && (
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-medium text-slate-600">
            {currentThought.technique}
          </div>
        )}

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
