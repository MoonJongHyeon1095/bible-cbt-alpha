import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useScriptureNoteForm } from "./useScriptureNoteForm";
import { useScriptureNotesData } from "./useScriptureNotesData";
import { useScriptureNotePreview } from "./useScriptureNotePreview";
import { useScriptureNoteReflections } from "./useScriptureNoteReflections";

interface UseScriptureNotesParams {
  user: User | null;
}

export function useScriptureNotes({ user }: UseScriptureNotesParams) {
  const scriptureFont = {
    fontFamily:
      '"Nanum Myeongjo", "Noto Serif KR", "Apple SD Gothic Neo", serif',
  };

  const form = useScriptureNoteForm();
  const data = useScriptureNotesData({ user });
  const preview = useScriptureNotePreview();
  const reflections = useScriptureNoteReflections({
    user,
    notes: data.notes,
    setNotes: data.setNotes,
    saveNotesLocally: data.saveNotesLocally,
  });

  const formatReflectionTitle = (content: string) => {
    const trimmed = content.trim();
    if (trimmed.length <= 20) return trimmed;
    return `${trimmed.slice(0, 20)}…`;
  };

  const handleSubmit = async () => {
    const safeBook = form.book.trim();
    const parsedChapter = Number.parseInt(form.chapterInput.trim(), 10);
    const safeChapter = Number.isFinite(parsedChapter) ? parsedChapter : null;
    const parsedStartVerse = Number.parseInt(form.startVerseInput.trim(), 10);
    const parsedEndVerse = Number.parseInt(form.endVerseInput.trim(), 10);
    const safeStartVerse = Number.isFinite(parsedStartVerse)
      ? parsedStartVerse
      : null;
    const safeEndVerse = Number.isFinite(parsedEndVerse)
      ? parsedEndVerse
      : safeStartVerse;

    if (!safeBook || !safeChapter || !safeStartVerse || !form.verse.trim()) {
      toast.error("성경 구절(책, 장, 절)과 말씀을 입력해주세요.");
      return;
    }
    if (safeStartVerse && safeEndVerse && safeEndVerse < safeStartVerse) {
      toast.error("끝 절은 시작 절보다 클 수 없습니다.");
      return;
    }
    if (form.autoFillError) {
      toast.error(form.autoFillError);
      return;
    }

    const payload = {
      book: safeBook,
      chapter: safeChapter,
      startVerse: safeStartVerse,
      endVerse: safeEndVerse,
      verse: form.verse.trim(),
    };

    try {
      if (form.editingId) {
        await data.updateNote(form.editingId, payload);
      } else {
        await data.createNote(payload);
      }
      form.resetForm();
    } catch (error) {
      console.error("말씀 노트 저장 실패:", error);
      toast.error(
        form.editingId
          ? "말씀 노트를 수정하지 못했습니다."
          : "말씀 노트를 저장하지 못했습니다."
      );
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      await data.deleteNote(noteId);
      toast.success("말씀 노트를 삭제했습니다.");
    } catch (error) {
      console.error("말씀 노트 삭제 실패:", error);
      toast.error("말씀 노트를 삭제하지 못했습니다.");
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return {
    scriptureFont,
    notes: data.notes,
    isCreating: form.isCreating,
    editingId: form.editingId,
    book: form.book,
    chapterInput: form.chapterInput,
    startVerseInput: form.startVerseInput,
    endVerseInput: form.endVerseInput,
    verse: form.verse,
    chapterOptions: form.chapterOptions,
    canSelectChapter: form.canSelectChapter,
    autoFillLoading: form.autoFillLoading,
    autoFillError: form.autoFillError,
    loading: data.loading,
    chapterPreview: preview.chapterPreview,
    chapterPreviewLoading: preview.chapterPreviewLoading,
    chapterPreviewError: preview.chapterPreviewError,
    reflectionDrafts: reflections.reflectionDrafts,
    editingReflectionNoteId: reflections.editingReflectionNoteId,
    editingReflectionId: reflections.editingReflectionId,
    editingReflectionContent: reflections.editingReflectionContent,
    expandedReflections: reflections.expandedReflections,
    bookRef: form.bookRef,
    startCreate: form.startCreate,
    handleBookChange: form.handleBookChange,
    handleChapterChange: form.handleChapterChange,
    handleStartVerseChange: form.handleStartVerseChange,
    handleEndVerseChange: form.handleEndVerseChange,
    handleVerseChange: form.handleVerseChange,
    handleSubmit,
    resetForm: form.resetForm,
    handleEdit: form.setFormFromNote,
    handleDelete,
    handleOpenChapterPreview: preview.handleOpenChapterPreview,
    closeChapterPreview: preview.closeChapterPreview,
    setEditingReflectionContent: reflections.setEditingReflectionContent,
    startEditReflection: reflections.startEditReflection,
    resetReflectionEdit: reflections.resetReflectionEdit,
    handleCreateReflection: reflections.handleCreateReflection,
    handleUpdateReflection: reflections.handleUpdateReflection,
    handleDeleteReflection: reflections.handleDeleteReflection,
    toggleExpandedReflection: reflections.toggleExpandedReflection,
    updateReflectionDraft: reflections.updateReflectionDraft,
    formatReflectionTitle,
    formatDate,
  };
}
