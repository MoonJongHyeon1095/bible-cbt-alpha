import type { RefObject } from "react";
import type { PrayerNote, PrayerNoteResponse } from "../types/types";
import { PrayerNoteCard } from "./PrayerNoteCard";

type PrayerNoteListProps = {
  notes: PrayerNote[];
  openNoteId: string | null;
  openNoteRef: RefObject<HTMLDivElement | null>;
  responseDrafts: Record<string, string>;
  expandedResponses: Record<string, boolean>;
  editingResponseNoteId: string | null;
  editingResponseId: string | null;
  editingResponseContent: string;
  onToggleOpen: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
  onToggleResponseExpand: (responseKey: string) => void;
  onStartEditResponse: (noteId: string, response: PrayerNoteResponse) => void;
  onChangeEditingResponseContent: (value: string) => void;
  onUpdateResponse: (noteId: string, responseId: string) => void;
  onCancelEditResponse: () => void;
  onDeleteResponse: (noteId: string, responseId: string) => void;
  onChangeResponseDraft: (noteId: string, value: string) => void;
  onCreateResponse: (noteId: string) => void;
  formatNoteTitle: (content: string) => string;
  formatNoteSubtitle: (content: string) => string;
  formatResponseTitle: (content: string) => string;
  formatDate: (timestamp: string) => string;
};

export function PrayerNoteList({
  notes,
  openNoteId,
  openNoteRef,
  responseDrafts,
  expandedResponses,
  editingResponseNoteId,
  editingResponseId,
  editingResponseContent,
  onToggleOpen,
  onDeleteNote,
  onToggleResponseExpand,
  onStartEditResponse,
  onChangeEditingResponseContent,
  onUpdateResponse,
  onCancelEditResponse,
  onDeleteResponse,
  onChangeResponseDraft,
  onCreateResponse,
  formatNoteTitle,
  formatNoteSubtitle,
  formatResponseTitle,
  formatDate,
}: PrayerNoteListProps) {
  return (
    <div className="space-y-4">
      {notes.map((note) => {
        const isOpen = openNoteId === note.id;
        const responseDraft = responseDrafts[note.id] ?? "";

        return (
          <div key={note.id} ref={isOpen ? openNoteRef : undefined}>
            <PrayerNoteCard
              note={note}
              isOpen={isOpen}
              responseDraft={responseDraft}
              expandedResponses={expandedResponses}
              editingResponseNoteId={editingResponseNoteId}
              editingResponseId={editingResponseId}
              editingResponseContent={editingResponseContent}
              onToggleOpen={onToggleOpen}
              onDeleteNote={onDeleteNote}
              onToggleResponseExpand={onToggleResponseExpand}
              onStartEditResponse={onStartEditResponse}
              onChangeEditingResponseContent={onChangeEditingResponseContent}
              onUpdateResponse={onUpdateResponse}
              onCancelEditResponse={onCancelEditResponse}
              onDeleteResponse={onDeleteResponse}
              onChangeResponseDraft={onChangeResponseDraft}
              onCreateResponse={onCreateResponse}
              formatNoteTitle={formatNoteTitle}
              formatNoteSubtitle={formatNoteSubtitle}
              formatResponseTitle={formatResponseTitle}
              formatDate={formatDate}
            />
          </div>
        );
      })}
    </div>
  );
}
