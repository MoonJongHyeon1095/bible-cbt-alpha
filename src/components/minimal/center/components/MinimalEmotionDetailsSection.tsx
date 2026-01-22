import { EMOTIONS } from "../../../../constants/emotions";
import { MinimalFloatingNextButton } from "../../common/MinimalFloatingNextButton";
type EmotionItem = (typeof EMOTIONS)[number];

interface MinimalEmotionDetailsSectionProps {
  emotion?: EmotionItem;
  isVisible: boolean;
  onNext: () => void;
}

export function MinimalEmotionDetailsSection({
  emotion,
  isVisible,
  onNext,
}: MinimalEmotionDetailsSectionProps) {
  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-out ${
        isVisible
          ? "max-h-[520px] opacity-100 translate-y-0"
          : "max-h-0 opacity-0 -translate-y-2"
      }`}
    >
      {emotion && (
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="space-y-2 text-slate-700">
            <p className="text-lg sm:text-xl font-serif font-semibold text-slate-900">
              {emotion.description}
            </p>
            <p className="text-sm sm:text-base text-slate-500">
              {emotion.physical}
            </p>
          </div>

          <div className="space-y-3 text-sm sm:text-base text-slate-600">
            <p className="font-medium text-slate-800">이 감정의 긍정적인 면</p>
            <ul className="space-y-2">
              {emotion.positive.map((item, idx) => (
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
              {emotion.caution.map((item, idx) => (
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
  );
}
