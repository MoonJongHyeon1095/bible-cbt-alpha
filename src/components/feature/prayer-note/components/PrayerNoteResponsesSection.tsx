import { NotebookPen, Plus } from "lucide-react";
import { Button } from "../../../ui/button";
import { Textarea } from "../../../ui/textarea";
import type { PrayerNoteResponse } from "../types/types";
import { PrayerNoteResponseItem } from "./PrayerNoteResponseItem";

type PrayerNoteResponsesSectionProps = {
  noteId: string;
  responses: PrayerNoteResponse[];
  expandedResponses: Record<string, boolean>;
  editingResponseNoteId: string | null;
  editingResponseId: string | null;
  editingResponseContent: string;
  responseDraft: string;
  onToggleResponseExpand: (responseKey: string) => void;
  onStartEditResponse: (noteId: string, response: PrayerNoteResponse) => void;
  onChangeEditingResponseContent: (value: string) => void;
  onUpdateResponse: (noteId: string, responseId: string) => void;
  onCancelEditResponse: () => void;
  onDeleteResponse: (noteId: string, responseId: string) => void;
  onChangeResponseDraft: (noteId: string, value: string) => void;
  onCreateResponse: (noteId: string) => void;
  formatResponseTitle: (content: string) => string;
  formatDate: (timestamp: string) => string;
};

export function PrayerNoteResponsesSection({
  noteId,
  responses,
  expandedResponses,
  editingResponseNoteId,
  editingResponseId,
  editingResponseContent,
  responseDraft,
  onToggleResponseExpand,
  onStartEditResponse,
  onChangeEditingResponseContent,
  onUpdateResponse,
  onCancelEditResponse,
  onDeleteResponse,
  onChangeResponseDraft,
  onCreateResponse,
  formatResponseTitle,
  formatDate,
}: PrayerNoteResponsesSectionProps) {
  return (
    <div className="bg-slate-50 p-4 rounded-lg mb-3">
      <p className="text-sm text-slate-600 mb-3 flex items-center gap-2">
        <NotebookPen className="size-4 text-slate-500" />
        응답 기록
      </p>
      {responses.length === 0 ? (
        <p className="text-sm text-slate-400">아직 응답이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {responses.map((response) => {
            const isEditing =
              editingResponseNoteId === noteId &&
              editingResponseId === response.id;
            const responseKey = `${noteId}-${response.id}`;
            const isExpanded = Boolean(expandedResponses[responseKey]);

            return (
              <PrayerNoteResponseItem
                key={response.id}
                response={response}
                isEditing={isEditing}
                isExpanded={isExpanded}
                editingContent={editingResponseContent}
                onToggleExpand={() => onToggleResponseExpand(responseKey)}
                onStartEdit={() => onStartEditResponse(noteId, response)}
                onDelete={() => onDeleteResponse(noteId, response.id)}
                onChangeEditingContent={onChangeEditingResponseContent}
                onUpdate={() => onUpdateResponse(noteId, response.id)}
                onCancelEdit={onCancelEditResponse}
                formatResponseTitle={formatResponseTitle}
                formatDate={formatDate}
              />
            );
          })}
        </div>
      )}

      <div className="mt-4 space-y-2">
        <Textarea
          id={`prayer-response-${noteId}`}
          value={responseDraft}
          onChange={(e) => onChangeResponseDraft(noteId, e.target.value)}
          placeholder="응답을 기록하세요..."
          className="min-h-[120px] border-slate-200"
        />
        <Button
          onClick={() => onCreateResponse(noteId)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="size-4 mr-2" />
          응답 추가
        </Button>
      </div>
    </div>
  );
}
