// src/components/center/LoadingInsightCard.tsx
import { AlertTriangle, Sparkles } from "lucide-react";
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
  const revealClass =
    "transition-all duration-500 ease-out motion-reduce:transition-none";
  const itemStateClass = mounted
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-2";

  return (
    <div
      className={[
        "mt-8 rounded-2xl border border-slate-200/70 bg-transparent p-5 shadow-sm",
        "ring-1 ring-white/60",
        // ✅ 샤르륵 (순수 Tailwind)
        "will-change-transform will-change-opacity transform-gpu",
        "transition-all duration-700 ease-out",
        "motion-reduce:transition-none",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
      ].join(" ")}
    >
      <p className="text-slate-900 text-base font-semibold tracking-tight">
        당신이{" "}
        <span className="font-extrabold text-indigo-600">"{emotion}"</span>을
        느낀다면, 혹시 이런 측면이 강한 사람이 아닐까요?
      </p>

      {hasLists && (
        <div className="mt-4 space-y-3">
          {/* ✅ 긍정 (위) */}
          <div
            className={[
              "rounded-xl border border-green-200/70 bg-white/80 p-3 shadow-sm",
              revealClass,
              itemStateClass,
            ].join(" ")}
            style={{ transitionDelay: "140ms" }}
          >
            <div className="flex items-center gap-2 text-green-900 font-semibold text-sm mb-2">
              <Sparkles className="size-4 text-green-600" />
              <span>이런 면이 강할 수 있어요</span>
            </div>

            {positives.length > 0 ? (
              <ul className="space-y-1 text-sm text-slate-700">
                {positives.map((t, i) => (
                  <li
                    key={i}
                    className={[
                      "flex gap-2",
                      revealClass,
                      itemStateClass,
                    ].join(" ")}
                    style={{ transitionDelay: `${200 + i * 80}ms` }}
                  >
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
          <div
            className={[
              "rounded-xl border border-amber-200/70 bg-white/80 p-3 shadow-sm",
              revealClass,
              itemStateClass,
            ].join(" ")}
            style={{ transitionDelay: "220ms" }}
          >
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm mb-2">
              <AlertTriangle className="size-4 text-amber-600" />
              <span>부하가 걸릴 때는 이런 점을 조심해요</span>
            </div>

            {cautions.length > 0 ? (
              <ul className="space-y-1 text-sm text-slate-700">
                {cautions.map((t, i) => (
                  <li
                    key={i}
                    className={[
                      "flex gap-2",
                      revealClass,
                      itemStateClass,
                    ].join(" ")}
                    style={{ transitionDelay: `${280 + i * 80}ms` }}
                  >
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
