import { AlertCircle, Save, X } from "lucide-react";
import { Button } from "../../../ui/button";
import { DialogClose } from "../../../ui/dialog";
import { Input } from "../../../ui/input";
import { Textarea } from "../../../ui/textarea";

interface CreatePatternCardProps {
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
  title,
  trigger,
  loading,
  titleRef,
  onChangeTitle,
  onChangeTrigger,
  onSave,
  onCancel,
}: CreatePatternCardProps) {
  return (
    <div className="border border-indigo-200 rounded-xl bg-white shadow-sm">
      <div className="border-b border-indigo-200 px-4 py-3 text-sm font-semibold text-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="size-4" />
          감정노트 추가
        </div>
        <DialogClose asChild>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-indigo-200 bg-white p-2 text-indigo-700 transition hover:bg-indigo-50"
            aria-label="닫기"
          >
            <X className="size-4" />
          </button>
        </DialogClose>
      </div>
      <div className="p-5 space-y-4 bg-indigo-50/70">
        <div className="flex items-center justify-end">
          <Button
            onClick={onSave}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Save className="size-4 mr-2" />
            저장
          </Button>
        </div>
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
    </div>
  );
}
