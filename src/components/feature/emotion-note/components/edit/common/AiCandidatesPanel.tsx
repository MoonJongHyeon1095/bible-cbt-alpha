import type { ReactNode } from "react";

interface AiCandidatesPanelProps {
  title: string;
  description?: string;
  countText?: string;
  tone?: "blue";
  children: ReactNode;
}

const toneStyles: Record<"blue", { border: string; badge: string; title: string }> =
  {
    blue: {
      border: "border-blue-200",
      badge: "border-blue-200 bg-blue-50 text-blue-800",
      title: "text-blue-900",
    },
  };

export function AiCandidatesPanel({
  title,
  description,
  countText,
  tone = "blue",
  children,
}: AiCandidatesPanelProps) {
  const styles = toneStyles[tone];
  return (
    <div className={`rounded-xl border ${styles.border} bg-white/95 p-4 shadow-sm`}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className={`text-sm font-semibold ${styles.title}`}>{title}</p>
          {description && (
            <p className="text-xs text-slate-500 mt-1">{description}</p>
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
      <div className="mt-3 flex flex-col gap-2">{children}</div>
    </div>
  );
}
