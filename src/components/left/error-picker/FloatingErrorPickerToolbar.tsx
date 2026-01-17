import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ErrorIndex } from "../../../lib/ai";

type Props = {
  isVisible: boolean;
  selectedCount: number;
  selectedIndices: ErrorIndex[];
  savingErrorId?: ErrorIndex | null;
  isErrorSaved?: (idx: ErrorIndex) => boolean;
  onSaveError?: (idx: ErrorIndex) => void;
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
  selectedIndices,
  savingErrorId,
  isErrorSaved,
  onSaveError,
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

  const selectedUnsaved = selectedIndices.filter(
    (index) => !(isErrorSaved?.(index) ?? false)
  );
  const hasSelection = selectedIndices.length > 0;
  const canSave = hasSelection && selectedUnsaved.length > 0 && onSaveError;
  const allSaved = hasSelection && selectedUnsaved.length === 0;
  const isSaving =
    savingErrorId != null && selectedIndices.includes(savingErrorId);
  const showConfirm = selectedCount === 2 && onConfirm;

  const handleSaveSelected = () => {
    if (!onSaveError) return;
    selectedUnsaved.forEach((index) => onSaveError(index));
  };

  return (
    <div className="pointer-events-none fixed z-[60] right-5 bottom-[calc(env(safe-area-inset-bottom)+12px)] sm:bottom-[calc(env(safe-area-inset-bottom)+var(--mobile-tabbar-height,96px)+16px)]">
      <div className="min-w-[260px] w-fit rounded-2xl border border-emerald-300 bg-emerald-50/95 px-4 py-3 text-emerald-900 text-sm shadow-xl shadow-emerald-900/20 ring-1 ring-emerald-200 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <span className={selectedCount === 0 ? "opacity-60" : "opacity-100"}>
            {selectedCount} / 2개 선택됨
          </span>
          {onSaveError && (
            <button
              type="button"
              onClick={handleSaveSelected}
              disabled={!canSave || isSaving}
              className="pointer-events-auto rounded-full border border-emerald-300 bg-white px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-100 disabled:opacity-60"
            >
              {allSaved ? "저장됨" : isSaving ? "저장 중" : "감정노트에 저장"}
            </button>
          )}
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
