import { Bookmark, Loader2, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";

interface SelectedThoughtCardProps {
  thought: string;
  className?: string;
  onSave?: () => void;
  canSave?: boolean;
  saving?: boolean;
  saved?: boolean;
  onReviewAlternatives?: () => void;
  reviewDisabled?: boolean;
}

export function SelectedThoughtCard({
  thought,
  className = "",
  onSave,
  canSave = false,
  saving = false,
  saved = false,
  onReviewAlternatives,
  reviewDisabled = false,
}: SelectedThoughtCardProps) {
  const canShowSave = canSave && onSave;
  const canShowReview = Boolean(onReviewAlternatives);

  return (
    <div
      className={`bg-purple-50 p-4 rounded-lg border-2 border-purple-300 ${className}`}
    >
      <div className="flex flex-col gap-2 mb-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-purple-900 whitespace-nowrap">✓ 선택한 대안사고</p>
        <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto">
          {canShowReview ? (
            <Button
              size="sm"
              variant="outline"
              onClick={onReviewAlternatives}
              className="gap-1 border-purple-300 text-purple-700 hover:bg-purple-50 whitespace-normal leading-tight"
              disabled={reviewDisabled}
            >
              <RefreshCw className="size-4" />
              다른 답변 검토하기
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
      <p className="text-slate-800 italic">"{thought}"</p>
    </div>
  );
}
