import { AlertCircle, Save, X } from "lucide-react";
import { Button } from "../../../../ui/button";
import { Input } from "../../../../ui/input";
import { Textarea } from "../../../../ui/textarea";

interface PatternTriggerSectionProps {
  title: string;
  trigger: string;
  loading: boolean;
  onChangeTitle: (value: string) => void;
  onChangeTrigger: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function PatternTriggerSection({
  title,
  trigger,
  loading,
  onChangeTitle,
  onChangeTrigger,
  onSave,
  onCancel,
}: PatternTriggerSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Button
          onClick={onSave}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Save className="size-4 mr-2" />
          저장
        </Button>
        <Button onClick={onCancel} variant="outline">
          <X className="size-4 mr-2" />
          닫기
        </Button>
      </div>

      <div>
        <label className="text-sm text-slate-700 mb-2 block flex items-center gap-2">
          <AlertCircle className="size-4" />
          감정패턴 제목
        </label>
        <Input
          value={title}
          onChange={(e) => onChangeTitle(e.target.value)}
          placeholder="예: 사람들 앞에서 발표할 때"
          className="border-indigo-200"
        />
      </div>

      <div>
        <label className="text-sm text-slate-700 mb-2 flex items-center gap-2">
          <AlertCircle className="size-4" />
          트리거 (촉발 상황)
        </label>
        <Textarea
          value={trigger}
          onChange={(e) => onChangeTrigger(e.target.value)}
          placeholder="어떤 상황에서 이 패턴이 나타나나요?"
          className="min-h-[120px] border-indigo-200"
        />
      </div>
    </div>
  );
}
