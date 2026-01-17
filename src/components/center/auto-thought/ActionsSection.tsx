import { Bookmark, Check, FolderOpen, Loader2, RefreshCw } from "lucide-react";
import { Button } from "../../ui/button";

export function ActionsSection({
  currentPrefetchKey,
  selectedThought,
  customThoughtTrimmed,
  selectedThoughtIndex,
  savingDetail,
  savingDetailId,
  isDetailSaved,
  onRegenerate,
  onSaveSelectedThought,
  onLoadFavorites,
  onSaveCustomThought,
  onSelectCustomThought,
  onSubmit,
  canSubmit,
}: {
  currentPrefetchKey: string | null;
  selectedThought: string | null;
  customThoughtTrimmed: string;
  selectedThoughtIndex: number | null;
  savingDetail: boolean;
  savingDetailId: string | null;
  isDetailSaved?: (thought: string) => boolean;
  onRegenerate: () => void;
  onSaveSelectedThought: (thought: string) => void;
  onLoadFavorites: () => void;
  onSaveCustomThought: () => void;
  onSelectCustomThought: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
}) {
  const isSaved = selectedThought
    ? isDetailSaved?.(selectedThought) ?? false
    : false;
  const isCustomSaved = customThoughtTrimmed
    ? isDetailSaved?.(customThoughtTrimmed) ?? false
    : false;
  const isSavingThis =
    !!selectedThought && savingDetail && savingDetailId === selectedThought;
  const isSavingCustom =
    !!customThoughtTrimmed &&
    savingDetail &&
    savingDetailId === customThoughtTrimmed;
  const canSubmitSelected =
    !customThoughtTrimmed &&
    selectedThoughtIndex !== null &&
    selectedThoughtIndex !== 999;

  return (
    <div className="pointer-events-none fixed z-[60] right-5 bottom-[calc(env(safe-area-inset-bottom)+12px)]">
      <div className="pointer-events-auto inline-flex w-fit flex-col gap-2 rounded-2xl border border-blue-200 bg-blue-50/90 p-3 shadow-lg shadow-blue-900/15 ring-1 ring-blue-100 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={onRegenerate}
            variant="outline"
            size="sm"
            className="gap-2 rounded-full border-blue-200 bg-white text-blue-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
            title="다시 생성"
          >
            <RefreshCw className="size-4" />
          </Button>
          {selectedThought ? (
            <Button
              onClick={() => onSaveSelectedThought(selectedThought)}
              size="sm"
              disabled={savingDetail || isSaved}
              className="gap-2 rounded-full border border-blue-600 bg-blue-600 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-700 hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              title="선택한 생각을 감정 노트에 저장"
            >
              {isSavingThis ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  저장 중...
                </>
              ) : isSaved ? (
                <>
                  <Check className="size-4" />
                  저장됨
                </>
              ) : (
                <>
                  <Bookmark
                    className={`size-4 ${isSaved ? "text-amber-600" : ""}`}
                    fill={isSaved ? "currentColor" : "none"}
                  />
                  저장하기
                </>
              )}
            </Button>
          ) : null}

          {customThoughtTrimmed ? (
            <Button
              onClick={onSaveCustomThought}
              size="sm"
              disabled={savingDetail || isCustomSaved}
              className="gap-2 rounded-full border border-blue-600 bg-blue-600 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-700 hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              title="이 생각을 감정 노트에 저장"
            >
              {isSavingCustom ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  저장 중...
                </>
              ) : isCustomSaved ? (
                <>
                  <Check className="size-4" />
                  저장됨
                </>
              ) : (
                <>
                  <Bookmark
                    className={`size-4 ${isCustomSaved ? "text-blue-600" : ""}`}
                    fill={isCustomSaved ? "currentColor" : "none"}
                  />
                  저장하기
                </>
              )}
            </Button>
          ) : null}

          <Button
            onClick={onLoadFavorites}
            variant="outline"
            size="sm"
            className="gap-2 rounded-full border-blue-200 bg-white text-blue-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
          >
          <FolderOpen className="size-4" />
          불러오기
          </Button>
        </div>
        {(canSubmitSelected || customThoughtTrimmed) && (
          <div className="flex">
            {customThoughtTrimmed ? (
              <Button
                onClick={onSelectCustomThought}
                className="w-full rounded-full bg-blue-600 px-4 text-xs font-semibold shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                {selectedThoughtIndex === 999 && <Check className="size-4 mr-2" />}
                직접 입력한 생각으로 진행
              </Button>
            ) : (
              <Button
                onClick={onSubmit}
                disabled={!canSubmit}
                className="w-full rounded-full bg-blue-600 px-4 text-xs font-semibold shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-60"
              >
                이 생각으로 진행
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
