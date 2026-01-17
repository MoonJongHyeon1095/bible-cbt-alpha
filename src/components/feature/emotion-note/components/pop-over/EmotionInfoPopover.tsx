import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../../../../ui/dialog";
import { getEmotionMeta, type PopoverAlign } from "./InfoPopoverMeta";

type EmotionInfoPopoverProps = {
  emotionLabel?: string;
  align?: PopoverAlign;
  children: ReactNode;
};

export function EmotionInfoPopover({
  emotionLabel,
  children,
}: EmotionInfoPopoverProps) {
  const emotion = getEmotionMeta(emotionLabel);
  if (!emotion) return <>{children}</>;

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        hideClose
        className="w-80 rounded-xl border border-blue-100 bg-white shadow-lg shadow-blue-100/60"
      >
        <DialogTitle className="sr-only">{emotion.label} 정보</DialogTitle>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
              감정
            </span>
          </div>
          <p className="text-base font-semibold text-slate-900 text-center">
            {emotion.label}
          </p>
          <div className="space-y-1 rounded-lg border border-slate-100 bg-slate-50 p-2">
            <p className="text-[11px] font-semibold text-blue-700">
              긍정적인 면
            </p>
            <ul className="list-disc pl-4 text-sm text-slate-600 leading-relaxed">
              {emotion.positive.map((item, index) => (
                <li key={`${emotion.id}-positive-${index}`}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-1 rounded-lg border border-slate-100 bg-slate-50 p-2">
            <p className="text-[11px] font-semibold text-blue-700">주의할 점</p>
            <ul className="list-disc pl-4 text-sm text-slate-600 leading-relaxed">
              {emotion.caution.map((item, index) => (
                <li key={`${emotion.id}-caution-${index}`}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
