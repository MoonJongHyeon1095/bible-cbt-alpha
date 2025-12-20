// src/components/tool/ToolHistoryButton.tsx
import { History } from "lucide-react";
import { ToolButton } from "./ToolButton";

type Props = { onOpenHistory: () => void };

export function ToolHistoryButton({ onOpenHistory }: Props) {
  return (
    <ToolButton
      onClick={onOpenHistory}
      title="이전 기록"
      className="bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-lg gap-2 px-4 py-4"
      icon={<History className="size-4" />}
      label="기록"
    />
  );
}
