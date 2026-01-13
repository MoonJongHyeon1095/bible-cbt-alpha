import { Lightbulb, Save } from "lucide-react";
import { Button } from "../../../../ui/button";
import { Textarea } from "../../../../ui/textarea";

interface PatternAlternativesAddSectionProps {
  alternativeText: string;
  loading: boolean;
  onChangeAlternativeText: (value: string) => void;
  onAddAlternative: () => void;
}

export function PatternAlternativesAddSection({
  alternativeText,
  loading,
  onChangeAlternativeText,
  onAddAlternative,
}: PatternAlternativesAddSectionProps) {
  return (
    <div className="border border-green-200 rounded-xl bg-white shadow-sm">
      <div className="border-b border-green-200 px-4 py-3 text-sm font-semibold text-slate-800 flex items-center gap-2">
        <Lightbulb className="size-4" />
        대안적 접근 추가
      </div>
      <div className="p-5 space-y-4 bg-green-50/70">
        <div className="flex items-center justify-between gap-2 text-sm text-slate-700">
          <div className="flex items-center gap-2">💡 대안사고 추가</div>
          <Button
            size="sm"
            onClick={onAddAlternative}
            disabled={!alternativeText.trim() || loading}
            className="bg-green-500 text-white hover:bg-green-600"
          >
            <Save className="size-4 mr-1" />
            저장
          </Button>
        </div>
        <Textarea
          value={alternativeText}
          onChange={(e) => onChangeAlternativeText(e.target.value)}
          placeholder="대안적 사고를 적어주세요."
          className="min-h-[120px] border-green-200 bg-white/90 px-3 py-2 text-[16px] leading-[1.85]"
        />
      </div>
    </div>
  );
}
