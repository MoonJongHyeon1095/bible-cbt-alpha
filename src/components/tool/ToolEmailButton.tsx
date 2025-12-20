// src/components/tool/ToolEmailButton.tsx
import { Mail } from "lucide-react";
import { ToolButton } from "./ToolButton";

type Props = { onOpenEmail: () => void };

export function ToolEmailButton({ onOpenEmail }: Props) {
  return (
    <ToolButton
      onClick={onOpenEmail}
      title="메일"
      className="bg-white hover:bg-purple-50 border border-purple-200 text-purple-600 shadow-lg gap-2 px-4 py-4"
      icon={<Mail className="size-4" />}
      label="메일"
    />
  );
}
