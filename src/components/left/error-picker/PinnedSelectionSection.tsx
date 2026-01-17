import type { ReactNode } from "react";
import type { ErrorIndex } from "../../../lib/ai";

type Props = {
  pinnedSelected: ErrorIndex[];
  renderCard: (idx: ErrorIndex) => ReactNode;
};

export function PinnedSelectionSection({ pinnedSelected, renderCard }: Props) {
  if (pinnedSelected.length === 0) return null;

  return (
    <div className="space-y-3">
      {pinnedSelected.map((idx) => renderCard(idx))}
    </div>
  );
}
