import {
  ChevronDown,
  ChevronRight,
  Edit2,
  NotebookPen,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import type { CSSProperties } from "react";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import type { ScriptureNoteReflection } from "./types/scriptureNotes.types";

interface ScriptureNoteReflectionSectionProps {
  noteId: string;
  reflections: ScriptureNoteReflection[];
  editingReflectionNoteId: string | null;
  editingReflectionId: string | null;
  editingReflectionContent: string;
  onChangeEditingContent: (value: string) => void;
  onStartEdit: (noteId: string, reflection: ScriptureNoteReflection) => void;
  onCancelEdit: () => void;
  onUpdateReflection: (noteId: string, reflectionId: string) => void;
  onDeleteReflection: (noteId: string, reflectionId: string) => void;
  expandedReflections: Record<string, boolean>;
  onToggleExpanded: (key: string) => void;
  reflectionDraft: string;
  onChangeDraft: (value: string) => void;
  onCreateReflection: (noteId: string) => void;
  scriptureFont: CSSProperties;
  formatReflectionTitle: (content: string) => string;
  formatDate: (timestamp: string) => string;
  draftTextareaId?: string;
}

export function ScriptureNoteReflectionSection({
  noteId,
  reflections,
  editingReflectionNoteId,
  editingReflectionId,
  editingReflectionContent,
  onChangeEditingContent,
  onStartEdit,
  onCancelEdit,
  onUpdateReflection,
  onDeleteReflection,
  expandedReflections,
  onToggleExpanded,
  reflectionDraft,
  onChangeDraft,
  onCreateReflection,
  scriptureFont,
  formatReflectionTitle,
  formatDate,
  draftTextareaId,
}: ScriptureNoteReflectionSectionProps) {
  return (
    <div className="bg-white border border-slate-100 p-5 rounded-2xl mb-6">
      <p className="text-sm text-slate-600 mb-4 flex items-center gap-2">
        <NotebookPen className="size-4 text-emerald-600" />
        묵상 기록
      </p>
      {reflections.length === 0 ? (
        <p className="text-sm text-slate-400">아직 묵상이 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {reflections.map((reflection) => {
            const isEditing =
              editingReflectionNoteId === noteId &&
              editingReflectionId === reflection.id;
            const reflectionKey = `${noteId}-${reflection.id}`;
            const isExpanded = Boolean(expandedReflections[reflectionKey]);

            return (
              <div
                key={reflection.id}
                className="rounded-2xl border border-slate-100 bg-emerald-50/30 p-4"
              >
                {isEditing ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editingReflectionContent}
                      onChange={(e) => onChangeEditingContent(e.target.value)}
                      className="min-h-[120px] border-slate-200"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          onUpdateReflection(noteId, reflection.id)
                        }
                        className="bg-amber-600 hover:bg-amber-700"
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
                        onClick={() => onToggleExpanded(reflectionKey)}
                        className="flex min-w-0 flex-1 items-center gap-2 text-left"
                        title={isExpanded ? "묵상 접기" : "묵상 펼치기"}
                      >
                        {isExpanded ? (
                          <ChevronDown className="size-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="size-4 text-slate-400" />
                        )}
                        <span className="min-w-0 flex-1 text-sm text-slate-500">
                          {formatReflectionTitle(reflection.content)}
                        </span>
                      </button>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          onClick={() => onStartEdit(noteId, reflection)}
                          className="text-amber-600 hover:text-amber-700 p-1"
                          title="묵상 수정"
                        >
                          <Edit2 className="size-4" />
                        </button>
                        <button
                          onClick={() =>
                            onDeleteReflection(noteId, reflection.id)
                          }
                          className="text-red-600 hover:text-red-700 p-1"
                          title="묵상 삭제"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                    {isExpanded && (
                      <p
                        className="mt-3 text-[15px] sm:text-base text-slate-700 leading-7 whitespace-pre-wrap break-words"
                        style={scriptureFont}
                      >
                        {reflection.content}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-3">
                      {formatDate(reflection.timestamp)}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-5 space-y-3">
        <Textarea
          id={draftTextareaId}
          value={reflectionDraft}
          onChange={(e) => onChangeDraft(e.target.value)}
          placeholder="묵상을 기록하세요..."
          className="min-h-[140px] border-slate-200"
          style={scriptureFont}
        />
        <Button
          onClick={() => onCreateReflection(noteId)}
          className="bg-emerald-700 hover:bg-emerald-800"
        >
          <Plus className="size-4 mr-2" />
          묵상 추가
        </Button>
      </div>
    </div>
  );
}
