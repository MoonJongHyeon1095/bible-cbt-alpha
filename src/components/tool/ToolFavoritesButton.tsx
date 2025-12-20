// src/components/tool/ToolFavoritesButton.tsx
import { Star } from "lucide-react";
import { ToolButton } from "./ToolButton";

type Props = { onOpenFavorites: () => void };

export function ToolFavoritesButton({ onOpenFavorites }: Props) {
  return (
    <ToolButton
      onClick={onOpenFavorites}
      title="즐겨찾기"
      className="bg-white hover:bg-yellow-50 border border-yellow-200 text-yellow-600 shadow-lg gap-2 px-4 py-4"
      icon={<Star className="size-4" />}
      label="즐겨찾기"
    />
  );
}
