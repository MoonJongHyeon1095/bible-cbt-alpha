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
        }
      : theme === "errors"
      ? {
          action: "bg-rose-500 text-white hover:bg-rose-600",
          left: "bg-white border border-rose-200 text-rose-700 hover:bg-rose-50",
        }
      : theme === "alternatives"
      ? {
          action: "bg-green-500 text-white hover:bg-green-600",
          left: "bg-white border border-green-200 text-green-700 hover:bg-green-50",
        }
      : theme === "behaviors"
      ? {
          action: "bg-blue-500 text-white hover:bg-blue-600",
          left: "bg-white border border-blue-200 text-blue-700 hover:bg-blue-50",
        }
      : theme === "prayer"
      ? {
          action: "bg-emerald-700 text-white hover:bg-emerald-800",
          left: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-900/10",
        }
      : theme === "history"
      ? {
          action:
            "bg-white border border-slate-200 text-slate-700 hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700",
          left: "bg-white border border-slate-200 text-slate-700 hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700",
        }
      : {
          action: "bg-emerald-700 text-white hover:bg-emerald-800",
          left: "bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50",
        };

  const baseStyle = {
    bottom:
      "calc(env(safe-area-inset-bottom) + var(--mobile-tabbar-height, 96px) + 16px)",
  };

  return (
    <div
      style={baseStyle}
      className={cn("fixed z-[60] right-5", className)}
    >
      <div className="flex items-center gap-2">
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
