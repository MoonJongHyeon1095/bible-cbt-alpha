// src/components/header/ModePicker.tsx
import { Filter } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../ui/button";
import { ToggleRow } from "../ui/mode-switch";

export type CbtMode = {
  detailMode: "lite" | "deep";
  toneMode: "normal" | "christian";
};

const CBT_MODE_STORAGE_KEY = "cbt-mode";

type ModePickerProps = {
  storageKey?: string; // 기본: "cbt-mode"
  defaultMode?: CbtMode; // 기본: { lite, normal } (✅ 변경)
  onChange?: (mode: CbtMode) => void;
};

type PopoverPos = { top: number; left: number };

export function ModePicker({
  storageKey = CBT_MODE_STORAGE_KEY,
  defaultMode = { detailMode: "lite", toneMode: "normal" }, // ✅ 기본값: 비활성화(lite/일반)
  onChange,
}: ModePickerProps) {
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState<CbtMode>(defaultMode);

  const rootRef = useRef<HTMLDivElement>(null);

  const POP_W = 320;
  const GAP = 8;
  const MARGIN = 12;

  const [pos, setPos] = useState<PopoverPos>({ top: 0, left: 0 });

  const anchorRef = useRef<HTMLElement | null>(null);

  const calcPosFromEl = (el: HTMLElement): PopoverPos => {
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;

    let left = r.right - POP_W;
    left = Math.max(MARGIN, Math.min(left, vw - POP_W - MARGIN));

    const top = r.bottom + GAP;
    return { top, left };
  };

  // ✅ 새로고침/재진입 시 선택값 복원
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<CbtMode>;
      setMode((prev) => ({
        detailMode:
          parsed.detailMode === "deep" || parsed.detailMode === "lite"
            ? parsed.detailMode
            : prev.detailMode,
        toneMode:
          parsed.toneMode === "christian" || parsed.toneMode === "normal"
            ? parsed.toneMode
            : prev.toneMode,
      }));
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ 변경 즉시 저장 + 상위 콜백
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(mode));
    } catch {
      // ignore
    }
    onChange?.(mode);
  }, [mode, storageKey, onChange]);

  // ✅ 바깥 클릭 시 닫기
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!show) return;
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setShow(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [show]);

  // ✅ 열려 있을 때 스크롤/리사이즈 시 anchor 기준으로 다시 붙이기
  useEffect(() => {
    if (!show) return;

    const onAny = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      setPos(calcPosFromEl(anchor));
    };

    window.addEventListener("resize", onAny);
    window.addEventListener("scroll", onAny, true);

    return () => {
      window.removeEventListener("resize", onAny);
      window.removeEventListener("scroll", onAny, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  // ✅ “활성화” 토글 상태(derived)
  const deepEnabled = mode.detailMode === "deep";
  const christianEnabled = mode.toneMode === "christian";

  const subtitle = useMemo(() => {
    const detail = deepEnabled ? "심화" : "Lite";
    const tone = christianEnabled ? "기독교" : "일반";
    return `${detail} · ${tone}`;
  }, [deepEnabled, christianEnabled]);

  return (
    <div className="relative" ref={rootRef}>
      <Button
        variant="outline"
        size="icon"
        aria-label="모드 설정"
        title={`모드 설정 (${subtitle})`}
        onClick={(e) => {
          const el = e.currentTarget as unknown as HTMLElement;
          const next = !show;

          if (next) {
            anchorRef.current = el;
            setPos(calcPosFromEl(el));
            setShow(true);
          } else {
            setShow(false);
          }
        }}
      >
        <Filter className="size-5" />
      </Button>

      {show && (
        <div
          className="fixed rounded-xl border border-slate-200 bg-white shadow-lg p-3 z-[9999]"
          style={{
            width: POP_W,
            maxWidth: "calc(100vw - 24px)",
            top: pos.top,
            left: pos.left,
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="text-sm font-semibold text-slate-800">
              모드 설정
            </div>
            <button
              type="button"
              onClick={() => setShow(false)}
              className="text-slate-400 hover:text-slate-700 px-2 py-1"
              aria-label="닫기"
              title="닫기"
            >
              ×
            </button>
          </div>

          <div className="mt-2 rounded-lg border border-slate-100 px-3">
            <ToggleRow
              label="심화 모드 활성화"
              description="더 깊이 있는 단계들을 제공합니다."
              checked={deepEnabled}
              onChange={(next) =>
                setMode((prev) => ({
                  ...prev,
                  detailMode: next ? "deep" : "lite",
                }))
              }
            />
          </div>

          <div className="mt-3 rounded-lg border border-slate-100 px-3">
            <ToggleRow
              label="기독교 모드 활성화"
              description="기독교 콘텐츠를 포함합니다."
              checked={christianEnabled}
              onChange={(next) =>
                setMode((prev) => ({
                  ...prev,
                  toneMode: next ? "christian" : "normal",
                }))
              }
            />
          </div>

          <div className="mt-3 flex items-center justify-end text-xs text-slate-500">
            <button
              type="button"
              className="hover:text-slate-700"
              onClick={() => setMode(defaultMode)}
              title="기본값으로 초기화"
            >
              초기화
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
