import { AlertTriangle, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import {
  EMOTION_BENEFITS,
  EMOTION_WARNINGS,
} from "../../../../../constants/emotions";

interface PatternDetailLoadingCardProps {
  emotion: string;
}

export function PatternDetailLoadingCard({
  emotion,
}: PatternDetailLoadingCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const benefits = (EMOTION_BENEFITS[emotion] ?? []).slice(0, 3);
  const warnings = (EMOTION_WARNINGS[emotion] ?? []).slice(0, 3);

  const hasLists = benefits.length > 0 || warnings.length > 0;
  const revealClass =
    "transition-all duration-500 ease-out motion-reduce:transition-none";
  const itemStateClass = mounted
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-2";

  return (
    <div
      className={[
        "rounded-xl border border-amber-200/80 bg-white/90 p-4 shadow-sm",
        "will-change-transform will-change-opacity transform-gpu",
        "transition-all duration-700 ease-out motion-reduce:transition-none",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
      ].join(" ")}
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <Loader2 className="size-4 animate-spin text-amber-500" />
        <span>AI가 자동사고 후보를 생성하는 중이에요.</span>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        선택한 감정의 특성을 함께 살펴볼게요.
      </p>

      {hasLists && (
        <div className="mt-4 space-y-3">
          <div
            className={[
              "rounded-lg border border-emerald-200/70 bg-emerald-50/70 p-3",
              revealClass,
              itemStateClass,
            ].join(" ")}
            style={{ transitionDelay: "140ms" }}
          >
            <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs mb-2">
              <Sparkles className="size-4 text-emerald-600" />
              <span>이 감정의 힘</span>
            </div>
            {benefits.length > 0 ? (
              <ul className="space-y-1 text-xs text-slate-700">
                {benefits.map((text, index) => (
                  <li
                    key={`${text}-${index}`}
                    className={[
                      "flex gap-2",
                      revealClass,
                      itemStateClass,
                    ].join(" ")}
                    style={{ transitionDelay: `${200 + index * 80}ms` }}
                  >
                    <span className="text-slate-400">•</span>
                    <span className="flex-1">{text}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-slate-500">
                (해당 감정의 장점 데이터가 없어요)
              </div>
            )}
          </div>

          <div
            className={[
              "rounded-lg border border-amber-200/70 bg-amber-50/70 p-3",
              revealClass,
              itemStateClass,
            ].join(" ")}
            style={{ transitionDelay: "220ms" }}
          >
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs mb-2">
              <AlertTriangle className="size-4 text-amber-600" />
              <span>주의할 점</span>
            </div>
            {warnings.length > 0 ? (
              <ul className="space-y-1 text-xs text-slate-700">
                {warnings.map((text, index) => (
                  <li
                    key={`${text}-${index}`}
                    className={[
                      "flex gap-2",
                      revealClass,
                      itemStateClass,
                    ].join(" ")}
                    style={{ transitionDelay: `${280 + index * 80}ms` }}
                  >
                    <span className="text-slate-400">•</span>
                    <span className="flex-1">{text}</span>
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
