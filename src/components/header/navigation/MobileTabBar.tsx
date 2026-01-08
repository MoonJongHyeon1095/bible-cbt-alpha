import { Home } from "lucide-react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { NavSharedProps } from "./types";

type MobileTabBarProps = Pick<
  NavSharedProps,
  "currentPage" | "navItems" | "onNavigate" | "onHomeRefresh"
>;

export function MobileTabBar({
  currentPage,
  navItems,
  onNavigate,
  onHomeRefresh,
}: MobileTabBarProps) {
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const updateHeight = () => {
      if (!barRef.current) return;
      const height = barRef.current.getBoundingClientRect().height;
      document.documentElement.style.setProperty(
        "--mobile-tabbar-height",
        `${height}px`,
      );
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => {
      window.removeEventListener("resize", updateHeight);
      document.documentElement.style.removeProperty("--mobile-tabbar-height");
    };
  }, []);

  const content = (
    <div
      ref={barRef}
      className="z-50 border-t border-slate-200 bg-white shadow-[0_-6px_16px_rgba(15,23,42,0.08)]"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <div
        className="max-w-[1800px] mx-auto px-2 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-2"
        style={{ WebkitTextSizeAdjust: "100%" }}
      >
        <div className="flex items-stretch gap-1 overflow-x-auto">
          <button
            onClick={onHomeRefresh}
            className="min-w-[64px] flex-1 rounded-xl text-slate-600 hover:bg-purple-50 px-2 py-2"
            aria-label="홈"
          >
            <div className="flex flex-col items-center gap-1">
              <Home className="size-5" />
              <span
                className="font-semibold leading-none"
                style={{ fontSize: "8px", lineHeight: 1 }}
              >
                홈
              </span>
            </div>
          </button>

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={
                  active
                    ? "min-w-[64px] flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-2"
                    : "min-w-[64px] flex-1 rounded-xl text-slate-600 hover:bg-purple-50 px-2 py-2"
                }
              >
                <div className="flex flex-col items-center gap-1">
                  <Icon className="size-5" />
                  <span
                    className="font-semibold text-center whitespace-nowrap max-w-[64px] truncate"
                    style={{ fontSize: "8px", lineHeight: 1 }}
                  >
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}
