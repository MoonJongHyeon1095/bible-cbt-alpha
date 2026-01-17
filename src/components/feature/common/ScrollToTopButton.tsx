import { ChevronUp, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../../ui/button";
import { cn } from "../../ui/utils";
import { useModalOpen } from "./hooks/useModalOpen";

interface ScrollToTopButtonProps {
  threshold?: number;
  className?: string;
  ariaLabel?: string;
  actionLabel?: string;
  actionAriaLabel?: string;
  actionClassName?: string;
  actionIcon?: ReactNode;
  onActionClick?: () => void;
  showAction?: boolean;
  forceAction?: boolean;
  hidden?: boolean;
}

export function ScrollToTopButton({
  threshold = 400,
  className,
  ariaLabel = "맨 위로 이동",
  actionLabel,
  actionAriaLabel,
  actionClassName,
  actionIcon,
  onActionClick,
  showAction = true,
  forceAction = false,
  hidden = false,
}: ScrollToTopButtonProps) {
  const isModalOpen = useModalOpen();
  const [visible, setVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(min-width: 768px)").matches;
  });
  const lastScrollTargetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = (event?: Event) => {
      const target = event?.target;
      if (target instanceof HTMLElement) {
        const scrollable = target.scrollHeight > target.clientHeight;
        if (scrollable) {
          lastScrollTargetRef.current = target;
          setVisible(target.scrollTop > threshold);
          return;
        }
      }

      const scrollTop =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      lastScrollTargetRef.current = null;
      setVisible(scrollTop > threshold);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("scroll", handleScroll, {
      passive: true,
      capture: true,
    });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [threshold]);

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

  const baseStyle = {
    bottom:
      "calc(env(safe-area-inset-bottom) + var(--mobile-tabbar-height, 96px) + 16px)",
  };

  const baseClassName = cn(
    "fixed z-[60] rounded-full shadow-lg",
    "right-5",
    "transition-all duration-300"
  );

  const shouldShowAction =
    showAction && actionLabel && onActionClick && (forceAction || !visible);

  if (hidden || isModalOpen) {
    return null;
  }

  if (shouldShowAction) {
    return (
      <Button
        type="button"
        aria-label={actionAriaLabel ?? actionLabel}
        onClick={onActionClick}
        style={baseStyle}
        className={cn(
          baseClassName,
          "px-4 py-3 rounded-full",
          actionClassName ?? "bg-indigo-600 text-white hover:bg-indigo-700",
          className
        )}
      >
        {actionIcon ?? <Plus className="size-5 mr-2" />}
        {actionLabel}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size="icon"
      aria-label={ariaLabel}
      onClick={() => {
        const target = lastScrollTargetRef.current;
        if (target) {
          target.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      style={baseStyle}
      className={cn(
        baseClassName,
        "bg-indigo-600 text-white",
        visible
          ? "opacity-100 translate-y-0"
          : "pointer-events-none opacity-0 translate-y-4",
        className
      )}
    >
      <ChevronUp className="size-5" />
    </Button>
  );
}
