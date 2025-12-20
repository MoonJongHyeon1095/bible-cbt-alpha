// src/components/tool/ToolButton.tsx
import type { ReactNode } from "react";
import { Button } from "../ui/button";

type ToolButtonProps = {
  onClick: () => void;
  title: string;
  className: string;
  icon: ReactNode;
  label: string;
};

export function ToolButton({
  onClick,
  title,
  className,
  icon,
  label,
}: ToolButtonProps) {
  return (
    <Button onClick={onClick} className={className} title={title}>
      {icon}
      <span className="text-sm">{label}</span>
    </Button>
  );
}
