import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { DialogClose } from "../../../../../ui/dialog";
import { X } from "lucide-react";

type Tone = "amber" | "rose" | "green" | "blue";

const toneMap: Record<
  Tone,
  {
    border: string;
    headerBorder: string;
    headerText: string;
    bodyBg: string;
    closeBorder: string;
    closeText: string;
    closeHover: string;
  }
> = {
  amber: {
    border: "border-amber-200",
    headerBorder: "border-amber-200",
    headerText: "text-amber-900",
    bodyBg: "bg-amber-50/70",
    closeBorder: "border-amber-200",
    closeText: "text-amber-700",
    closeHover: "hover:bg-amber-50",
  },
  rose: {
    border: "border-rose-200",
    headerBorder: "border-rose-200",
    headerText: "text-slate-800",
    bodyBg: "bg-rose-50/70",
    closeBorder: "border-rose-200",
    closeText: "text-rose-700",
    closeHover: "hover:bg-rose-50",
  },
  green: {
    border: "border-green-200",
    headerBorder: "border-green-200",
    headerText: "text-slate-800",
    bodyBg: "bg-green-50/70",
    closeBorder: "border-green-200",
    closeText: "text-green-700",
    closeHover: "hover:bg-green-50",
  },
  blue: {
    border: "border-blue-200",
    headerBorder: "border-blue-200",
    headerText: "text-slate-800",
    bodyBg: "bg-blue-50/70",
    closeBorder: "border-blue-200",
    closeText: "text-blue-700",
    closeHover: "hover:bg-blue-50",
  },
};

type PatternAddSectionShellProps = {
  tone: Tone;
  title: string;
  icon: LucideIcon;
  bodyClassName?: string;
  onClose?: () => void;
  children: ReactNode;
};

export function PatternAddSectionShell({
  tone,
  title,
  icon: Icon,
  bodyClassName,
  onClose,
  children,
}: PatternAddSectionShellProps) {
  const styles = toneMap[tone];

  return (
    <div className={`border ${styles.border} rounded-xl bg-white shadow-sm`}>
      <div
        className={`border-b ${styles.headerBorder} px-4 py-3 text-sm font-semibold ${styles.headerText} flex items-center justify-between gap-2`}
      >
        <div className="flex items-center gap-2">
          <Icon className="size-4" />
          {title}
        </div>
        <DialogClose asChild>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-full border ${styles.closeBorder} bg-white p-2 ${styles.closeText} transition ${styles.closeHover}`}
            aria-label="닫기"
          >
            <X className="size-4" />
          </button>
        </DialogClose>
      </div>
      <div className={`p-5 space-y-4 ${styles.bodyBg} ${bodyClassName ?? ""}`}>
        {children}
      </div>
    </div>
  );
}
