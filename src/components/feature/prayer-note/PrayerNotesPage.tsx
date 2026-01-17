import type { User } from "@supabase/supabase-js";
import { BookOpen } from "lucide-react";
import { useRef, useState } from "react";
import { FeatureHeader } from "../common/FeatureHeader";
import { ScrollToTopButton } from "../common/ScrollToTopButton";
import { SelectedSectionActions } from "../../common/SelectedSectionActions";
import { useAutoCloseOnScroll } from "../common/utils/useAutoCloseOnScroll";
import { PrayerChapterPreviewSection } from "./PrayerChapterPreviewSection";
import { PrayerNoteFormSection } from "./PrayerNoteFormSection";
import { PrayerNotesListSection } from "./PrayerNotesListSection";
import { usePrayerNotes } from "./hooks/usePrayerNotes";

interface PrayerNotesPageProps {
  user: User | null;
}

export function PrayerNotesPage({ user }: PrayerNotesPageProps) {
  const {
    scriptureFont,
    notes,
    isCreating,
    editingId,
    title,
    content,
    book,
    chapterInput,
    startVerseInput,
    endVerseInput,
    verseLines,
    chapterOptions,
    canSelectChapter,
    autoFillLoading,
    autoFillError,
    loading,
    chapterPreview,
    chapterPreviewLoading,
    chapterPreviewError,
    responseDrafts,
    editingResponseNoteId,
    editingResponseId,
    editingResponseContent,
    expandedResponses,
    bookRef,
    startCreate,
    setTitle,
    setContent,
    handleBookChange,
    handleChapterChange,
    handleStartVerseChange,
    handleEndVerseChange,
    handleSubmit,
    resetForm,
    handleEdit,
    handleDelete,
    handleOpenChapterPreview,
    closeChapterPreview,
    setEditingResponseContent,
    startEditResponse,
    resetResponseEdit,
    handleCreateResponse,
    handleUpdateResponse,
    handleDeleteResponse,
    toggleExpandedResponse,
    updateResponseDraft,
    formatResponseTitle,
    formatDate,
  } = usePrayerNotes({ user });
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);
  const openNoteRef = useRef<HTMLDivElement | null>(null);
  const selectedNote = openNoteId
    ? notes.find((note) => note.id === openNoteId) ?? null
    : null;
  const showSelectedActions = Boolean(selectedNote) && !isCreating;

  useAutoCloseOnScroll({
    isOpen: Boolean(openNoteId),
    targetRef: openNoteRef,
    onClose: () => setOpenNoteId(null),
  });

  return (
    <div className="max-w-[1800px] mx-auto px-8 py-8">
      <FeatureHeader
        overline="Prayer Notes"
        title="기도 노트"
        subtitle="말씀과 기도를 한 권의 책처럼 기록하세요."
        icon={BookOpen}
        iconClassName="text-emerald-600"
      />

        <PrayerNoteFormSection
          isCreating={isCreating}
          editingId={editingId}
          title={title}
          content={content}
          book={book}
          chapterInput={chapterInput}
          startVerseInput={startVerseInput}
          endVerseInput={endVerseInput}
          verseLines={verseLines}
          chapterOptions={chapterOptions}
          canSelectChapter={canSelectChapter}
          autoFillLoading={autoFillLoading}
          autoFillError={autoFillError}
          loading={loading}
          scriptureFont={scriptureFont}
          bookRef={bookRef}
          onTitleChange={setTitle}
          onContentChange={setContent}
          onBookChange={handleBookChange}
          onChapterChange={handleChapterChange}
          onStartVerseChange={handleStartVerseChange}
          onEndVerseChange={handleEndVerseChange}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />

        <PrayerNotesListSection
          loading={loading}
          notes={notes}
          scriptureFont={scriptureFont}
          chapterPreviewLoading={chapterPreviewLoading}
          chapterPreviewNoteId={chapterPreview?.noteId ?? null}
          onOpenChapterPreview={handleOpenChapterPreview}
          onDeleteNote={(noteId) => {
            if (openNoteId === noteId) {
              setOpenNoteId(null);
            }
            handleDelete(noteId);
          }}
          openNoteId={openNoteId}
          onToggleOpen={(noteId) =>
            setOpenNoteId((prev) => (prev === noteId ? null : noteId))
          }
          openNoteRef={openNoteRef}
          editingResponseNoteId={editingResponseNoteId}
          editingResponseId={editingResponseId}
          editingResponseContent={editingResponseContent}
          onChangeEditingResponseContent={setEditingResponseContent}
          onStartEditResponse={startEditResponse}
          onCancelEditResponse={resetResponseEdit}
          onUpdateResponse={handleUpdateResponse}
          onDeleteResponse={handleDeleteResponse}
          expandedResponses={expandedResponses}
          onToggleExpanded={toggleExpandedResponse}
          responseDrafts={responseDrafts}
          onChangeResponseDraft={updateResponseDraft}
          onCreateResponse={handleCreateResponse}
          formatResponseTitle={formatResponseTitle}
          formatDate={formatDate}
        />

        <PrayerChapterPreviewSection
          chapterPreview={chapterPreview}
          chapterPreviewLoading={chapterPreviewLoading}
          chapterPreviewError={chapterPreviewError}
          onClose={closeChapterPreview}
          scriptureFont={scriptureFont}
        />
      <SelectedSectionActions
        hidden={!showSelectedActions}
        theme="prayer"
        onEdit={() => {
          if (!selectedNote) return;
          setOpenNoteId(selectedNote.id);
          handleEdit(selectedNote);
        }}
        editAriaLabel="선택 기도노트 편집"
      />

      <ScrollToTopButton
        hidden={Boolean(isCreating || openNoteId)}
        showAction={!isCreating && !openNoteId}
        actionLabel="새 기도노트 저장"
        onActionClick={startCreate}
        actionClassName="bg-emerald-700 text-white hover:bg-emerald-800 shadow-md shadow-emerald-900/10"
        className="bg-emerald-700 text-white hover:bg-emerald-800"
      />
    </div>
  );
}
