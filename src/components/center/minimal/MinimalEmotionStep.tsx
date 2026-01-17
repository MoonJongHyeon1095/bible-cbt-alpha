import { Check } from "lucide-react";
import { EMOTIONS } from "../../../constants/emotions";
import { MinimalFloatingNextButton } from "../../common/MinimalFloatingNextButton";

interface MinimalEmotionStepProps {
  selectedEmotion: string;
  onSelectEmotion: (emotion: string) => void;
  onNext: () => void;
}

export function MinimalEmotionStep({
  selectedEmotion,
  onSelectEmotion,
  onNext,
}: MinimalEmotionStepProps) {
  const selectedEmotionData = EMOTIONS.find(
    (emotion) => emotion.label === selectedEmotion,
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20 pb-10">
      <div className="w-full max-w-xl space-y-10">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-serif font-semibold leading-tight text-slate-900">
            지금 느끼는 감정을 선택해주세요.
          </h1>
        </div>

        <div className="grid grid-cols-3 place-items-center gap-3">
          {EMOTIONS.map((emotion) => {
            const isSelected = selectedEmotion === emotion.label;
            return (
              <button
                key={emotion.id}
                type="button"
                onClick={() => onSelectEmotion(emotion.label)}
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
          })}
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            selectedEmotion
              ? "max-h-[520px] opacity-100 translate-y-0"
              : "max-h-0 opacity-0 -translate-y-2"
          }`}
        >
          {selectedEmotionData && (
            <div className="space-y-6">
              <div className="space-y-2 text-slate-700">
                <p className="text-lg sm:text-xl font-serif font-semibold text-slate-900">
                  {selectedEmotionData.description}
                </p>
                <p className="text-sm sm:text-base text-slate-500">
                  {selectedEmotionData.physical}
                </p>
              </div>

              <div className="space-y-3 text-sm sm:text-base text-slate-600">
                <p className="font-medium text-slate-800">
                  이 감정의 긍정적인 면
                </p>
                <ul className="space-y-2">
                  {selectedEmotionData.positive.map((item, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-slate-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3 text-sm sm:text-base text-slate-600">
                <p className="font-medium text-slate-800">주의할 점</p>
                <ul className="space-y-2">
                  {selectedEmotionData.caution.map((item, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-slate-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <MinimalFloatingNextButton onClick={onNext} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
