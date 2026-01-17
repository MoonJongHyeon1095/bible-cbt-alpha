import { Gauge } from "lucide-react";
import type { EmotionThoughtPair } from "../../../types";
import { Slider } from "../../ui/slider";

interface FinalIntensityCardProps {
  emotionThoughtPairs: EmotionThoughtPair[];
  finalIntensities: Record<string, number>;
  onChange: (emotion: string, value: number) => void;
}

export function FinalIntensityCard({
  emotionThoughtPairs,
  finalIntensities,
  onChange,
}: FinalIntensityCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-sky-50/60 to-violet-50/50 p-5 shadow-lg shadow-slate-200/60 mb-4">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.14),transparent_60%)]" />
      <div className="relative mb-5 flex items-start gap-3">
        <div className="rounded-xl bg-white/80 p-2 shadow-sm shadow-slate-200/80 text-blue-700">
          <Gauge className="size-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-slate-900 text-lg font-semibold">
            감정 변화 체크
          </p>
          <p className="text-slate-600 text-sm">
            감정이 좋아졌다면 얼마나 좋아졌는지 기록해주세요.
          </p>
        </div>
      </div>

      <div className="relative space-y-4">
        {emotionThoughtPairs.map((pair, i) => {
          const baseIntensity = pair.intensity ?? 50;
          const currentValue = finalIntensities[pair.emotion] ?? baseIntensity;
          const delta = currentValue - baseIntensity;
          const deltaLabel =
            delta === 0
              ? "변화 없음"
              : delta < 0
              ? `완화 ${Math.abs(delta)}`
              : `증가 ${delta}`;
          const deltaStyle =
            delta === 0
              ? "bg-slate-100 text-slate-500"
              : delta < 0
              ? "bg-emerald-100/80 text-emerald-700"
              : "bg-rose-100/80 text-rose-700";

          return (
            <div
              key={i}
              className="rounded-xl border border-white/70 bg-white/70 px-4 py-3 shadow-sm shadow-slate-200/60"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-slate-800 font-semibold">
                    {pair.emotion}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${deltaStyle}`}
                  >
                    {deltaLabel}
                  </span>
                </div>
                <div className="flex gap-3 text-sm">
                  <span className="text-slate-500">이전 {baseIntensity}</span>
                  <span className="text-indigo-600 font-semibold">
                    현재 {currentValue}
                  </span>
                </div>
              </div>

              <Slider
                value={[currentValue]}
                onValueChange={(val: number[]) =>
                  onChange(pair.emotion, val[0])
                }
                min={0}
                max={100}
                step={5}
                className="[&_[data-slot=slider-track]]:h-3 [&_[data-slot=slider-track]]:bg-slate-200/80 [&_[data-slot=slider-range]]:bg-gradient-to-r [&_[data-slot=slider-range]]:from-emerald-400 [&_[data-slot=slider-range]]:via-sky-400 [&_[data-slot=slider-range]]:to-violet-500 [&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-thumb]]:border-white [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:shadow-md [&_[data-slot=slider-thumb]]:shadow-slate-300/60 [&_[data-slot=slider-thumb]]:hover:ring-4 [&_[data-slot=slider-thumb]]:ring-sky-200/70"
              />

              <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                <span>0 · 약함</span>
                <span>100 · 강함</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
