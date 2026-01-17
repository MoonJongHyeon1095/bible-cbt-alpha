import {
  ChevronDown,
  ChevronRight,
  Edit2,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "../../../ui/button";
import { Textarea } from "../../../ui/textarea";
import type { PrayerNoteResponse } from "../types/types";

type PrayerNoteResponseItemProps = {
  response: PrayerNoteResponse;
  isEditing: boolean;
  isExpanded: boolean;
  editingContent: string;
  onToggleExpand: () => void;
  onStartEdit: () => void;
  onDelete: () => void;
  onChangeEditingContent: (value: string) => void;
  onUpdate: () => void;
  onCancelEdit: () => void;
  formatResponseTitle: (content: string) => string;
  formatDate: (timestamp: string) => string;
};

export function PrayerNoteResponseItem({
  response,
  isEditing,
  isExpanded,
  editingContent,
  onToggleExpand,
  onStartEdit,
  onDelete,
  onChangeEditingContent,
  onUpdate,
  onCancelEdit,
  formatResponseTitle,
  formatDate,
}: PrayerNoteResponseItemProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editingContent}
            onChange={(e) => onChangeEditingContent(e.target.value)}
            className="min-h-[120px] border-slate-200"
          />
          <div className="flex gap-2">
            <Button
              onClick={onUpdate}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Save className="size-4 mr-2" />
              수정 완료
            </Button>
            <Button variant="outline" onClick={onCancelEdit}>
              <X className="size-4 mr-2" />
              취소
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-start justify-between gap-3">
            <button
              type="button"
              onClick={onToggleExpand}
              className="flex min-w-0 flex-1 items-center gap-2 text-left"
              title={isExpanded ? "응답 접기" : "응답 펼치기"}
            >
              {isExpanded ? (
                <ChevronDown className="size-4 text-slate-400" />
              ) : (
                <ChevronRight className="size-4 text-slate-400" />
              )}
              <span className="min-w-0 flex-1 text-sm text-slate-500">
                {formatResponseTitle(response.content)}
              </span>
            </button>
            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={onStartEdit}
                className="text-purple-600 hover:text-purple-700 p-1"
                title="응답 수정"
              >
                <Edit2 className="size-4" />
              </button>
              <button
                onClick={onDelete}
                className="text-red-600 hover:text-red-700 p-1"
                title="응답 삭제"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
          {isExpanded && (
            <p className="mt-3 text-slate-700 text-base whitespace-pre-wrap break-words leading-relaxed">
              {response.content}
            </p>
          )}
          <p className="text-xs text-slate-400 mt-2">
            {formatDate(response.timestamp)}
          </p>
        </div>
      )}
    </div>
  );
}
