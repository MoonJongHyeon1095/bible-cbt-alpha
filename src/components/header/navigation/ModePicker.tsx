// src/components/header/ModePicker.tsx
import { SlidersHorizontal } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { Button } from "../../ui/button";
import { ToggleRow } from "../../ui/mode-switch";

export type CbtMode = {
  detailMode: "lite" | "deep";
  toneMode: "normal" | "christian";
};

type PopoverPos = { top: number; left: number };

type ModePickerProps = {
  // ✅ controlled
  value: CbtMode;
  onChange: (mode: CbtMode) => void;

  // (선택) 초기화 버튼용 기본값
  defaultMode?: CbtMode;
};

export function ModePicker({
  value,
  onChange,
  defaultMode = { detailMode: "lite", toneMode: "christian" },
}: ModePickerProps) {
  const [show, setShow] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLElement | null>(null);

  const POP_W = 320;
  const GAP = 8;
  const MARGIN = 12;

  const [pos, setPos] = useState<PopoverPos>({ top: 0, left: 0 });

  const calcPosFromEl = (el: HTMLElement): PopoverPos => {
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;

    let left = r.right - POP_W;
    left = Math.max(MARGIN, Math.min(left, vw - POP_W - MARGIN));

    const top = r.bottom + GAP;
    return { top, left };
  };

  // ✅ 바깥 클릭 시 닫기
  useEffect(() => {
    const onDown = (e: globalThis.MouseEvent) => {
      if (!show) return;
      const root = rootRef.current;
      if (!root) return;
      if (e.target instanceof Node && !root.contains(e.target)) {
        setShow(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [show]);

  // ✅ 열려 있을 때 스크롤/리사이즈 시 anchor 기준 재계산
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
  }, [show]);

  const deepEnabled = value.detailMode === "deep";
  const christianEnabled = value.toneMode === "christian";

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
        aria-label="세션 모드 설정"
        title={`세션 모드 설정 (${subtitle})`}
        onClick={(e: ReactMouseEvent<HTMLButtonElement>) => {
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
        {/* ✅ 아이콘 변경 */}
        <SlidersHorizontal className="size-5" />
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
              세션 모드 설정
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
              description="더 많은 단계와 깊이 있는 성찰을 제공합니다."
              checked={deepEnabled}
              onChange={(next) =>
                onChange({
                  ...value,
                  detailMode: next ? "deep" : "lite",
                })
              }
            />
          </div>

          <div className="mt-3 rounded-lg border border-slate-100 px-3">
            <ToggleRow
              label="기독교 모드 활성화"
              description="성경 말씀과 기독교적 관점을 포함합니다."
              checked={christianEnabled}
              onChange={(next) =>
                onChange({
                  ...value,
                  toneMode: next ? "christian" : "normal",
                })
              }
            />
          </div>

          <div className="mt-3 flex items-center justify-end text-xs text-slate-500">
            <button
              type="button"
              className="hover:text-slate-700"
              onClick={() => onChange(defaultMode)}
              title="기본값으로 초기화"
            >
              기본 설정으로 초기화
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
