import { Textarea } from "../../ui/textarea";

export function CustomThoughtSection({
  customThought,
  customThoughtTrimmed,
  onCustomThoughtChange,
}: {
  customThought: string;
  customThoughtTrimmed: string;
  onCustomThoughtChange: (value: string) => void;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/60 p-5 shadow-sm">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <p className="text-base font-semibold text-slate-700">
            ✍️ 또는 당신의 생각을 직접 적어보세요
          </p>
        </div>
        <p className="text-sm text-slate-500">
          솔직한 문장이 가장 좋은 출발점입니다.
        </p>
      </div>

      <div className="relative">
        <Textarea
          value={customThought}
          onChange={(e) => onCustomThoughtChange(e.target.value)}
          placeholder="예: 나는 이렇게 하면 안 된다고 생각해..."
          className="min-h-[72px] resize-none rounded-2xl border border-slate-200 bg-white/90 p-3 text-[15px] leading-relaxed shadow-sm transition focus-visible:border-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-200"
        />
      </div>

    </div>
  );
}
