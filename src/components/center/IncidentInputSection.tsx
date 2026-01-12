import { Bookmark, FolderOpen, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

interface IncidentInputSectionProps {
  userInput: string;
  onInputChange: (value: string) => void;
  onNext: () => void;
  onSaveTrigger: () => void;
  onOpenSavedTriggers: () => void;
  savingTrigger?: boolean;
}

export function IncidentInputSection({
  userInput,
  onInputChange,
  onNext,
  onSaveTrigger,
  onOpenSavedTriggers,
  savingTrigger = false,
}: IncidentInputSectionProps) {
  return (
    <div className="space-y-6 rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-blue-50/60 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <button
          onClick={onSaveTrigger}
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
          disabled={savingTrigger}
          title="감정노트에 저장"
        >
          {savingTrigger ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Bookmark className="size-4" />
          )}
          {savingTrigger ? "저장 중..." : "감정 노트에 저장"}
        </button>

        <button
          onClick={onOpenSavedTriggers}
          className="flex items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50/80 px-3 py-2 text-sm font-semibold text-blue-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-100/80 hover:shadow-md"
          title="불러오기"
        >
          <FolderOpen className="size-4" />
          불러오기
        </button>
      </div>
      {/* 저장된 상황 불러오기는 모달로 분리 */}

      <div className="space-y-2">
        <p className="text-base font-semibold text-slate-700">
          작성한 글을 토대로 세션을 진행합니다.
        </p>
        <p className="text-sm text-slate-500">
          세션당 소요시간은 <strong>약 5분</strong>입니다.
        </p>
        <p className="text-sm text-blue-700">
          💡 자세한 설명일수록 더욱 효과적입니다.
        </p>
      </div>

      <Textarea
        value={userInput}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder="여기에 직접 입력하세요..."
        className="min-h-[170px] resize-none rounded-2xl border border-slate-200 bg-white/90 p-4 text-sm shadow-sm transition focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-200"
      />

      <Button
        onClick={onNext}
        className="w-full rounded-2xl bg-blue-600 text-base font-semibold shadow-md transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg"
      >
        세션 시작하기
      </Button>
    </div>
  );
}
