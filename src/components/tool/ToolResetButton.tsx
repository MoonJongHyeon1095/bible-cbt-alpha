// src/components/tool/ToolResetButton.tsx

import { RotateCcw } from "lucide-react";
import { ToolButton } from "./ToolButton";

type Props = { onReset: () => void };

export function ToolResetButton({ onReset }: Props) {
  return (
    <ToolButton
      onClick={onReset}
      title="처음부터 다시하기"
      className="bg-white hover:bg-red-50 border border-red-200 text-red-600 shadow-lg gap-2 px-4 py-4"
      icon={<RotateCcw className="size-4" />}
      label="다시하기"
    />
  );
}
