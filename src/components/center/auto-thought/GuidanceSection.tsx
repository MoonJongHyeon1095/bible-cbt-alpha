export function GuidanceSection({
  selectedEmotion,
}: {
  selectedEmotion: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-transparent p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-700">
        현재의 감정: <span className="text-blue-700">{selectedEmotion}</span>
      </p>
      <p className="mt-2 text-base font-semibold text-slate-800">
        아래 제안 중 가장 가까운 생각을 하나 골라주세요.
      </p>
    </div>
  );
}
