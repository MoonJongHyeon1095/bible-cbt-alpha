import { ArrowRight } from "lucide-react";
import { createPortal } from "react-dom";

interface MinimalFloatingNextButtonProps {
  onClick: () => void;
  ariaLabel?: string;
  disabled?: boolean;
}

export function MinimalFloatingNextButton({
  onClick,
  ariaLabel = "다음으로",
  disabled = false,
}: MinimalFloatingNextButtonProps) {
  const button = (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      className={`fixed bottom-6 right-6 z-20 inline-flex size-20 items-center justify-center rounded-full border border-slate-300 bg-white/90 text-slate-800 shadow-sm transition hover:border-slate-400 ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <ArrowRight className="size-8" />
    </button>
  );

  if (typeof document === "undefined") {
    return button;
  }

  return createPortal(button, document.body);
}
