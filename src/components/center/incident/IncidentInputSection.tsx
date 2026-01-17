import { Bookmark, FolderOpen, Loader2 } from "lucide-react";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import type { CbtMode } from "../../header/navigation/ModePicker";

interface IncidentInputSectionProps {
  userInput: string;
  onInputChange: (value: string) => void;
  onNext: () => void;
  mode: CbtMode;
  onChangeMode: (next: CbtMode) => void;
  onSaveTrigger: () => void;
  onOpenSavedTriggers: () => void;
  savingTrigger?: boolean;
}

export function IncidentInputSection({
  userInput,
  onInputChange,
  onNext,
  mode,
  onChangeMode,
  onSaveTrigger,
  onOpenSavedTriggers,
  savingTrigger = false,
}: IncidentInputSectionProps) {
  const isLite = mode.detailMode === "lite";
  const handleSelectDetailMode = (detailMode: CbtMode["detailMode"]) => {
    if (mode.detailMode === detailMode) return;
    onChangeMode({ ...mode, detailMode });
  };

  return (
    <div className="space-y-6 rounded-2xl border border-slate-200/70 bg-transparent p-5 shadow-sm">
      <div className="-mt-9 flex items-end gap-2">
        <button
          type="button"
          onClick={() => handleSelectDetailMode("lite")}
          className={`relative rounded-t-2xl border border-b-0 px-4 py-2 text-sm font-semibold transition ${
            isLite
              ? "border-amber-200 bg-amber-50 text-amber-900 shadow-sm"
              : "border-slate-200 bg-white text-slate-500 hover:text-slate-700"
          }`}
        >
          Lite
          <span
            className={`absolute -bottom-2 left-4 h-2 w-10 rounded-b-full border border-t-0 ${
              isLite
                ? "border-amber-200 bg-amber-50"
                : "border-slate-200 bg-white"
            }`}
          />
        </button>
        <button
          type="button"
          onClick={() => handleSelectDetailMode("deep")}
          className={`relative rounded-t-2xl border border-b-0 px-4 py-2 text-sm font-semibold transition ${
            !isLite
              ? "border-blue-200 bg-blue-50 text-blue-900 shadow-sm"
              : "border-slate-200 bg-white text-slate-500 hover:text-slate-700"
          }`}
        >
          심화
          <span
            className={`absolute -bottom-2 left-4 h-2 w-10 rounded-b-full border border-t-0 ${
              !isLite
                ? "border-blue-200 bg-blue-50"
                : "border-slate-200 bg-white"
            }`}
          />
        </button>
      </div>

      {isLite ? (
        <div className="pt-2">
          <Button
            onClick={onNext}
            className="w-full rounded-2xl bg-amber-50 text-base font-semibold text-amber-900 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg hover:bg-amber-100"
          >
            세션 시작하기
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-nowrap">
          <button
            onClick={onSaveTrigger}
            className="flex flex-none shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
            disabled={savingTrigger}
            title="감정노트에 저장"
          >
            {savingTrigger ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Bookmark className="size-4" />
            )}
            {savingTrigger ? "저장 중..." : "감정노트에 저장"}
          </button>

          <button
            onClick={onOpenSavedTriggers}
            className="flex flex-none shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-blue-200/70 bg-blue-50/80 px-3 py-2 text-sm font-semibold text-blue-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-100/80 hover:shadow-md"
            title="불러오기"
          >
            <FolderOpen className="size-4" />
            불러오기
          </button>
        </div>
      )}
      {/* 저장된 상황 불러오기는 모달로 분리 */}

      {!isLite && (
        <div className="space-y-2">
          <p className="text-base font-semibold text-slate-700">
            세션당 소요시간은 약 5분입니다.
          </p>
          <p className="text-sm text-slate-500">
            자세한 설명일수록 더욱 효과적입니다.
          </p>
        </div>
      )}

      {!isLite && (
        <Textarea
          value={userInput}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="여기에 직접 입력하세요..."
          className="min-h-[72px] sm:min-h-[80px] resize-none rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 text-[15px] leading-relaxed shadow-sm transition focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-200"
        />
      )}

      {!isLite && (
        <Button
          onClick={onNext}
          className="w-full rounded-2xl bg-blue-600 text-base font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg"
        >
          세션 시작하기
        </Button>
      )}
    </div>
  );
}
