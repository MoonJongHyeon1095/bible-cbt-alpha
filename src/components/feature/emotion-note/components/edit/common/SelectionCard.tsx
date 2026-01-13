import { Check } from "lucide-react";
import type { KeyboardEvent, ReactNode } from "react";

type Tone = "blue";

const toneStyles: Record<
  Tone,
  {
    base: string;
    selected: string;
    indicator: string;
    indicatorSelected: string;
    status: string;
    statusSelected: string;
  }
> = {
  blue: {
    base: "bg-white hover:border-blue-300 hover:bg-blue-50/70 border-blue-100",
    selected: "border-blue-400 bg-blue-50/80",
    indicator: "bg-blue-100 text-blue-800",
    indicatorSelected: "bg-blue-500 text-white",
    status: "text-slate-400 group-hover:text-blue-700",
    statusSelected: "text-blue-700",
  },
};

interface SelectionCardProps {
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
  tone?: Tone;
  contentClassName?: string;
}

export function SelectionCard({
  selected,
  onSelect,
  children,
  tone = "blue",
  contentClassName,
}: SelectionCardProps) {
  const styles = toneStyles[tone];
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      aria-pressed={selected}
      className={[
        "group flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left transition",
        styles.base,
        selected ? styles.selected : "",
      ].join(" ")}
    >
      <span
        className={[
          "mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold",
          selected ? styles.indicatorSelected : styles.indicator,
        ].join(" ")}
      >
        {selected ? <Check className="size-3" /> : ""}
      </span>
      <div className={contentClassName ? `flex-1 ${contentClassName}` : "flex-1"}>
        {children}
      </div>
      <span
        className={[
          "mt-0.5 text-xs font-semibold",
          selected ? styles.statusSelected : styles.status,
        ].join(" ")}
      >
        {selected ? "선택됨" : "선택"}
      </span>
    </div>
  );
}
