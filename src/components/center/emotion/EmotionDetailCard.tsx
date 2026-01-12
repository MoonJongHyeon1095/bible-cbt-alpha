import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { Label } from "../../ui/label";
import type { EmotionData } from "../types";

interface EmotionDetailCardProps {
  emotion: EmotionData;
  confirmed: boolean;
  onConfirmChange: (checked: boolean) => void;
  onBack: () => void;
  onSelect: () => void;
}

export function EmotionDetailCard({
  emotion,
  confirmed,
  onConfirmChange,
  onBack,
  onSelect,
}: EmotionDetailCardProps) {
  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-lg border-2 border-indigo-300">
        <h2 className="text-indigo-900 text-base mb-1">
          지금 이 순간의 <strong>{emotion.label}</strong> 인식하기
        </h2>
        <p className="text-slate-700 text-xs">{emotion.description}</p>
        <p className="text-slate-600 text-xs mt-1">{emotion.physical}</p>
      </div>

      <div className="rounded-lg border border-green-300 bg-green-50 p-3">
        <h3 className="text-green-900 text-sm font-semibold">
          ✨ 그러나 {emotion.label}의 긍정적인 측면도 있습니다.
        </h3>
        <ul className="mt-2 space-y-2">
          {emotion.positive.map((item, idx) => (
            <li
              key={idx}
              className="flex gap-2 text-slate-700 text-sm leading-relaxed"
            >
              <span className="mt-[0.35rem] select-none text-slate-500">•</span>
              <span className="flex-1">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
        <h3 className="text-amber-900 text-sm font-semibold">
          ⚠️ {emotion.label}의 주의할 점
        </h3>
        <ul className="mt-2 space-y-2">
          {emotion.caution.map((item, idx) => (
            <li
              key={idx}
              className="flex gap-2 text-slate-700 text-sm leading-relaxed"
            >
              <span className="mt-[0.35rem] select-none text-slate-500">•</span>
              <span className="flex-1">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div
        className={`rounded-lg border-2 p-3 transition-all ${
          confirmed
            ? "bg-green-50 border-green-300"
            : "bg-slate-50 border-slate-300"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Checkbox
              id="emotion-confirm-checkbox"
              checked={confirmed}
              onCheckedChange={(checked) => onConfirmChange(Boolean(checked))}
              className="data-[state=checked]:border-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:text-white"
            />
            <Label
              htmlFor="emotion-confirm-checkbox"
              className={`cursor-pointer ${
                confirmed ? "text-green-900" : "text-slate-700"
              }`}
            >
              위 내용을 확인했습니다
            </Label>
          </div>

          <span className="text-xs text-slate-500">
            {confirmed ? "확인됨" : "체크 필요"}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1">
          다른 감정 보기
        </Button>

        <Button
          onClick={onSelect}
          disabled={!confirmed}
          className={`flex-1 ${
            confirmed
              ? "bg-indigo-600 hover:bg-indigo-700"
              : "bg-slate-300 cursor-not-allowed"
          }`}
        >
          이 감정 다루기
        </Button>
      </div>
    </div>
  );
}
