import type { CognitiveBehaviorId } from "../../../../constants/behaviors";
import type { EmotionThoughtPair } from "../../../../types";
import type { SelectedCognitiveError } from "../../../../types/sessionHistory";
import { BehaviorReviewCard } from "../behavior/BehaviorReviewCard";
import { ProgressSummaryCard } from "../ProgressSummaryCard";
import { SelectedThoughtCard } from "../SelectedThoughtCard";

interface RightSummarySectionProps {
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
}

export function RightSummarySection({
  userInput,
  emotionThoughtPairs,
  selectedCognitiveErrors,
  selectedAlternativeThought,
  selectedBehaviorId,
  onSelectBehavior,
  onLoadingChange,
  onBackToAlternatives,
}: RightSummarySectionProps) {
  return (
    <>
      <ProgressSummaryCard
        userInput={userInput}
        emotionThoughtPairs={emotionThoughtPairs}
        selectedCognitiveErrors={selectedCognitiveErrors}
      />
      <SelectedThoughtCard
        thought={selectedAlternativeThought}
        onBackToAlternatives={onBackToAlternatives}
      />
      <BehaviorReviewCard
        userInput={userInput}
        emotionThoughtPairs={emotionThoughtPairs}
        selectedCognitiveErrors={selectedCognitiveErrors}
        selectedAlternativeThought={selectedAlternativeThought}
        selectedBehaviorId={selectedBehaviorId}
        onSelectBehavior={onSelectBehavior}
        onLoadingChange={onLoadingChange}
      />
    </>
  );
}
