import { Footprints, X } from "lucide-react";
import { DialogClose } from "../../../../ui/dialog";
import type { PatternBehaviorDetail } from "../../types";
import { PatternBehaviorDetailsCard } from "../PatternBehaviorDetailsCard";

interface PatternBehaviorSectionProps {
  behaviorDetails: PatternBehaviorDetail[];
  onUpdateBehavior: (detail: PatternBehaviorDetail) => Promise<void>;
  onDeleteBehavior: (id: string) => Promise<void>;
}

export function PatternBehaviorSection({
  behaviorDetails,
  onUpdateBehavior,
  onDeleteBehavior,
}: PatternBehaviorSectionProps) {
  return (
    <div className="border border-blue-200 rounded-xl bg-white shadow-sm">
      <div className="border-b border-blue-200 px-4 py-3 text-sm font-semibold text-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Footprints className="size-4" />
          행동 반응 편집
        </div>
        <DialogClose asChild>
          <button
            type="button"
            className="rounded-full border border-blue-200 bg-white p-2 text-blue-700 transition hover:bg-blue-50"
            aria-label="닫기"
          >
            <X className="size-4" />
          </button>
        </DialogClose>
      </div>
      <div className="p-5 space-y-4 bg-blue-50/70">
        <PatternBehaviorDetailsCard
          behaviorDetails={behaviorDetails}
          onUpdateBehavior={onUpdateBehavior}
          onDeleteBehavior={onDeleteBehavior}
        />
      </div>
    </div>
  );
}
