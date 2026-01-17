import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../../../../ui/dialog";
import { getCognitiveErrorMeta, type PopoverAlign } from "./InfoPopoverMeta";

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
        <DialogTitle className="sr-only">{error.title} 설명</DialogTitle>
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
