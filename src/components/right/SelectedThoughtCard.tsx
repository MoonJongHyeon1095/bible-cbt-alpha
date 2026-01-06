import { Bookmark } from "lucide-react";
import { Button } from "../ui/button";

interface SelectedThoughtCardProps {
  thought: string;
  className?: string;
  onSave?: () => void;
  canSave?: boolean;
}

export function SelectedThoughtCard({
  thought,
  className = "",
  onSave,
  canSave = false,
}: SelectedThoughtCardProps) {
  return (
    <div
      className={`bg-purple-50 p-4 rounded-lg border-2 border-purple-300 ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-purple-900">✓ 선택한 대안사고:</p>
        {canSave && onSave ? (
          <Button
            size="sm"
            variant="outline"
            onClick={onSave}
            className="gap-1 border-yellow-400 text-yellow-700 hover:bg-yellow-50"
          >
            <Bookmark className="size-4" />
            북마크 저장
          </Button>
        ) : null}
      </div>
      <p className="text-slate-800 italic">"{thought}"</p>
    </div>
  );
}
