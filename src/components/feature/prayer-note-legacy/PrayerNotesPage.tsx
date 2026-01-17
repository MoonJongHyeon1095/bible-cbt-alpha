import { BookOpen } from "lucide-react";
import { useMemo } from "react";
import { FeatureHeader } from "../common/FeatureHeader";
import { ScrollToTopButton } from "../common/ScrollToTopButton";
import { SelectedSectionActions } from "../common/SelectedSectionActions";
import { PrayerNoteForm } from "./components/PrayerNoteForm";
import { PrayerNoteList } from "./components/PrayerNoteList";
import { PrayerNotesEmptyState } from "./components/PrayerNotesEmptyState";
import { PrayerNotesLoadingState } from "./components/PrayerNotesLoadingState";
import { usePrayerNoteForm } from "./hooks/usePrayerNoteForm";
import { usePrayerNoteOpen } from "./hooks/usePrayerNoteOpen";
import { usePrayerNoteResponses } from "./hooks/usePrayerNoteResponses";
import { usePrayerNotesData } from "./hooks/usePrayerNotesData";
import type { PrayerNotesPageProps } from "./types/types";
import {
  formatDate,
  formatNoteSubtitle,
  formatNoteTitle,
  formatResponseTitle,
} from "./utils/utils";

export function PrayerNotesPage({ user }: PrayerNotesPageProps) {
  const {
    notes,
    loading,
    createNote,
    updateNote,
    deleteNote,
    createResponse,
    updateResponse,
    deleteResponse,
  } = usePrayerNotesData(user);

  const form = usePrayerNoteForm({ createNote, updateNote });
  const responses = usePrayerNoteResponses({
    createResponse,
    updateResponse,
    deleteResponse,
  });
  const openState = usePrayerNoteOpen({
    notes,
    isCreating: form.isCreating,
  });

  const formatters = useMemo(
    () => ({
      formatNoteTitle,
      formatNoteSubtitle,
      formatResponseTitle,
      formatDate,
    }),
    []
  );

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-8">
      <FeatureHeader
        overline="Prayer Notes"
        title="기도 노트"
        subtitle="기도와 응답을 기록하세요."
        icon={BookOpen}
        iconClassName="text-purple-600"
      />

      {form.isCreating && (
        <PrayerNoteForm
          isEditing={form.isEditing}
          title={form.title}
          content={form.content}
          tags={form.tags}
          emotionTags={form.emotionTags}
          loading={loading}
          titleRef={form.titleRef}
          onTitleChange={form.setTitle}
          onContentChange={form.setContent}
          onToggleTag={form.toggleTag}
          onSave={form.saveForm}
          onCancel={form.resetForm}
        />
      )}

      {loading ? (
        <PrayerNotesLoadingState />
      ) : notes.length === 0 ? (
        <PrayerNotesEmptyState />
      ) : (
        <PrayerNoteList
          notes={notes}
          openNoteId={openState.openNoteId}
          openNoteRef={openState.openNoteRef}
          responseDrafts={responses.responseDrafts}
          expandedResponses={responses.expandedResponses}
          editingResponseNoteId={responses.editingResponseNoteId}
          editingResponseId={responses.editingResponseId}
          editingResponseContent={responses.editingResponseContent}
          onToggleOpen={openState.toggleOpen}
          onDeleteNote={async (noteId) => {
            if (openState.openNoteId === noteId) {
              openState.setOpenNoteId(null);
            }
            await deleteNote(noteId);
          }}
          onToggleResponseExpand={responses.toggleExpanded}
          onStartEditResponse={responses.startEditResponse}
          onChangeEditingResponseContent={responses.updateEditingContent}
          onUpdateResponse={responses.updateResponseForNote}
          onCancelEditResponse={responses.resetResponseEdit}
          onDeleteResponse={responses.deleteResponseForNote}
          onChangeResponseDraft={responses.changeDraft}
          onCreateResponse={responses.createResponseForNote}
          formatNoteTitle={formatters.formatNoteTitle}
          formatNoteSubtitle={formatters.formatNoteSubtitle}
          formatResponseTitle={formatters.formatResponseTitle}
          formatDate={formatters.formatDate}
        />
      )}

      <SelectedSectionActions
        hidden={!openState.showSelectedActions}
        theme="prayer"
        addLabel="응답 추가"
        onAdd={() => {
          const selectedNote = openState.selectedNote;
          if (!selectedNote) return;
          openState.setOpenNoteId(selectedNote.id);
          requestAnimationFrame(() => {
            const el = document.getElementById(
              `prayer-response-${selectedNote.id}`
            );
            if (el instanceof HTMLElement) {
              el.focus();
            }
          });
        }}
        onEdit={() => {
          const selectedNote = openState.selectedNote;
          if (!selectedNote) return;
          openState.setOpenNoteId(selectedNote.id);
          form.startEdit(selectedNote);
        }}
        addAriaLabel="선택 기도노트 응답 추가"
        editAriaLabel="선택 기도노트 편집"
      />

      <ScrollToTopButton
        hidden={Boolean(form.isCreating || openState.openNoteId)}
        showAction={!form.isCreating && !openState.openNoteId}
        actionLabel="새 기도노트 저장"
        onActionClick={form.startCreate}
        actionClassName="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
      />
    </div>
  );
}
