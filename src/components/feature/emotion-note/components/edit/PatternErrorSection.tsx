import { AlertCircle, X } from "lucide-react";
import { DialogClose } from "../../../../ui/dialog";
import type { PatternErrorDetail } from "../../types";
import { PatternErrorDetailsCard } from "../PatternErrorDetailsCard";

interface PatternErrorSectionProps {
  errorDetails: PatternErrorDetail[];
  onUpdateError: (detail: PatternErrorDetail) => Promise<void>;
  onDeleteError: (id: string) => Promise<void>;
}

export function PatternErrorSection({
  errorDetails,
  onUpdateError,
  onDeleteError,
}: PatternErrorSectionProps) {
  return (
    <div className="border border-rose-200 rounded-xl bg-white shadow-sm">
      <div className="border-b border-rose-200 px-4 py-3 text-sm font-semibold text-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="size-4" />
          인지오류 편집
        </div>
        <DialogClose asChild>
          <button
            type="button"
            className="rounded-full border border-rose-200 bg-white p-2 text-rose-700 transition hover:bg-rose-50"
            aria-label="닫기"
          >
            <X className="size-4" />
          </button>
        </DialogClose>
      </div>
      <div className="p-5 space-y-4 bg-rose-50/70">
        <PatternErrorDetailsCard
          errorDetails={errorDetails}
          onUpdateError={onUpdateError}
          onDeleteError={onDeleteError}
        />
      </div>
    </div>
  );
}
