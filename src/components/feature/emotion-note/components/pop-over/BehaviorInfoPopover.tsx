import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../../../../ui/dialog";
import { getBehaviorMeta, type PopoverAlign } from "./InfoPopoverMeta";

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
        <DialogTitle className="sr-only">
          {behavior.replacement_title} 설명
        </DialogTitle>
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
