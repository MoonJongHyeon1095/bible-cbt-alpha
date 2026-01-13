import { useEffect } from "react";
import type { RefObject } from "react";

interface UseAutoCloseOnScrollParams {
  isOpen: boolean;
  targetRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  graceMs?: number;
  debounceMs?: number;
}

export function useAutoCloseOnScroll({
  isOpen,
  targetRef,
  onClose,
  graceMs = 600,
  debounceMs = 250,
}: UseAutoCloseOnScrollParams) {
  useEffect(() => {
    if (!isOpen) return;
    const target = targetRef.current;
    if (!target || typeof window === "undefined") return;

    let closeTimer: number | null = null;
    const openedAt = Date.now();

    const clearCloseTimer = () => {
      if (closeTimer !== null) {
        window.clearTimeout(closeTimer);
        closeTimer = null;
      }
    };

    const handleScroll = () => {
      const rect = target.getBoundingClientRect();
      const outOfView = rect.bottom < 0 || rect.top > window.innerHeight;
      if (!outOfView) {
        clearCloseTimer();
        return;
      }

      if (Date.now() - openedAt < graceMs) {
        return;
      }

      if (closeTimer === null) {
        closeTimer = window.setTimeout(() => {
          onClose();
        }, debounceMs);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearCloseTimer();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isOpen, targetRef, onClose, graceMs, debounceMs]);
}
