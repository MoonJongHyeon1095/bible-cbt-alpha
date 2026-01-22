import { RefreshCw } from "lucide-react";

interface MinimalAutoThoughtControlSectionProps {
  disabled: boolean;
  showCustomButton: boolean;
  onNextThought: () => void;
  onEnableCustom: () => void;
}

export function MinimalAutoThoughtControlSection({
  disabled,
  showCustomButton,
  onNextThought,
  onEnableCustom,
}: MinimalAutoThoughtControlSectionProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onNextThought}
        aria-label="다른 생각 보기"
        disabled={disabled}
        className={`inline-flex size-8 items-center justify-center text-slate-500 transition active:scale-95 ${
          disabled ? "opacity-40 cursor-not-allowed" : "hover:text-slate-900"
        }`}
      >
        <RefreshCw className="size-5" strokeWidth={2.5} />
      </button>

      {showCustomButton && (
        <button
          type="button"
          onClick={onEnableCustom}
          className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 hover:shadow-md"
        >
          또는 직접 생각을 작성해보세요
        </button>
      )}
    </div>
  );
}
