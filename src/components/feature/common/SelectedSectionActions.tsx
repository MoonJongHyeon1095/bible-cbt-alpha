import { Edit2, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import { cn } from "../../ui/utils";
import { useModalOpen } from "./hooks/useModalOpen";

type SectionTheme =
  | "details"
  | "errors"
  | "alternatives"
  | "behaviors"
  | "prayer"
  | "scripture"
  | "history";

interface SelectedSectionActionsProps {
  theme: SectionTheme;
  onEdit: () => void;
  onAdd?: () => void;
  editLabel?: string;
  addLabel?: string;
  editAriaLabel?: string;
  addAriaLabel?: string;
  editIcon?: ReactNode;
  hidden?: boolean;
  className?: string;
}

export function SelectedSectionActions({
  theme,
  onEdit,
  onAdd,
  editLabel = "편집",
  addLabel = "추가",
  editAriaLabel,
  addAriaLabel,
  editIcon,
  hidden = false,
  className,
}: SelectedSectionActionsProps) {
  const isModalOpen = useModalOpen();
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(min-width: 768px)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(media.matches);
    update();
    if (media.addEventListener) {
      media.addEventListener("change", update);
    } else {
      media.addListener(update);
    }
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", update);
      } else {
        media.removeListener(update);
      }
    };
  }, []);

  if (hidden || isModalOpen) return null;

  const themeStyles =
    theme === "details"
      ? {
          action: "bg-amber-500 text-white hover:bg-amber-600",
          left: "bg-white border border-amber-200 text-amber-700 hover:bg-amber-50",
          wrap:
            "border-amber-200 bg-amber-50/95 ring-amber-100 shadow-amber-900/10",
        }
      : theme === "errors"
      ? {
          action: "bg-rose-500 text-white hover:bg-rose-600",
          left: "bg-white border border-rose-200 text-rose-700 hover:bg-rose-50",
          wrap:
            "border-rose-200 bg-rose-50/95 ring-rose-100 shadow-rose-900/10",
        }
      : theme === "alternatives"
      ? {
          action: "bg-green-500 text-white hover:bg-green-600",
          left: "bg-white border border-green-200 text-green-700 hover:bg-green-50",
          wrap:
            "border-green-200 bg-green-50/95 ring-green-100 shadow-green-900/10",
        }
      : theme === "behaviors"
      ? {
          action: "bg-blue-500 text-white hover:bg-blue-600",
          left: "bg-white border border-blue-200 text-blue-700 hover:bg-blue-50",
          wrap:
            "border-blue-200 bg-blue-50/95 ring-blue-100 shadow-blue-900/10",
        }
      : theme === "prayer"
      ? {
          action: "bg-emerald-700 text-white hover:bg-emerald-800",
          left: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-900/10",
          wrap:
            "border-emerald-200 bg-emerald-50/95 ring-emerald-100 shadow-emerald-900/10",
        }
      : theme === "history"
      ? {
          action:
            "bg-white border border-slate-200 text-slate-700 hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700",
          left: "bg-white border border-slate-200 text-slate-700 hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700",
          wrap:
            "border-slate-200 bg-white/95 ring-slate-100 shadow-slate-900/10",
        }
      : {
          action: "bg-emerald-700 text-white hover:bg-emerald-800",
          left: "bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50",
          wrap:
            "border-emerald-200 bg-emerald-50/95 ring-emerald-100 shadow-emerald-900/10",
        };

  const baseStyle = {
    bottom:
      "calc(env(safe-area-inset-bottom) + var(--mobile-tabbar-height, 96px) + 16px)",
  };

  const showGroupWrap = Boolean(onAdd);

  return (
    <div
      style={baseStyle}
      className={cn("fixed z-[60] right-5", className)}
    >
      <div
        className={cn(
          "flex items-center gap-2",
          showGroupWrap &&
            cn(
              "rounded-2xl border px-3 py-2 shadow-lg ring-1 backdrop-blur",
              themeStyles.wrap
            )
        )}
      >
        <Button
          type="button"
          aria-label={editAriaLabel ?? editLabel}
          onClick={onEdit}
          className={cn("px-3 py-2 rounded-full", themeStyles.left)}
        >
          {editIcon ?? <Edit2 className="size-4 mr-1" />}
          {editLabel}
        </Button>
        {onAdd && (
          <Button
            type="button"
            aria-label={addAriaLabel ?? addLabel}
            onClick={onAdd}
            className={cn("px-4 py-3 rounded-full", themeStyles.action)}
          >
            <Plus className="size-5 mr-2" />
            {addLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
