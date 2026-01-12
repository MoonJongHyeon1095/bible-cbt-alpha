export function GuidanceSection({
  selectedEmotion,
}: {
  selectedEmotion: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white via-blue-50/70 to-indigo-50/40 p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-700">
        현재의 감정: <span className="text-blue-700">{selectedEmotion}</span>
      </p>
      <p className="mt-2 text-base font-semibold text-slate-800">
        아래 제안 중 가장 가까운 생각을 하나 골라주세요.
      </p>
      <p className="mt-1 text-sm text-slate-500">
        딱 맞는 게 없으면 <strong>다시 만들기</strong> 또는{" "}
        <strong>직접 입력</strong>으로 넘어갈 수 있어요.
      </p>
    </div>
  );
}
