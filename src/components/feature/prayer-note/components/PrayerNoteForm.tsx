import { Save, X } from "lucide-react";
import type { RefObject } from "react";
import { Button } from "../../../ui/button";
import { Card } from "../../../ui/card";
import { Input } from "../../../ui/input";
import { Textarea } from "../../../ui/textarea";

type PrayerNoteFormProps = {
  isEditing: boolean;
  title: string;
  content: string;
  tags: string[];
  emotionTags: string[];
  loading: boolean;
  titleRef: RefObject<HTMLInputElement | null>;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onToggleTag: (tag: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function PrayerNoteForm({
  isEditing,
  title,
  content,
  tags,
  emotionTags,
  loading,
  titleRef,
  onTitleChange,
  onContentChange,
  onToggleTag,
  onSave,
  onCancel,
}: PrayerNoteFormProps) {
  return (
    <Card className="p-6 mb-6 bg-purple-50 border-2 border-purple-200">
      <h3 className="text-lg text-slate-900 mb-4">
        {isEditing ? "기도 노트 수정" : "새 기도 노트 작성"}
      </h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-slate-700 mb-2 block">제목</label>
          <Input
            ref={titleRef}
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="기도 제목을 입력하세요"
            className="border-purple-200"
          />
        </div>

        <div>
          <label className="text-sm text-slate-700 mb-2 block">내용</label>
          <Textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="기도 내용, 감사한 일, 응답 등을 자유롭게 적어보세요..."
            className="min-h-[200px] border-purple-200"
          />
        </div>

        <div>
          <label className="text-sm text-slate-700 mb-2 block">
            태그 (감정 선택)
          </label>
          <div className="flex flex-wrap gap-2">
            {emotionTags.map((tag) => {
              const selected = tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onToggleTag(tag)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    selected
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white text-slate-700 border-slate-200 hover:border-purple-300"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onSave}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Save className="size-4 mr-2" />
            {isEditing ? "수정 완료" : "저장"}
          </Button>
          <Button onClick={onCancel} variant="outline">
            <X className="size-4 mr-2" />
            취소
          </Button>
        </div>
      </div>
    </Card>
  );
}
