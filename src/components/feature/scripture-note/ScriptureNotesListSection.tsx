import { BookMarked } from "lucide-react";
import type { CSSProperties } from "react";
import { Card } from "../../ui/card";
import { ScriptureNoteCard } from "./ScriptureNoteCard";
import type {
  ScriptureNote,
  ScriptureNoteReflection,
} from "./types/scriptureNotes.types";

interface ScriptureNotesListSectionProps {
  loading: boolean;
  notes: ScriptureNote[];
  scriptureFont: CSSProperties;
  chapterPreviewLoading: boolean;
  chapterPreviewNoteId: string | null;
  onOpenChapterPreview: (note: ScriptureNote) => void;
  onEditNote: (note: ScriptureNote) => void;
  onDeleteNote: (noteId: string) => void;
  openNoteId: string | null;
  onToggleOpen: (noteId: string) => void;
  openNoteRef: React.RefObject<HTMLDivElement | null>;
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
  reflectionDrafts: Record<string, string>;
  onChangeReflectionDraft: (noteId: string, value: string) => void;
  onCreateReflection: (noteId: string) => void;
  formatReflectionTitle: (content: string) => string;
  formatDate: (timestamp: string) => string;
}

export function ScriptureNotesListSection({
  loading,
  notes,
  scriptureFont,
  chapterPreviewLoading,
  chapterPreviewNoteId,
  onOpenChapterPreview,
  onEditNote,
  onDeleteNote,
  openNoteId,
  onToggleOpen,
  openNoteRef,
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
  reflectionDrafts,
  onChangeReflectionDraft,
  onCreateReflection,
  formatReflectionTitle,
  formatDate,
}: ScriptureNotesListSectionProps) {
  if (loading) {
    return (
      <Card className="p-12 text-center bg-white/80 border border-emerald-100">
        <BookMarked className="size-16 text-emerald-200 mx-auto mb-4 animate-pulse" />
        <p className="text-slate-500 text-lg mb-2">
          말씀 노트를 불러오는 중입니다...
        </p>
      </Card>
    );
  }

  if (notes.length === 0) {
    return (
      <Card className="p-12 text-center bg-white/80 border border-emerald-100">
        <BookMarked className="size-16 text-emerald-200 mx-auto mb-4" />
        <p className="text-slate-500 text-lg mb-2">
          아직 말씀 노트가 없습니다.
        </p>
        <p className="text-slate-400">첫 번째 말씀 노트를 작성해보세요.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {notes.map((note) => (
        <ScriptureNoteCard
          key={note.id}
          note={note}
          isOpen={openNoteId === note.id}
          onToggleOpen={() => onToggleOpen(note.id)}
          containerRef={openNoteId === note.id ? openNoteRef : undefined}
          scriptureFont={scriptureFont}
          chapterPreviewLoading={chapterPreviewLoading}
          chapterPreviewNoteId={chapterPreviewNoteId}
          onOpenChapterPreview={onOpenChapterPreview}
          onEditNote={onEditNote}
          onDeleteNote={onDeleteNote}
          editingReflectionNoteId={editingReflectionNoteId}
          editingReflectionId={editingReflectionId}
          editingReflectionContent={editingReflectionContent}
          onChangeEditingReflectionContent={onChangeEditingReflectionContent}
          onStartEditReflection={onStartEditReflection}
          onCancelEditReflection={onCancelEditReflection}
          onUpdateReflection={onUpdateReflection}
          onDeleteReflection={onDeleteReflection}
          expandedReflections={expandedReflections}
          onToggleExpanded={onToggleExpanded}
          reflectionDraft={reflectionDrafts[note.id] ?? ""}
          onChangeReflectionDraft={(value) =>
            onChangeReflectionDraft(note.id, value)
          }
          onCreateReflection={onCreateReflection}
          formatReflectionTitle={formatReflectionTitle}
          formatDate={formatDate}
        />
      ))}
    </div>
  );
}
