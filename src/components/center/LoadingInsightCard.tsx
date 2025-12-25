// src/components/center/LoadingInsightCard.tsx
import { useEffect, useState } from "react";

type EmotionData = {
  label: string;
  positive?: string[];
  caution?: string[];
  physical?: string;
  description?: string;
};

type Props = {
  emotion: string;
  emotionData?: EmotionData | null;
};

export function LoadingInsightCard({ emotion, emotionData }: Props) {
  const positives = (emotionData?.positive ?? []).slice(0, 3);
  const cautions = (emotionData?.caution ?? []).slice(0, 3);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const hasLists = positives.length > 0 || cautions.length > 0;

  return (
    <div
      className={[
        "mt-6 rounded-xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-4",
        // ✅ 샤르륵 (순수 Tailwind)
        "will-change-transform will-change-opacity transform-gpu",
        "transition-all duration-700 ease-out",
        "motion-reduce:transition-none",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
      ].join(" ")}
    >
      <p className="text-indigo-900 text-base font-semibold">
        당신이{" "}
        <span className="font-extrabold text-indigo-700">"{emotion}"</span>을
        느낀다면, 혹시 이런 측면이 강한 사람이 아닐까요?
      </p>

      {hasLists && (
        <div className="mt-4 space-y-3">
          {/* ✅ 긍정 (위) */}
          <div className="rounded-lg border border-green-200 bg-white/70 p-3">
            <div className="text-green-900 font-semibold text-sm mb-2">
              ✨ 이런 면이 강할 수 있어요
            </div>

            {positives.length > 0 ? (
              <ul className="space-y-1 text-sm text-slate-700">
                {positives.map((t, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-slate-400">•</span>
                    <span className="flex-1">{t}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-slate-500">
                (해당 감정의 긍정 측면 데이터가 없어요)
              </div>
            )}
          </div>

          {/* ✅ 주의 (아래) */}
          <div className="rounded-lg border border-amber-200 bg-white/70 p-3">
            <div className="text-amber-900 font-semibold text-sm mb-2">
              ⚠️ 부하가 걸릴 때는 이런 점을 조심해요
            </div>

            {cautions.length > 0 ? (
              <ul className="space-y-1 text-sm text-slate-700">
                {cautions.map((t, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-slate-400">•</span>
                    <span className="flex-1">{t}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-slate-500">
                (해당 감정의 주의점 데이터가 없어요)
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
