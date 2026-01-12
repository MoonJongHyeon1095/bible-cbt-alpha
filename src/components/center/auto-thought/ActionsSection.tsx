import { Bookmark, Check, FolderOpen, Loader2, RefreshCw } from "lucide-react";
import { Button } from "../../ui/button";

export function ActionsSection({
  currentPrefetchKey,
  selectedThought,
  savingDetail,
  savingDetailId,
  isDetailSaved,
  onRegenerate,
  onSaveSelectedThought,
  onLoadFavorites,
}: {
  currentPrefetchKey: string | null;
  selectedThought: string | null;
  savingDetail: boolean;
  savingDetailId: string | null;
  isDetailSaved?: (thought: string) => boolean;
  onRegenerate: () => void;
  onSaveSelectedThought: (thought: string) => void;
  onLoadFavorites: () => void;
}) {
  const isSaved = selectedThought
    ? isDetailSaved?.(selectedThought) ?? false
    : false;
  const isSavingThis =
    !!selectedThought && savingDetail && savingDetailId === selectedThought;

  return (
    <div className="ml-auto flex w-fit flex-wrap items-center justify-end gap-2 rounded-2xl border border-slate-200/70 bg-white/80 p-3 shadow-sm">
      <Button
        onClick={onRegenerate}
        variant="outline"
        size="sm"
        className="gap-2 rounded-full border-indigo-200 bg-white text-indigo-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-md"
      >
        <RefreshCw className="size-4" />
      </Button>

      <div className="flex flex-wrap items-center gap-2">
        {selectedThought ? (
          <Button
            onClick={() => onSaveSelectedThought(selectedThought)}
            variant="outline"
            size="sm"
            disabled={savingDetail || isSaved}
            className="gap-2 rounded-full border-amber-200 bg-white text-amber-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
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

        <Button
          onClick={onLoadFavorites}
          variant="outline"
          size="sm"
          className="gap-2 rounded-full border-amber-200 bg-amber-50/60 text-amber-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50 hover:shadow-md"
        >
          <FolderOpen className="size-4" />
          불러오기
        </Button>
      </div>
    </div>
  );
}
