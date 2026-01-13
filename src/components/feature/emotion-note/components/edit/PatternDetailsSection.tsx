import { Brain, X } from "lucide-react";
import { DialogClose } from "../../../../ui/dialog";
import type { PatternDetail } from "../../types";
import { PatternDetailsCard } from "../PatternDetailsCard";

interface PatternDetailsSectionProps {
  details: PatternDetail[];
  onUpdateDetail: (detail: PatternDetail) => Promise<void>;
  onDeleteDetail: (id: string) => Promise<void>;
}

export function PatternDetailsSection({
  details,
  onUpdateDetail,
  onDeleteDetail,
}: PatternDetailsSectionProps) {
  return (
    <div className="border border-amber-200 rounded-xl bg-white shadow-sm">
      <div className="border-b border-amber-200 px-4 py-3 text-sm font-semibold text-amber-900 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Brain className="size-4" />
          배후의 자동 사고 편집
        </div>
        <DialogClose asChild>
          <button
            type="button"
            className="rounded-full border border-amber-200 bg-white p-2 text-amber-700 transition hover:bg-amber-50"
            aria-label="닫기"
          >
            <X className="size-4" />
          </button>
        </DialogClose>
      </div>
      <div className="p-5 space-y-4 bg-amber-50/70">
        <PatternDetailsCard
          details={details}
          onUpdateDetail={onUpdateDetail}
          onDeleteDetail={onDeleteDetail}
        />
      </div>
    </div>
  );
}
