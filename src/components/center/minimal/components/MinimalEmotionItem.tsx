import { Check } from "lucide-react";
import { EMOTIONS } from "../../../../constants/emotions";

type EmotionItem = (typeof EMOTIONS)[number];

interface MinimalEmotionItemProps {
  emotion: EmotionItem;
  isSelected: boolean;
  onSelect: (emotion: EmotionItem["label"]) => void;
}

export function MinimalEmotionItem({
  emotion,
  isSelected,
  onSelect,
}: MinimalEmotionItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(emotion.label)}
      className={`flex size-16 items-center justify-center rounded-full border-2 text-center transition-all ${emotion.color} ${
        isSelected
          ? "text-slate-900 shadow-md brightness-90"
          : "text-slate-700 hover:shadow-sm"
      }`}
    >
      <span className="flex items-center justify-center gap-2">
        <span className="text-sm sm:text-base font-semibold text-slate-900">
          {emotion.label}
        </span>
        {isSelected && <Check className="size-4 text-slate-700" />}
      </span>
    </button>
  );
}
