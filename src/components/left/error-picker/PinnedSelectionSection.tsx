import type { ReactNode } from "react";
import type { ErrorIndex } from "../../../lib/ai";

type Props = {
  pinnedSelected: ErrorIndex[];
  renderCard: (idx: ErrorIndex) => ReactNode;
};

export function PinnedSelectionSection({ pinnedSelected, renderCard }: Props) {
  if (pinnedSelected.length === 0) return null;

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 shadow-sm">
      <div className="flex items-center justify-between mb-3"></div>
      <div className="space-y-3">
        {pinnedSelected.map((idx) => renderCard(idx))}
      </div>
    </div>
  );
}
