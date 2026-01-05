import { RefreshCw, Star } from "lucide-react";
import { Button } from "../ui/button";

interface FavoritesAndRetryRowProps {
  onRetry: () => void;
  onFavorite: () => void;
}

export function FavoritesAndRetryRow({
  onRetry,
  onFavorite,
}: FavoritesAndRetryRowProps) {
  return (
    <div className="flex gap-2">
      <Button
        onClick={onRetry}
        variant="outline"
        className="flex-1 gap-2 border-purple-300 text-purple-700 hover:bg-purple-50"
      >
        <RefreshCw className="size-4" />
        다른 답변 검토하기
      </Button>

      <Button
        onClick={onFavorite}
        variant="outline"
        className="gap-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
        title="질문을 즐겨찾기에 추가"
      >
        <Star className="size-4" />
        즐겨찾기
      </Button>
    </div>
  );
}
