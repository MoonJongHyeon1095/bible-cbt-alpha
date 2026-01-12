import { Bookmark, Check, Loader2 } from "lucide-react";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";

export function CustomThoughtSection({
  customThought,
  customThoughtTrimmed,
  selectedThoughtIndex,
  savingDetail,
  savingDetailId,
  isDetailSaved,
  onCustomThoughtChange,
  onSaveCustomThought,
  onSelectCustomThought,
}: {
  customThought: string;
  customThoughtTrimmed: string;
  selectedThoughtIndex: number | null;
  savingDetail: boolean;
  savingDetailId: string | null;
  isDetailSaved?: (thought: string) => boolean;
  onCustomThoughtChange: (value: string) => void;
  onSaveCustomThought: () => void;
  onSelectCustomThought: () => void;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/60 p-5 shadow-sm">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <p className="text-base font-semibold text-slate-700">
            ✍️ 또는 당신의 생각을 직접 적어보세요
          </p>
          {customThoughtTrimmed && (
            <Button
              onClick={onSaveCustomThought}
              variant="outline"
              size="sm"
              disabled={
                savingDetail || (isDetailSaved?.(customThoughtTrimmed) ?? false)
              }
              className="gap-2 whitespace-nowrap rounded-full border-amber-200 bg-white/90 text-amber-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              title="이 생각을 감정 노트에 저장"
            >
              {savingDetail && savingDetailId === customThoughtTrimmed ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  저장 중...
                </>
              ) : isDetailSaved?.(customThoughtTrimmed) ? (
                <>
                  <Check className="size-4" />
                  저장됨
                </>
              ) : (
                <>
                  <Bookmark
                    className={`size-4 ${
                      isDetailSaved?.(customThoughtTrimmed)
                        ? "text-amber-600"
                        : ""
                    }`}
                    fill={
                      isDetailSaved?.(customThoughtTrimmed)
                        ? "currentColor"
                        : "none"
                    }
                  />
                  저장하기
                </>
              )}
            </Button>
          )}
        </div>
        <p className="text-sm text-slate-500">
          솔직한 문장이 가장 좋은 출발점입니다.
        </p>
      </div>

      <div className="relative">
        <Textarea
          value={customThought}
          onChange={(e) => onCustomThoughtChange(e.target.value)}
          placeholder="예: 나는 이렇게 하면 안 된다고 생각해..."
          className="min-h-[72px] resize-none rounded-2xl border border-slate-200 bg-white/90 p-3 text-[15px] leading-relaxed shadow-sm transition focus-visible:border-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-200"
        />
      </div>

      {customThoughtTrimmed && (
        <Button
          onClick={onSelectCustomThought}
          className={`w-full rounded-2xl text-base font-semibold shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg ${
            selectedThoughtIndex === 999
              ? "bg-purple-600 hover:bg-purple-700"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {selectedThoughtIndex === 999 && <Check className="size-4 mr-2" />}
          직접 입력한 생각으로 진행
        </Button>
      )}
    </div>
  );
}
