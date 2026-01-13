import { AlertCircle, Save, X } from "lucide-react";
import { Button } from "../../../ui/button";
import { Card } from "../../../ui/card";
import { Input } from "../../../ui/input";
import { Textarea } from "../../../ui/textarea";

interface CreatePatternCardProps {
  isCreating: boolean;
  title: string;
  trigger: string;
  loading: boolean;
  titleRef: React.RefObject<HTMLInputElement | null>;
  onChangeTitle: (value: string) => void;
  onChangeTrigger: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function CreatePatternCard({
  isCreating,
  title,
  trigger,
  loading,
  titleRef,
  onChangeTitle,
  onChangeTrigger,
  onSave,
  onCancel,
}: CreatePatternCardProps) {
  if (!isCreating) return null;

  return (
    <Card className="p-6 mb-6 bg-indigo-50 border-2 border-indigo-200">
      <div className="flex items-start justify-between mb-4 gap-4">
        <h3 className="text-lg text-slate-900">
          추가
        </h3>
        <div className="flex gap-2">
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
            취소
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-slate-700 mb-2 block flex items-center gap-2">
            <AlertCircle className="size-4" />
            감정패턴 제목
          </label>
          <Input
            ref={titleRef}
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
            className="min-h-[96px] border-indigo-200"
          />
        </div>
      </div>
    </Card>
  );
}
