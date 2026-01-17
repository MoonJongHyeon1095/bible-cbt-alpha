import { EMOTIONS } from "../../../constants/emotions";
import { MinimalStepHeaderSection } from "../../common/MinimalStepHeaderSection";
import { MinimalEmotionDetailsSection } from "./components/MinimalEmotionDetailsSection";
import { MinimalEmotionList } from "./components/MinimalEmotionList";

interface MinimalEmotionSectionProps {
  selectedEmotion: string;
  onSelectEmotion: (emotion: string) => void;
  onNext: () => void;
}

export function MinimalEmotionSection({
  selectedEmotion,
  onSelectEmotion,
  onNext,
}: MinimalEmotionSectionProps) {
  const selectedEmotionData = EMOTIONS.find(
    (emotion) => emotion.label === selectedEmotion,
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20 pb-10">
      <div className="w-full max-w-xl space-y-10">
        <MinimalStepHeaderSection title="감정을 선택해주세요." />
        <MinimalEmotionList
          selectedEmotion={selectedEmotion}
          onSelectEmotion={onSelectEmotion}
        />
        <MinimalEmotionDetailsSection
          emotion={selectedEmotionData}
          isVisible={Boolean(selectedEmotion)}
          onNext={onNext}
        />
      </div>
    </div>
  );
}
