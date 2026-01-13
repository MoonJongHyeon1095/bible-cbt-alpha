import { Check } from "lucide-react";
import type { KeyboardEvent, ReactNode } from "react";

type Tone = "blue" | "green" | "amber" | "rose";

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
  green: {
    base: "bg-white hover:border-green-300 hover:bg-green-50/70 border-green-100",
    selected: "border-green-400 bg-green-50/80",
    indicator: "bg-green-100 text-green-800",
    indicatorSelected: "bg-green-500 text-white",
    status: "text-slate-400 group-hover:text-green-700",
    statusSelected: "text-green-700",
  },
  amber: {
    base: "bg-white hover:border-amber-300 hover:bg-amber-50/70 border-amber-100",
    selected: "border-amber-400 bg-amber-50/80",
    indicator: "bg-amber-100 text-amber-800",
    indicatorSelected: "bg-amber-500 text-white",
    status: "text-slate-400 group-hover:text-amber-700",
    statusSelected: "text-amber-700",
  },
  rose: {
    base: "bg-white hover:border-rose-300 hover:bg-rose-50/70 border-rose-100",
    selected: "border-rose-400 bg-rose-50/80",
    indicator: "bg-rose-100 text-rose-800",
    indicatorSelected: "bg-rose-500 text-white",
    status: "text-slate-400 group-hover:text-rose-700",
    statusSelected: "text-rose-700",
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
