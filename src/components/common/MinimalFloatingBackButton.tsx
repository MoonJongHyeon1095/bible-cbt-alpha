import { Undo2 } from "lucide-react";

interface MinimalFloatingBackButtonProps {
  onClick: () => void;
  ariaLabel?: string;
  disabled?: boolean;
}

export function MinimalFloatingBackButton({
  onClick,
  ariaLabel = "이전으로",
  disabled = false,
}: MinimalFloatingBackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      className={`inline-flex size-12 items-center justify-center text-slate-600 transition hover:text-slate-900 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <Undo2 className="size-5" />
    </button>
  );
}
