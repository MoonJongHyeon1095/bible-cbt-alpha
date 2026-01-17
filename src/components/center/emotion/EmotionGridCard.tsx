import { Check } from "lucide-react";
import { EMOTIONS } from "../../../constants/emotions";
import type { EmotionData } from "../types";

interface EmotionGridProps {
  selectedEmotion: string;
  onSelect: (emotion: EmotionData) => void;
}

export function EmotionGridCard({
  selectedEmotion,
  onSelect,
}: EmotionGridProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {EMOTIONS.map((emotion) => {
          const isSelected = selectedEmotion === emotion.label;

          return (
            <button
              key={emotion.id}
              onClick={() => onSelect(emotion as EmotionData)}
              className={`text-left p-3 rounded-xl border-2 transition-all hover:shadow-lg focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-1 ${
                isSelected
                  ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg"
                  : emotion.color + " border-2 hover:border-blue-300"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-slate-900 font-semibold">
                    {emotion.label}
                  </h3>
                  {isSelected && <Check className="size-4 text-blue-600" />}
                </div>
                <p className="text-slate-700 text-xs leading-relaxed">
                  {emotion.description}
                </p>
                <p className="text-slate-500 text-xs">{emotion.physical}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
