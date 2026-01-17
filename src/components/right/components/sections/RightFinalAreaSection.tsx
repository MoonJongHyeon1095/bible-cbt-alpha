import type { CognitiveBehaviorId } from "../../../../constants/behaviors";
import type { EmotionThoughtPair } from "../../../../types";
import type { SelectedCognitiveError } from "../../../../types/sessionHistory";
import { Button } from "../../../ui/button";
import { FinalIntensityCard } from "../FinalIntensityCard";
import { ShalomCard } from "../ShalomCard";
import { RightSummarySection } from "./RightSummarySection";
import { BibleOfferCard } from "../BibleOfferCard";

interface RightFinalAreaSectionProps {
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
  showBibleOffer: boolean;
  onAcceptBible: () => void;
  onDeclineBible: () => void;
  bibleLoading: boolean;
  bibleError: string | null;
  shouldShowDial: boolean;
  finalIntensities: Record<string, number>;
  onChangeFinalIntensity: (emotion: string, value: number) => void;
  onEnableFinalIntensity: () => void;
  onComplete: () => void;
  isBehaviorGenerating: boolean;
  isDeep: boolean;
  hasAnyIntensity: boolean;
  restartAction?: React.ReactNode;
}

export function RightFinalAreaSection({
  userInput,
  emotionThoughtPairs,
  selectedCognitiveErrors,
  selectedAlternativeThought,
  selectedBehaviorId,
  onSelectBehavior,
  onLoadingChange,
  onBackToAlternatives,
  showBibleOffer,
  onAcceptBible,
  onDeclineBible,
  bibleLoading,
  bibleError,
  shouldShowDial,
  finalIntensities,
  onChangeFinalIntensity,
  onEnableFinalIntensity,
  onComplete,
  isBehaviorGenerating,
  isDeep,
  hasAnyIntensity,
  restartAction,
}: RightFinalAreaSectionProps) {
  return (
    <div className="space-y-4">
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
      {showBibleOffer && (
        <BibleOfferCard
          onAccept={onAcceptBible}
          onDecline={onDeclineBible}
          bibleLoading={bibleLoading}
          bibleError={bibleError}
        />
      )}

      <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
        {shouldShowDial && (
          <FinalIntensityCard
            emotionThoughtPairs={emotionThoughtPairs}
            finalIntensities={finalIntensities}
            onChange={onChangeFinalIntensity}
          />
        )}

        <ShalomCard />

        {isDeep && hasAnyIntensity && !shouldShowDial ? (
          <Button
            onClick={onEnableFinalIntensity}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            감정 변화 기록하기
          </Button>
        ) : (
          <>
            <Button
              onClick={onComplete}
              className="mb-4 w-full rounded-full bg-indigo-600 transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-lg"
              disabled={isBehaviorGenerating}
            >
              {isBehaviorGenerating ? "행동 제안 생성중" : "완료"}
            </Button>
            {restartAction}
          </>
        )}
      </div>
    </div>
  );
}
