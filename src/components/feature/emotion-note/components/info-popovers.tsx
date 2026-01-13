import type { ReactNode } from "react";
import { COGNITIVE_BEHAVIORS } from "../../../../constants/behaviors";
import { EMOTIONS } from "../../../../constants/emotions";
import { COGNITIVE_ERRORS } from "../../../../constants/errors";
import { Dialog, DialogContent, DialogTrigger } from "../../../ui/dialog";

const EMOTION_BY_LABEL = new Map<string, (typeof EMOTIONS)[number]>(
  EMOTIONS.map((emotion) => [emotion.label, emotion])
);

const COGNITIVE_ERROR_BY_TITLE = new Map<
  string,
  (typeof COGNITIVE_ERRORS)[number]
>(COGNITIVE_ERRORS.map((error) => [error.title, error]));

const COGNITIVE_BEHAVIOR_BY_LABEL = new Map<
  string,
  (typeof COGNITIVE_BEHAVIORS)[number]
>(
  COGNITIVE_BEHAVIORS.flatMap((behavior) => [
    [behavior.replacement_title, behavior],
    [behavior.title, behavior],
  ])
);

type PopoverAlign = "start" | "center" | "end";

export function getEmotionMeta(label?: string) {
  if (!label) return undefined;
  return EMOTION_BY_LABEL.get(label);
}

export function getCognitiveErrorMeta(label?: string) {
  if (!label) return undefined;
  return COGNITIVE_ERROR_BY_TITLE.get(label);
}

export function getBehaviorMeta(label?: string) {
  if (!label) return undefined;
  return COGNITIVE_BEHAVIOR_BY_LABEL.get(label);
}

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

type CognitiveErrorInfoPopoverProps = {
  errorLabel?: string;
  align?: PopoverAlign;
  caption?: string;
  tone?: "rose" | "blue";
  children: ReactNode;
};

export function CognitiveErrorInfoPopover({
  errorLabel,
  caption = "핵심 설명",
  tone = "rose",
  children,
}: CognitiveErrorInfoPopoverProps) {
  const error = getCognitiveErrorMeta(errorLabel);
  if (!error) return <>{children}</>;

  const toneStyles =
    tone === "blue"
      ? {
          border: "border-blue-100 shadow-blue-100/60",
          chip: "border-blue-200 bg-blue-50 text-blue-700",
        }
      : {
          border: "border-rose-100 shadow-rose-100/60",
          chip: "border-rose-200 bg-rose-50 text-rose-700",
        };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        hideClose
        className={`w-72 rounded-xl border bg-white shadow-lg ${toneStyles.border}`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span
              className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${toneStyles.chip}`}
            >
              인지오류
            </span>
            <span className="text-[10px] text-slate-400">{caption}</span>
          </div>
          <div className="space-y-2">
            <p className="text-base font-semibold text-slate-900 text-center">
              {error.title}
            </p>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">
              <p className="text-sm text-slate-600 leading-relaxed">
                {error.description}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type BehaviorInfoPopoverProps = {
  behaviorLabel?: string;
  align?: PopoverAlign;
  children: ReactNode;
};

export function BehaviorInfoPopover({
  behaviorLabel,
  children,
}: BehaviorInfoPopoverProps) {
  const behavior = getBehaviorMeta(behaviorLabel);
  if (!behavior) return <>{children}</>;

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        hideClose
        className="w-80 rounded-xl border border-blue-100 bg-white shadow-lg shadow-blue-100/60"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
              행동 반응
            </span>
            <span className="text-[10px] text-slate-400">실천 가이드</span>
          </div>
          <p className="text-base font-semibold text-slate-900 text-center">
            {behavior.replacement_title}
          </p>
          <div className="space-y-1 rounded-lg border border-slate-100 bg-slate-50 p-2">
            <p className="text-[11px] font-semibold text-slate-600">설명</p>
            <p className="text-sm text-slate-600 leading-relaxed">
              {behavior.description}
            </p>
          </div>
          <div className="space-y-1 rounded-lg border border-slate-100 bg-slate-50 p-2">
            <p className="text-[11px] font-semibold text-slate-600">사용법</p>
            <p className="text-sm text-slate-600 leading-relaxed">
              {behavior.usage_description}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
