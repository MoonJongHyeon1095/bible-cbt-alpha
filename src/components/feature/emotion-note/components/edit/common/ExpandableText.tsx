interface ExpandableTextProps {
  text: string;
  expanded: boolean;
  onToggle: () => void;
  tone?: "blue" | "green" | "amber" | "rose";
}

const toneText: Record<"blue" | "green" | "amber" | "rose", string> = {
  blue: "text-blue-700",
  green: "text-green-700",
  amber: "text-amber-700",
  rose: "text-rose-700",
};

export function ExpandableText({
  text,
  expanded,
  onToggle,
  tone = "blue",
}: ExpandableTextProps) {
  return (
    <>
      <p
        className={[
          "text-sm text-slate-700 leading-relaxed",
          expanded ? "whitespace-pre-line" : "line-clamp-2",
        ].join(" ")}
      >
        {text}
      </p>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
        className={`text-xs font-semibold hover:underline ${toneText[tone]}`}
      >
        {expanded ? "접기" : "더보기"}
      </button>
    </>
  );
}
