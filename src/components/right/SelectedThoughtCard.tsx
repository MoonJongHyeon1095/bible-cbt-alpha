import { Bookmark, Loader2 } from "lucide-react";
import { Button } from "../ui/button";

interface SelectedThoughtCardProps {
  thought: string;
  className?: string;
  onSave?: () => void;
  canSave?: boolean;
  isLoggedIn?: boolean;
  saving?: boolean;
}

export function SelectedThoughtCard({
  thought,
  className = "",
  onSave,
  canSave = false,
  isLoggedIn = false,
  saving = false,
}: SelectedThoughtCardProps) {
  return (
    <div
      className={`bg-purple-50 p-4 rounded-lg border-2 border-purple-300 ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-purple-900">✓ 선택한 대안사고:</p>
        {isLoggedIn && canSave && onSave ? (
          <Button
            size="sm"
            variant="outline"
            onClick={onSave}
            className="gap-1 border-yellow-400 text-yellow-700 hover:bg-yellow-50"
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Bookmark className="size-4" />
            )}
            {saving ? "저장 중..." : "감정노트에 저장"}
          </Button>
        ) : null}
      </div>
      <p className="text-slate-800 italic">"{thought}"</p>
    </div>
  );
}
