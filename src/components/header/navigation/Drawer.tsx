// src/components/header/Drawer.tsx
import * as React from "react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right";
  width?: number; // px (max width)
  children: React.ReactNode;
};

const ANIM_MS = 220;

// SSR 안전하게 layout effect
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function Drawer({
  open,
  onClose,
  side = "left",
  width = 360,
  children,
}: DrawerProps) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open); // transform 상태
  const closeTimer = useRef<number | null>(null);

  // open -> mount + show (애니메이션)
  useEffect(() => {
    if (open) {
      setMounted(true);
      // 다음 tick에 visible=true로 올려서 transition 보장
      requestAnimationFrame(() => setVisible(true));
      return;
    }

    // open=false -> hide + after anim unmount
    setVisible(false);
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      setMounted(false);
    }, ANIM_MS);

    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    };
  }, [open]);

  // ESC 닫기 + body scroll lock
  useEffect(() => {
    if (!mounted) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [mounted, onClose]);

  // drawer width: min( props.width, viewport*0.86 )  + resize 대응
  const [vw, setVw] = useState<number>(() =>
    typeof window === "undefined" ? 1200 : window.innerWidth
  );

  useIsoLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const onResize = () => setVw(window.innerWidth);
    onResize();

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const drawerW = useMemo(() => {
    const candidate = Math.round(vw * 0.86);
    return Math.min(width, candidate);
  }, [vw, width]);

  if (!mounted) return null;

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 10000,
    opacity: visible ? 1 : 0,
    transition: `opacity ${ANIM_MS}ms ease`,
  };

  const baseDrawerStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    bottom: 0,
    width: drawerW,
    background: "#fff",
    color: "#0f172a",
    boxShadow: "0 16px 48px rgba(0,0,0,0.25)",
    zIndex: 10001,
    transition: `transform ${ANIM_MS}ms ease`,
    display: "flex",
    flexDirection: "column",
    willChange: "transform",
  };

  const translateHidden =
    side === "left" ? "translateX(-100%)" : "translateX(100%)";

  const drawerStyle: React.CSSProperties = {
    ...baseDrawerStyle,
    ...(side === "left" ? { left: 0 } : { right: 0 }),
    transform: visible ? "translateX(0)" : translateHidden,
  };

  return (
    <>
      {/* overlay */}
      <div style={overlayStyle} onClick={onClose} aria-hidden="true" />

      {/* drawer */}
      <div
        style={drawerStyle}
        role="dialog"
        aria-modal="true"
        // overlay 클릭은 닫히고, drawer 내부 클릭은 닫히면 안되니까 전파 차단
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </>
  );
}
