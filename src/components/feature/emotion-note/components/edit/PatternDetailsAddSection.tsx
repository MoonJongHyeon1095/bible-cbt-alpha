import { Brain, Save } from "lucide-react";
import { Button } from "../../../../ui/button";
import { Textarea } from "../../../../ui/textarea";
import { EmotionSelector } from "./PatternSelectors";

interface PatternDetailsAddSectionProps {
  automaticThought: string;
  emotion: string;
  loading: boolean;
  onChangeAutomaticThought: (value: string) => void;
  onSelectEmotion: (value: string) => void;
  onAddDetail: () => void;
}

export function PatternDetailsAddSection({
  automaticThought,
  emotion,
  loading,
  onChangeAutomaticThought,
  onSelectEmotion,
  onAddDetail,
}: PatternDetailsAddSectionProps) {
  return (
    <div className="border border-amber-200 rounded-xl bg-white shadow-sm">
      <div className="border-b border-amber-200 px-4 py-3 text-sm font-semibold text-amber-900 flex items-center gap-2">
        <Brain className="size-4" />
        배후의 자동 사고 추가
      </div>
      <div className="p-5 space-y-4 bg-amber-50/70">
        <div className="flex items-center justify-between gap-2 text-sm text-slate-700">
          <div className="flex items-center gap-2">💭 자동사고 추가</div>
          <Button
            size="sm"
            onClick={onAddDetail}
            disabled={!emotion.trim() || !automaticThought.trim() || loading}
            className="bg-yellow-500 text-white hover:bg-yellow-600"
          >
            <Save className="size-4 mr-1" />
            저장
          </Button>
        </div>
        <div>
          <p className="text-xs text-slate-600 mb-2">감정 선택</p>
          <EmotionSelector value={emotion} onSelect={onSelectEmotion} />
        </div>
        <Textarea
          value={automaticThought}
          onChange={(e) => onChangeAutomaticThought(e.target.value)}
          placeholder="자동적으로 떠오르는 생각을 적어주세요."
          className="min-h-[120px] border-indigo-200 bg-white/90 px-3 py-2 text-[16px] leading-[1.85]"
        />
      </div>
    </div>
  );
}
