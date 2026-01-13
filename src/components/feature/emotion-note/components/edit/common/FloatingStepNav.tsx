import { ArrowLeft } from "lucide-react";
import { createPortal } from "react-dom";
import { Button } from "../../../../../ui/button";

interface FloatingStepNavProps {
  show: boolean;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  showBack?: boolean;
  onBack?: () => void;
  tone?: "blue" | "green" | "amber" | "rose";
}

const toneStyles: Record<
  "blue" | "green" | "amber" | "rose",
  { back: string; next: string }
> = {
  blue: {
    back: "border-blue-200 bg-white text-blue-600 hover:bg-blue-50",
    next: "bg-blue-500 text-white hover:bg-blue-600",
  },
  green: {
    back: "border-green-200 bg-white text-green-600 hover:bg-green-50",
    next: "bg-green-500 text-white hover:bg-green-600",
  },
  amber: {
    back: "border-amber-200 bg-white text-amber-600 hover:bg-amber-50",
    next: "bg-amber-500 text-white hover:bg-amber-600",
  },
  rose: {
    back: "border-rose-200 bg-white text-rose-600 hover:bg-rose-50",
    next: "bg-rose-500 text-white hover:bg-rose-600",
  },
};

export function FloatingStepNav({
  show,
  onNext,
  nextDisabled,
  nextLabel = "다음",
  showBack,
  onBack,
  tone = "blue",
}: FloatingStepNavProps) {
  const floatingRoot =
    typeof document !== "undefined"
      ? document.querySelector('[data-floating-root="pattern-edit"]')
      : null;
  const styles = toneStyles[tone];

  if (!show || !floatingRoot) return null;

  return createPortal(
    <div className="pointer-events-none absolute bottom-4 right-4 z-20">
      <div className="pointer-events-auto flex items-center gap-2">
        {showBack && onBack && (
          <Button
            size="icon"
            variant="outline"
            onClick={onBack}
            className={`rounded-full ${styles.back}`}
            aria-label="뒤로가기"
          >
            <ArrowLeft className="size-4" />
          </Button>
        )}
        <Button
          size="sm"
          onClick={onNext}
          disabled={nextDisabled}
          className={`${styles.next} shadow-lg`}
        >
          {nextLabel}
        </Button>
      </div>
    </div>,
    floatingRoot
  );
}
