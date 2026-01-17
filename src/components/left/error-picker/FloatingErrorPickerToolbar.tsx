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
  canConfirm?: boolean;
  onConfirm?: () => void;
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
  canConfirm,
  onConfirm,
}: Props) {
  if (!isVisible) return null;

  const showConfirm = selectedCount === 2 && onConfirm;

  return (
    <div className="pointer-events-none fixed z-[60] right-5 bottom-[calc(env(safe-area-inset-bottom)+12px)] sm:bottom-[calc(env(safe-area-inset-bottom)+var(--mobile-tabbar-height,96px)+16px)]">
      <div className="min-w-[260px] w-fit rounded-2xl border border-emerald-300 bg-emerald-50/95 px-4 py-3 text-emerald-900 text-sm shadow-xl shadow-emerald-900/20 ring-1 ring-emerald-200 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <span className={selectedCount === 0 ? "opacity-60" : "opacity-100"}>
            {selectedCount} / 2개 선택됨
          </span>
        </div>
        <div className="pointer-events-auto mt-2 flex items-center justify-center">
          <div className="flex items-center gap-2">
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
        {showConfirm && (
          <div className="pointer-events-auto mt-3">
            <button
              type="button"
              onClick={onConfirm}
              disabled={!canConfirm}
              className="w-full rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-60"
            >
              다음 단계로 이동
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
