import { EMOTIONS } from "../../../../constants/emotions";
import { MinimalEmotionItem } from "./MinimalEmotionItem";

interface MinimalEmotionListProps {
  selectedEmotion: string;
  onSelectEmotion: (emotion: string) => void;
}

export function MinimalEmotionList({
  selectedEmotion,
  onSelectEmotion,
}: MinimalEmotionListProps) {
  return (
    <div className="grid grid-cols-3 place-items-center gap-3">
      {EMOTIONS.map((emotion) => (
        <MinimalEmotionItem
          key={emotion.id}
          emotion={emotion}
          isSelected={selectedEmotion === emotion.label}
          onSelect={onSelectEmotion}
        />
      ))}
    </div>
  );
}
