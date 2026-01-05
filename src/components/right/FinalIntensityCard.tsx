import type { EmotionThoughtPair } from "../../types";
import { Slider } from "../ui/slider";

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
    <div className="bg-white p-4 rounded border border-purple-300 mb-4">
      <p className="text-purple-800 mb-3">
        <strong>감정이 좋아졌다면 얼마나 좋아졌는지 기록해주세요:</strong>
      </p>

      <div className="space-y-4">
        {emotionThoughtPairs.map((pair, i) => {
          const baseIntensity = pair.intensity ?? 50;
          const currentValue = finalIntensities[pair.emotion] ?? baseIntensity;

          return (
            <div key={i} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-700">{pair.emotion}</span>
                <div className="flex gap-4 text-sm">
                  <span className="text-slate-500">이전: {baseIntensity}</span>
                  <span className="text-purple-600">현재: {currentValue}</span>
                </div>
              </div>

              <Slider
                value={[currentValue]}
                onValueChange={(val: number[]) => onChange(pair.emotion, val[0])}
                min={0}
                max={100}
                step={5}
              />

              <div className="flex justify-between text-slate-400">
                <span>0</span>
                <span>100</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
