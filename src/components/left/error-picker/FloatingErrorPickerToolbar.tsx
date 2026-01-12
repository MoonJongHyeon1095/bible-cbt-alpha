import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  isVisible: boolean;
  selectedCount: number;
  pageIndex: number;
  totalPages: number;
  canPrev: boolean;
  canNext: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
};

export function FloatingErrorPickerToolbar({
  isVisible,
  selectedCount,
  pageIndex,
  totalPages,
  canPrev,
  canNext,
  onPrevPage,
  onNextPage,
}: Props) {
  if (!isVisible) return null;

  return (
    <div
      className="pointer-events-none"
      style={{
        position: "fixed",
        bottom: "calc(var(--mobile-tabbar-height, 0px) + 24px)",
        right: 24,
        zIndex: 60,
      }}
    >
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-emerald-800 text-sm shadow-sm flex items-center gap-3">
        <span className={selectedCount === 0 ? "opacity-60" : "opacity-100"}>
          {selectedCount} / 2개 선택됨
        </span>
        <span className="text-slate-400">|</span>
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevPage}
            disabled={!canPrev}
            className="rounded-lg border border-emerald-200 bg-white p-2 text-emerald-800 shadow-sm disabled:opacity-50"
            aria-label="이전 페이지"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">
            {pageIndex + 1} / {totalPages}
          </div>
          <button
            type="button"
            onClick={onNextPage}
            disabled={!canNext}
            className="rounded-lg border border-emerald-200 bg-white p-2 text-emerald-800 shadow-sm disabled:opacity-50"
            aria-label="다음 페이지"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
