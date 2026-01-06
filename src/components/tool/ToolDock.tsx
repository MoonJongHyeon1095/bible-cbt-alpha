// src/components/tool/ToolDock.tsx
import { MoreHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "../ui/button";
import { ToolEmailButton } from "./ToolEmailButton";
import { ToolHistoryButton } from "./ToolHistoryButton";
import { ToolResetButton } from "./ToolResetButton";

type ToolDockProps = {
  onReset: () => void;
  onOpenHistory: () => void;
  onOpenEmail: () => void;
};

const HOST_ID = "tooldock-portal-host";

function ensureHost(): HTMLDivElement {
  let host = document.getElementById(HOST_ID) as HTMLDivElement | null;
  if (host) return host;

  host = document.createElement("div");
  host.id = HOST_ID;

  // 화면을 덮지 않게 0x0로 두고, 실제 dock은 fixed로 렌더
  host.style.position = "fixed";
  host.style.right = "0";
  host.style.bottom = "0";
  host.style.width = "0";
  host.style.height = "0";
  host.style.zIndex = "2147483647";
  host.style.pointerEvents = "auto";

  document.body.appendChild(host);
  return host;
}

export function ToolDock({
  onReset,
  onOpenHistory,
  onOpenEmail,
}: ToolDockProps) {
  const [open, setOpen] = useState(false);
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const dockRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setHost(ensureHost());
  }, []);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!open) return;
      const t = e.target as Node | null;
      if (!t) return;

      const inside = dockRef.current?.contains(t);
      if (inside) return;

      setOpen(false);
    }

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // ESC 닫기
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const items = useMemo(
    () => [
      <ToolResetButton key="reset" onReset={onReset} />,
      <ToolHistoryButton key="history" onOpenHistory={onOpenHistory} />,
      <ToolEmailButton key="email" onOpenEmail={onOpenEmail} />,
    ],
    [onReset, onOpenHistory, onOpenEmail]
  );

  if (!host) return null;

  const dock = (
    <div
      ref={dockRef}
      style={{
        position: "fixed",
        right: "24px",
        bottom: "24px",
        zIndex: 2147483647,
      }}
      className="flex flex-col items-end"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* open일 때만 렌더 */}
      {open && (
        <div className="mb-2 flex flex-col items-end gap-2">
          {items.map((node, idx) => (
            <div key={(node as any).key ?? idx}>{node}</div>
          ))}
        </div>
      )}

      {/* 토글 버튼 (크기 완전 고정) */}
      <Button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => setOpen((v) => !v)}
        title="도구"
        aria-label="도구 열기/닫기"
        aria-expanded={open}
        className={[
          // ✅ 크기 고정: 펼쳐져도/아이콘 바뀌어도 절대 안 흔들림
          "w-16 h-12 rounded-full",

          "bg-slate-900 text-white shadow-xl",
          "flex items-center justify-center",

          // ✅ hover는 유지, ❌ scale/transform 제거
          "hover:bg-slate-800",

          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40",
        ].join(" ")}
      >
        {open ? (
          <X className="size-5" />
        ) : (
          <MoreHorizontal className="size-5" />
        )}
      </Button>
    </div>
  );

  return createPortal(dock, host);
}
