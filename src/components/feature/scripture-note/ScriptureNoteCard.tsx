import { ChevronDown, ChevronRight, Search, Trash2 } from "lucide-react";
import type { CSSProperties } from "react";
import { formatScriptureReference } from "../../../utils/scripture";
import { Card } from "../../ui/card";
import { ScriptureNoteReflectionSection } from "./ScriptureNoteReflectionSection";
import type {
  ScriptureNote,
  ScriptureNoteReflection,
} from "./types/scriptureNotes.types";

interface ScriptureNoteCardProps {
  note: ScriptureNote;
  isOpen: boolean;
  onToggleOpen: () => void;
  containerRef?: React.Ref<HTMLDivElement>;
  scriptureFont: CSSProperties;
  chapterPreviewLoading: boolean;
  chapterPreviewNoteId: string | null;
  onOpenChapterPreview: (note: ScriptureNote) => void;
  onEditNote: (note: ScriptureNote) => void;
  onDeleteNote: (noteId: string) => void;
  editingReflectionNoteId: string | null;
  editingReflectionId: string | null;
  editingReflectionContent: string;
  onChangeEditingReflectionContent: (value: string) => void;
  onStartEditReflection: (
    noteId: string,
    reflection: ScriptureNoteReflection
  ) => void;
  onCancelEditReflection: () => void;
  onUpdateReflection: (noteId: string, reflectionId: string) => void;
  onDeleteReflection: (noteId: string, reflectionId: string) => void;
  expandedReflections: Record<string, boolean>;
  onToggleExpanded: (key: string) => void;
  reflectionDraft: string;
  onChangeReflectionDraft: (value: string) => void;
  onCreateReflection: (noteId: string) => void;
  formatReflectionTitle: (content: string) => string;
  formatDate: (timestamp: string) => string;
}

export function ScriptureNoteCard({
  note,
  isOpen,
  onToggleOpen,
  containerRef,
  scriptureFont,
  chapterPreviewLoading,
  chapterPreviewNoteId,
  onOpenChapterPreview,
  onEditNote,
  onDeleteNote,
  editingReflectionNoteId,
  editingReflectionId,
  editingReflectionContent,
  onChangeEditingReflectionContent,
  onStartEditReflection,
  onCancelEditReflection,
  onUpdateReflection,
  onDeleteReflection,
  expandedReflections,
  onToggleExpanded,
  reflectionDraft,
  onChangeReflectionDraft,
  onCreateReflection,
  formatReflectionTitle,
  formatDate,
}: ScriptureNoteCardProps) {
  const reflections = [...note.reflections].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div ref={containerRef}>
      <Card
        className={`p-8 hover:shadow-[0_24px_60px_-42px_rgba(15,23,42,0.6)] transition-shadow bg-white/95 border border-emerald-100 ${
          isOpen ? "ring-2 ring-emerald-300 shadow-md" : ""
        }`}
      >
      <div className="flex items-start justify-between gap-3 mb-6">
        <div className="min-w-0 flex-1">
          <div className="text-xs uppercase tracking-[0.2em] text-emerald-600/70 mb-2">
            Reference
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onToggleOpen}
              className="flex items-center gap-2 text-left"
              title={isOpen ? "말씀 노트 접기" : "말씀 노트 펼치기"}
            >
              {isOpen ? (
                <ChevronDown className="size-4 text-slate-400" />
              ) : (
                <ChevronRight className="size-4 text-slate-400" />
              )}
              <h3
                className="text-xl sm:text-2xl text-emerald-900 leading-tight"
                style={scriptureFont}
              >
                {formatScriptureReference(
                  note.book,
                  note.chapter,
                  note.startVerse,
                  note.endVerse
                )}
              </h3>
            </button>
            <button
              onClick={() => onOpenChapterPreview(note)}
              className="text-slate-500 hover:text-emerald-700 p-1 disabled:opacity-50"
              title="장 보기"
              disabled={
                chapterPreviewLoading && chapterPreviewNoteId === note.id
              }
            >
              <Search className="size-4" />
            </button>
          </div>
        </div>
        <div className="flex shrink-0 gap-1 pt-6 sm:pt-7">
          <button
            onClick={() => onDeleteNote(note.id)}
            className="text-red-600 hover:text-red-700 p-1"
            title="삭제"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {isOpen && (
        <>
          <div className="bg-emerald-50/70 border-l-2 border-emerald-400 p-5 rounded-r-2xl mb-6">
            <p
              className="text-[15px] sm:text-base text-slate-700 leading-7 sm:leading-8 whitespace-pre-wrap"
              style={scriptureFont}
            >
              "{note.verse}"
            </p>
          </div>

          <ScriptureNoteReflectionSection
            noteId={note.id}
            reflections={reflections}
            editingReflectionNoteId={editingReflectionNoteId}
            editingReflectionId={editingReflectionId}
            editingReflectionContent={editingReflectionContent}
            onChangeEditingContent={onChangeEditingReflectionContent}
            onStartEdit={onStartEditReflection}
            onCancelEdit={onCancelEditReflection}
            onUpdateReflection={onUpdateReflection}
            onDeleteReflection={onDeleteReflection}
            expandedReflections={expandedReflections}
            onToggleExpanded={onToggleExpanded}
            reflectionDraft={reflectionDraft}
            onChangeDraft={onChangeReflectionDraft}
            onCreateReflection={onCreateReflection}
            scriptureFont={scriptureFont}
            formatReflectionTitle={formatReflectionTitle}
            formatDate={formatDate}
            draftTextareaId={`scripture-reflection-${note.id}`}
          />

          <p className="text-xs text-slate-400">{formatDate(note.timestamp)}</p>
        </>
      )}
      </Card>
    </div>
  );
}
