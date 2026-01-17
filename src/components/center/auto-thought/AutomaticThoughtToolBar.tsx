import { FolderOpen, RefreshCw } from "lucide-react";
import { Button } from "../../ui/button";

export function AutomaticThoughtToolBar({
  selectedThought,
  customThoughtTrimmed,
  selectedThoughtIndex,
  onRegenerate,
  onLoadFavorites,
  onSelectCustomThought,
  onSubmit,
  canSubmit,
}: {
  selectedThought: string | null;
  customThoughtTrimmed: string;
  selectedThoughtIndex: number | null;
  onRegenerate: () => void;
  onLoadFavorites: () => void;
  onSelectCustomThought: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
}) {
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
            className="gap-2 rounded-full border-indigo-200 bg-white text-indigo-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-md"
            title="다시 생성"
          >
            <RefreshCw className="size-4" />
          </Button>
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
