import type { ReactNode } from "react";

type Tone = "blue";

const toneStyles: Record<
  Tone,
  { border: string; badge: string; title: string; text: string }
> = {
  blue: {
    border: "border-blue-200",
    badge: "border-blue-200 bg-blue-50 text-blue-800",
    title: "text-blue-900",
    text: "text-slate-500",
  },
};

interface SelectionPanelProps {
  title: string;
  description?: string;
  countText?: string;
  emptyText?: string;
  emptyTextClassName?: string;
  tone?: Tone;
  children?: ReactNode;
}

export function SelectionPanel({
  title,
  description,
  countText,
  emptyText,
  emptyTextClassName,
  tone = "blue",
  children,
}: SelectionPanelProps) {
  const styles = toneStyles[tone];

  return (
    <div
      className={`rounded-xl border ${styles.border} bg-white/95 p-4 shadow-sm`}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className={`text-sm font-semibold ${styles.title}`}>{title}</p>
          {description && (
            <p className={`text-xs ${styles.text} mt-1`}>{description}</p>
          )}
        </div>
        {countText && (
          <span
            className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${styles.badge}`}
          >
            {countText}
          </span>
        )}
      </div>
      {emptyText ? (
        <p className={`text-xs ${styles.text} mt-3 ${emptyTextClassName ?? ""}`}>
          {emptyText}
        </p>
      ) : (
        <div className="mt-3 flex flex-col gap-2">{children}</div>
      )}
    </div>
  );
}
