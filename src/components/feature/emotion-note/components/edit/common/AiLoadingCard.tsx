import { Loader2 } from "lucide-react";

interface AiLoadingCardProps {
  title: string;
  description: string;
  tone?: "blue" | "green" | "amber" | "rose";
}

const toneStyles: Record<
  "blue" | "green" | "amber" | "rose",
  { icon: string; pulse: string; border: string }
> = {
  blue: {
    icon: "text-blue-500",
    pulse: "bg-blue-100",
    border: "border-blue-200",
  },
  green: {
    icon: "text-green-500",
    pulse: "bg-green-100",
    border: "border-green-200",
  },
  amber: {
    icon: "text-amber-500",
    pulse: "bg-amber-100",
    border: "border-amber-200",
  },
  rose: {
    icon: "text-rose-500",
    pulse: "bg-rose-100",
    border: "border-rose-200",
  },
};

export function AiLoadingCard({
  title,
  description,
  tone = "blue",
}: AiLoadingCardProps) {
  const styles = toneStyles[tone];
  return (
    <div className={`rounded-2xl border ${styles.border} bg-white p-5 shadow-sm`}>
      <div className="flex items-center gap-3">
        <Loader2 className={`size-5 animate-spin ${styles.icon}`} />
        <div>
          <p className="text-slate-900 font-semibold">{title}</p>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <div className="mt-4 space-y-2 animate-pulse">
        <div className={`h-3 rounded-full ${styles.pulse} w-5/6`} />
        <div className={`h-3 rounded-full ${styles.pulse} w-4/6`} />
        <div className={`h-3 rounded-full ${styles.pulse} w-3/6`} />
      </div>
    </div>
  );
}
