interface TagOption {
  id: string;
  label: string;
  colorClassName?: string;
}

interface TagSelectorProps {
  options: TagOption[];
  value: string;
  onSelect: (value: string) => void;
  selectedClassName?: string;
  unselectedClassName?: string;
  useOptionColor?: boolean;
}

export function TagSelector({
  options,
  value,
  onSelect,
  selectedClassName,
  unselectedClassName,
  useOptionColor = false,
}: TagSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = value === option.label;
        const selectedClass = useOptionColor
          ? option.colorClassName ?? ""
          : selectedClassName ?? "";
        const baseClass = selected
          ? selectedClass
          : unselectedClassName ??
            "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm active:scale-95";
        const selectedTextClass = selected && useOptionColor ? "text-slate-900" : "";

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.label)}
            className={[
              "px-3 py-1 text-xs font-semibold rounded-full border transition-all duration-150 focus-visible:outline-none",
              baseClass,
              selectedTextClass,
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
