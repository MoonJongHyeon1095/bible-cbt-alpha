// src/components/left/EmotionThoughtSummaryCard.tsx
type Props = {
  emotionLabel: string;
  thoughtText: string;
};

export function EmotionThoughtSummaryCard({
  emotionLabel,
  thoughtText,
}: Props) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-100 p-4 shadow-sm mb-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
            현재 감정
          </p>
          <p className="text-emerald-900 font-semibold text-lg">
            {emotionLabel}
          </p>
        </div>
      </div>
      <div className="mt-3 rounded-xl border border-emerald-200 bg-white p-3">
        <p className="text-xs font-semibold text-emerald-800 mb-1">
          자동사고 문장
        </p>
        <p className="text-slate-700 italic">“{thoughtText}”</p>
      </div>
    </div>
  );
}
