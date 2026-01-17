import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { Card } from "../../../ui/card";
import type { PrayerNote, PrayerNoteResponse } from "../types/types";
import { PrayerNoteResponsesSection } from "./PrayerNoteResponsesSection";

type PrayerNoteCardProps = {
  note: PrayerNote;
  isOpen: boolean;
  responseDraft: string;
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

export function PrayerNoteCard({
  note,
  isOpen,
  responseDraft,
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
}: PrayerNoteCardProps) {
  const responses = [...note.responses].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card
      className={`p-5 hover:shadow-lg transition-shadow bg-white border-purple-100 ${
        isOpen ? "ring-2 ring-purple-300 shadow-md" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <button
          type="button"
          onClick={() => onToggleOpen(note.id)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left mr-2"
          title={isOpen ? "기도 노트 접기" : "기도 노트 펼치기"}
        >
          {isOpen ? (
            <ChevronDown className="size-4 text-slate-400" />
          ) : (
            <ChevronRight className="size-4 text-slate-400" />
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-lg text-slate-900 truncate">
              {formatNoteTitle(note.title)}
            </h3>
            {!isOpen && (
              <p className="text-sm text-slate-500 truncate">
                {formatNoteSubtitle(note.content)}
              </p>
            )}
          </div>
        </button>
        <div className="flex gap-1">
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
          <p className="text-slate-600 text-base mb-3 whitespace-pre-wrap leading-relaxed">
            {note.content}
          </p>

          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {note.tags.map((tag, idx) => (
                <span
                  key={`${note.id}-${idx}`}
                  className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <PrayerNoteResponsesSection
            noteId={note.id}
            responses={responses}
            expandedResponses={expandedResponses}
            editingResponseNoteId={editingResponseNoteId}
            editingResponseId={editingResponseId}
            editingResponseContent={editingResponseContent}
            responseDraft={responseDraft}
            onToggleResponseExpand={onToggleResponseExpand}
            onStartEditResponse={onStartEditResponse}
            onChangeEditingResponseContent={onChangeEditingResponseContent}
            onUpdateResponse={onUpdateResponse}
            onCancelEditResponse={onCancelEditResponse}
            onDeleteResponse={onDeleteResponse}
            onChangeResponseDraft={onChangeResponseDraft}
            onCreateResponse={onCreateResponse}
            formatResponseTitle={formatResponseTitle}
            formatDate={formatDate}
          />

          <p className="text-xs text-slate-400">{formatDate(note.timestamp)}</p>
        </>
      )}
    </Card>
  );
}
