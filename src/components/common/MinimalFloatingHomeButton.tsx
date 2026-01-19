import { Home } from "lucide-react";

interface MinimalFloatingHomeButtonProps {
  onClick: () => void;
  ariaLabel?: string;
  disabled?: boolean;
}

export function MinimalFloatingHomeButton({
  onClick,
  ariaLabel = "홈으로",
  disabled = false,
}: MinimalFloatingHomeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      className={`inline-flex size-10 items-center justify-center rounded-full bg-white/80 text-slate-600 shadow-sm backdrop-blur transition hover:text-slate-900 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <Home className="size-5" />
    </button>
  );
}
