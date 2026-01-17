import { BookOpen } from "lucide-react";
import type { CSSProperties } from "react";
import { Card } from "../../ui/card";
import { PrayerNoteCard } from "./PrayerNoteCard";
import type { PrayerNote, PrayerNoteResponse } from "./types/prayerNotes.types";

interface PrayerNotesListSectionProps {
  loading: boolean;
  notes: PrayerNote[];
  scriptureFont: CSSProperties;
  chapterPreviewLoading: boolean;
  chapterPreviewNoteId: string | null;
  onOpenChapterPreview: (note: PrayerNote) => void;
  onDeleteNote: (noteId: string) => void;
  openNoteId: string | null;
  onToggleOpen: (noteId: string) => void;
  openNoteRef: React.RefObject<HTMLDivElement | null>;
  editingResponseNoteId: string | null;
  editingResponseId: string | null;
  editingResponseContent: string;
  onChangeEditingResponseContent: (value: string) => void;
  onStartEditResponse: (
    noteId: string,
    response: PrayerNoteResponse
  ) => void;
  onCancelEditResponse: () => void;
  onUpdateResponse: (noteId: string, responseId: string) => void;
  onDeleteResponse: (noteId: string, responseId: string) => void;
  expandedResponses: Record<string, boolean>;
  onToggleExpanded: (key: string) => void;
  responseDrafts: Record<string, string>;
  onChangeResponseDraft: (noteId: string, value: string) => void;
  onCreateResponse: (noteId: string) => void;
  formatResponseTitle: (content: string) => string;
  formatDate: (timestamp: string) => string;
}

export function PrayerNotesListSection({
  loading,
  notes,
  scriptureFont,
  chapterPreviewLoading,
  chapterPreviewNoteId,
  onOpenChapterPreview,
  onDeleteNote,
  openNoteId,
  onToggleOpen,
  openNoteRef,
  editingResponseNoteId,
  editingResponseId,
  editingResponseContent,
  onChangeEditingResponseContent,
  onStartEditResponse,
  onCancelEditResponse,
  onUpdateResponse,
  onDeleteResponse,
  expandedResponses,
  onToggleExpanded,
  responseDrafts,
  onChangeResponseDraft,
  onCreateResponse,
  formatResponseTitle,
  formatDate,
}: PrayerNotesListSectionProps) {
  if (loading) {
    return (
      <Card className="p-12 text-center bg-white/80 border border-emerald-100">
        <BookOpen className="size-16 text-emerald-200 mx-auto mb-4 animate-pulse" />
        <p className="text-slate-500 text-lg mb-2">
          기도 노트를 불러오는 중입니다...
        </p>
      </Card>
    );
  }

  if (notes.length === 0) {
    return (
      <Card className="p-12 text-center bg-white/80 border border-emerald-100">
        <BookOpen className="size-16 text-emerald-200 mx-auto mb-4" />
        <p className="text-slate-500 text-lg mb-2">
          아직 기도 노트가 없습니다.
        </p>
        <p className="text-slate-400">첫 번째 기도 노트를 작성해보세요.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {notes.map((note) => (
        <PrayerNoteCard
          key={note.id}
          note={note}
          isOpen={openNoteId === note.id}
          onToggleOpen={() => onToggleOpen(note.id)}
          containerRef={openNoteId === note.id ? openNoteRef : undefined}
          scriptureFont={scriptureFont}
          chapterPreviewLoading={chapterPreviewLoading}
          chapterPreviewNoteId={chapterPreviewNoteId}
          onOpenChapterPreview={onOpenChapterPreview}
          onDeleteNote={onDeleteNote}
          editingResponseNoteId={editingResponseNoteId}
          editingResponseId={editingResponseId}
          editingResponseContent={editingResponseContent}
          onChangeEditingResponseContent={onChangeEditingResponseContent}
          onStartEditResponse={onStartEditResponse}
          onCancelEditResponse={onCancelEditResponse}
          onUpdateResponse={onUpdateResponse}
          onDeleteResponse={onDeleteResponse}
          expandedResponses={expandedResponses}
          onToggleExpanded={onToggleExpanded}
          responseDraft={responseDrafts[note.id] ?? ""}
          onChangeResponseDraft={(value) =>
            onChangeResponseDraft(note.id, value)
          }
          onCreateResponse={onCreateResponse}
          formatResponseTitle={formatResponseTitle}
          formatDate={formatDate}
        />
      ))}
    </div>
  );
}
