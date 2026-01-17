import { Loader2 } from "lucide-react";
import type { RefObject } from "react";
import { Button } from "../../../ui/button";
import type { BibleVerseResult } from "../../types";
import { BibleVerseCard } from "../BibleVerseCard";
import { RightSummarySection } from "./RightSummarySection";
import type { CognitiveBehaviorId } from "../../../../constants/behaviors";
import type { EmotionThoughtPair } from "../../../../types";
import type { SelectedCognitiveError } from "../../../../types/sessionHistory";

interface RightBibleResultSectionProps {
  bibleSectionRef: RefObject<HTMLDivElement | null>;
  bibleLoading: boolean;
  bibleError: string | null;
  bibleVerse: BibleVerseResult | null;
  onRetry: () => void;
  onComplete: () => void;
  restartAction?: React.ReactNode;
  userInput: string;
  emotionThoughtPairs: EmotionThoughtPair[];
  selectedCognitiveErrors: SelectedCognitiveError[];
  selectedAlternativeThought: string;
  selectedBehaviorId: CognitiveBehaviorId | null;
  onSelectBehavior: (behavior: {
    behaviorId: CognitiveBehaviorId;
    behaviorLabel: string;
    behaviorText: string;
  } | null) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onBackToAlternatives: () => void;
  isBehaviorGenerating: boolean;
  savingPrayer: boolean;
  onSavePrayer: () => void;
}

export function RightBibleResultSection({
  bibleSectionRef,
  bibleLoading,
  bibleError,
  bibleVerse,
  onRetry,
  onComplete,
  restartAction,
  userInput,
  emotionThoughtPairs,
  selectedCognitiveErrors,
  selectedAlternativeThought,
  selectedBehaviorId,
  onSelectBehavior,
  onLoadingChange,
  onBackToAlternatives,
  isBehaviorGenerating,
  savingPrayer,
  onSavePrayer,
}: RightBibleResultSectionProps) {
  if (bibleLoading) {
    return (
      <div
        ref={bibleSectionRef}
        className="flex flex-col items-center justify-center py-10"
      >
        <Loader2 className="size-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-600 text-lg">
          말씀과 기도문을 생성하고 있습니다...
        </p>
      </div>
    );
  }

  if (bibleError) {
    return (
      <div
        ref={bibleSectionRef}
        className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-lg"
      >
        <p className="mb-3 text-base">{bibleError}</p>
        <Button onClick={onRetry} variant="outline" size="sm">
          다시 시도
        </Button>
      </div>
    );
  }

  if (!bibleVerse) {
    return null;
  }

  return (
    <>
      <RightSummarySection
        userInput={userInput}
        emotionThoughtPairs={emotionThoughtPairs}
        selectedCognitiveErrors={selectedCognitiveErrors}
        selectedAlternativeThought={selectedAlternativeThought}
        selectedBehaviorId={selectedBehaviorId}
        onSelectBehavior={onSelectBehavior}
        onLoadingChange={onLoadingChange}
        onBackToAlternatives={onBackToAlternatives}
      />
      <div ref={bibleSectionRef} className="space-y-4">
        <BibleVerseCard
          bibleVerse={bibleVerse}
          onSavePrayer={onSavePrayer}
          savingPrayer={savingPrayer}
        />
        <Button
          onClick={onComplete}
          className="w-full rounded-full bg-indigo-600 py-6 text-lg transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-lg"
          disabled={isBehaviorGenerating}
        >
          {isBehaviorGenerating ? "행동제안 생성 중" : "완료"}
        </Button>
        {restartAction}
      </div>
    </>
  );
}
