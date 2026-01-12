import { ArrowLeft, Bookmark, Loader2 } from "lucide-react";
import { Button } from "../ui/button";

interface SelectedThoughtCardProps {
  thought: string;
  className?: string;
  onSave?: () => void;
  canSave?: boolean;
  saving?: boolean;
  saved?: boolean;
  onBackToAlternatives?: () => void;
  backDisabled?: boolean;
}

export function SelectedThoughtCard({
  thought,
  className = "",
  onSave,
  canSave = false,
  saving = false,
  saved = false,
  onBackToAlternatives,
  backDisabled = false,
}: SelectedThoughtCardProps) {
  const canShowSave = canSave && onSave;
  const canShowBack = Boolean(onBackToAlternatives);

  return (
    <div
      className={`rounded-2xl border border-purple-200/70 bg-purple-50 p-5 shadow-sm ${className}`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base font-semibold text-purple-800">
            선택한 대안사고
          </p>
          <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto">
            {canShowBack ? (
              <Button
                size="sm"
                variant="outline"
                onClick={onBackToAlternatives}
                className="gap-1 border-purple-300 text-purple-700 hover:bg-purple-50 whitespace-normal leading-tight"
                disabled={backDisabled}
              >
                <ArrowLeft className="size-4" />
                다른 대안사고 보기
              </Button>
            ) : null}
            {canShowSave ? (
              <Button
                size="sm"
                variant="outline"
                onClick={onSave}
                className="gap-1 border-yellow-400 text-yellow-700 hover:bg-yellow-50 whitespace-normal leading-tight"
                disabled={saving || saved}
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : saved ? (
                  <Bookmark className="size-4 text-purple-600" />
                ) : (
                  <Bookmark className="size-4" />
                )}
                {saving ? "저장 중..." : saved ? "저장됨" : "감정노트에 저장"}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      <p
        className="mt-2 text-[15px] leading-7 text-slate-800"
        style={{
          fontFamily:
            '"Nanum Myeongjo", "Noto Serif KR", "Apple SD Gothic Neo", serif',
        }}
      >
        {thought}
      </p>
    </div>
  );
}
