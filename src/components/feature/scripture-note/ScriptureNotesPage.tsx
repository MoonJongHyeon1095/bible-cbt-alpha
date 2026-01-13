import type { User } from "@supabase/supabase-js";
import { BookMarked } from "lucide-react";
import { useRef, useState } from "react";
import { FeatureHeader } from "../common/FeatureHeader";
import { ScrollToTopButton } from "../common/ScrollToTopButton";
import { SelectedSectionActions } from "../common/SelectedSectionActions";
import { useAutoCloseOnScroll } from "../common/utils/useAutoCloseOnScroll";
import { ScriptureChapterPreviewSection } from "./ScriptureChapterPreviewSection";
import { ScriptureNoteFormSection } from "./ScriptureNoteFormSection";
import { ScriptureNotesListSection } from "./ScriptureNotesListSection";
import { useScriptureNotes } from "./hooks/useScriptureNotes";

interface ScriptureNotesPageProps {
  user: User | null;
}

export function ScriptureNotesPage({ user }: ScriptureNotesPageProps) {
  const {
    scriptureFont,
    notes,
    isCreating,
    editingId,
    book,
    chapterInput,
    startVerseInput,
    endVerseInput,
    verse,
    chapterOptions,
    canSelectChapter,
    autoFillLoading,
    autoFillError,
    loading,
    chapterPreview,
    chapterPreviewLoading,
    chapterPreviewError,
    reflectionDrafts,
    editingReflectionNoteId,
    editingReflectionId,
    editingReflectionContent,
    expandedReflections,
    bookRef,
    startCreate,
    handleBookChange,
    handleChapterChange,
    handleStartVerseChange,
    handleEndVerseChange,
    handleVerseChange,
    handleSubmit,
    resetForm,
    handleEdit,
    handleDelete,
    handleOpenChapterPreview,
    closeChapterPreview,
    setEditingReflectionContent,
    startEditReflection,
    resetReflectionEdit,
    handleCreateReflection,
    handleUpdateReflection,
    handleDeleteReflection,
    toggleExpandedReflection,
    updateReflectionDraft,
    formatReflectionTitle,
    formatDate,
  } = useScriptureNotes({ user });
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
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/70 via-white to-emerald-50/40">
      <div className="max-w-[960px] mx-auto px-6 sm:px-8 py-10">
      <FeatureHeader
        overline="Scripture Notes"
        title="말씀 노트"
        subtitle="말씀과 묵상을 한 권의 책처럼 기록하세요."
        icon={BookMarked}
        iconClassName="text-emerald-600"
      />

        <ScriptureNoteFormSection
          isCreating={isCreating}
          editingId={editingId}
          book={book}
          chapterInput={chapterInput}
          startVerseInput={startVerseInput}
          endVerseInput={endVerseInput}
          verse={verse}
          chapterOptions={chapterOptions}
          canSelectChapter={canSelectChapter}
          autoFillLoading={autoFillLoading}
          autoFillError={autoFillError}
          loading={loading}
          scriptureFont={scriptureFont}
          bookRef={bookRef}
          onBookChange={handleBookChange}
          onChapterChange={handleChapterChange}
          onStartVerseChange={handleStartVerseChange}
          onEndVerseChange={handleEndVerseChange}
          onVerseChange={handleVerseChange}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />

        <ScriptureNotesListSection
          loading={loading}
          notes={notes}
          scriptureFont={scriptureFont}
          chapterPreviewLoading={chapterPreviewLoading}
          chapterPreviewNoteId={chapterPreview?.noteId ?? null}
          onOpenChapterPreview={handleOpenChapterPreview}
          onEditNote={(note) => {
            setOpenNoteId(note.id);
            handleEdit(note);
          }}
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
          editingReflectionNoteId={editingReflectionNoteId}
          editingReflectionId={editingReflectionId}
          editingReflectionContent={editingReflectionContent}
          onChangeEditingReflectionContent={setEditingReflectionContent}
          onStartEditReflection={startEditReflection}
          onCancelEditReflection={resetReflectionEdit}
          onUpdateReflection={handleUpdateReflection}
          onDeleteReflection={handleDeleteReflection}
          expandedReflections={expandedReflections}
          onToggleExpanded={toggleExpandedReflection}
          reflectionDrafts={reflectionDrafts}
          onChangeReflectionDraft={updateReflectionDraft}
          onCreateReflection={handleCreateReflection}
          formatReflectionTitle={formatReflectionTitle}
          formatDate={formatDate}
        />

        <ScriptureChapterPreviewSection
          chapterPreview={chapterPreview}
          chapterPreviewLoading={chapterPreviewLoading}
          chapterPreviewError={chapterPreviewError}
          onClose={closeChapterPreview}
          scriptureFont={scriptureFont}
        />
        <SelectedSectionActions
          hidden={!showSelectedActions}
          theme="scripture"
          addLabel="묵상 추가"
          onAdd={() => {
            if (!selectedNote) return;
            setOpenNoteId(selectedNote.id);
            requestAnimationFrame(() => {
              const el = document.getElementById(
                `scripture-reflection-${selectedNote.id}`
              );
              if (el instanceof HTMLElement) {
                el.focus();
              }
            });
          }}
          onEdit={() => {
            if (!selectedNote) return;
            setOpenNoteId(selectedNote.id);
            handleEdit(selectedNote);
          }}
          addAriaLabel="선택 말씀노트 묵상 추가"
          editAriaLabel="선택 말씀노트 편집"
        />

        <ScrollToTopButton
          hidden={Boolean(isCreating || openNoteId)}
          showAction={!isCreating && !openNoteId}
          actionLabel="새 말씀노트 저장"
          onActionClick={startCreate}
          actionClassName="bg-emerald-700 text-white hover:bg-emerald-800 shadow-md shadow-emerald-900/10"
        />
      </div>
    </div>
  );
}
