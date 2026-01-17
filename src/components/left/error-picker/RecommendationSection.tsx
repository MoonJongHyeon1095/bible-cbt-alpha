import type { ReactNode } from "react";
import type { ErrorIndex } from "../../../lib/ai";

type Props = {
  uiIndices: ErrorIndex[];
  renderCard: (idx: ErrorIndex) => ReactNode;
};

export function RecommendationSection({
  uiIndices,
  renderCard,
}: Props) {
  return (
    <div className="space-y-3 pt-4">
      <p className="text-base font-semibold text-emerald-900">
        인지오류 후보
      </p>
      <div className="space-y-3">
        {uiIndices.map((idx) => renderCard(idx))}
      </div>
    </div>
  );
}
