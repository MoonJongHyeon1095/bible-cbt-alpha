type EnteranceStepProgressProps = {
  className?: string;
  stepOrder: string[];
  currentIndex: number;
};

export function EnteranceStepProgress({
  className,
  stepOrder,
  currentIndex,
}: EnteranceStepProgressProps) {
  return (
    <div
      className={`flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 ${
        className ?? ""
      }`}
    >
      {stepOrder.map((item, index) => (
        <span
          key={item}
          className={`size-2 rounded-full ${
            index <= currentIndex
              ? "bg-slate-900 dark:bg-amber-300"
              : "bg-slate-300 dark:bg-slate-600"
          }`}
        />
      ))}
    </div>
  );
}
