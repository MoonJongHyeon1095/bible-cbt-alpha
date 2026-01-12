import type { ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import type { ErrorIndex } from "../../../lib/ai";

type Props = {
  uiIndices: ErrorIndex[];
  renderCard: (idx: ErrorIndex) => ReactNode;
  onReroll: () => void;
  isRerollDisabled: boolean;
};

export function RecommendationSection({
  uiIndices,
  renderCard,
  onReroll,
  isRerollDisabled,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-base font-semibold text-emerald-900">
          인지오류 후보
        </p>
        <button
          type="button"
          onClick={onReroll}
          disabled={isRerollDisabled}
          className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm text-indigo-700 shadow-sm transition-colors hover:bg-indigo-50 hover:border-indigo-300 disabled:opacity-50"
        >
          <RefreshCw className="size-4" />
          다른 인지오류 검토
        </button>
      </div>
      <div className="space-y-3">
        {uiIndices.map((idx) => renderCard(idx))}
      </div>
    </div>
  );
}
