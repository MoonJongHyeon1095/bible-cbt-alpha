import { Lightbulb, X } from "lucide-react";
import { DialogClose } from "../../../../ui/dialog";
import type { PatternAlternative } from "../../types";
import { PatternAlternativesCard } from "../PatternAlternativesCard";

interface PatternAlternativesSectionProps {
  alternatives: PatternAlternative[];
  onUpdateAlternative: (alternative: PatternAlternative) => Promise<void>;
  onDeleteAlternative: (id: string) => Promise<void>;
}

export function PatternAlternativesSection({
  alternatives,
  onUpdateAlternative,
  onDeleteAlternative,
}: PatternAlternativesSectionProps) {
  return (
    <div className="border border-green-200 rounded-xl bg-white shadow-sm">
      <div className="border-b border-green-200 px-4 py-3 text-sm font-semibold text-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="size-4" />
          대안적 접근 편집
        </div>
        <DialogClose asChild>
          <button
            type="button"
            className="rounded-full border border-green-200 bg-white p-2 text-green-700 transition hover:bg-green-50"
            aria-label="닫기"
          >
            <X className="size-4" />
          </button>
        </DialogClose>
      </div>
      <div className="p-5 space-y-4 bg-green-50/70">
        <PatternAlternativesCard
          alternatives={alternatives}
          onUpdateAlternative={onUpdateAlternative}
          onDeleteAlternative={onDeleteAlternative}
        />
      </div>
    </div>
  );
}
