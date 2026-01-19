import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { validateUserText } from "../../../../utils/validation";
import { formatScriptureReference } from "../../../../utils/scripture";
import { usePrayerNoteForm } from "./usePrayerNoteForm";
import { usePrayerNotesData } from "./usePrayerNotesData";
import { usePrayerNotePreview } from "./usePrayerNotePreview";
import { usePrayerNoteResponses } from "./usePrayerNoteResponses";

interface UsePrayerNotesParams {
  user: User | null;
}

export function usePrayerNotes({ user }: UsePrayerNotesParams) {
  const scriptureFont = {
    fontFamily:
      '"Nanum Myeongjo", "Noto Serif KR", "Apple SD Gothic Neo", serif',
  };

  const form = usePrayerNoteForm();
  const data = usePrayerNotesData({ user });
  const preview = usePrayerNotePreview();
  const responses = usePrayerNoteResponses({
    user,
    notes: data.notes,
    setNotes: data.setNotes,
    saveNotesLocally: data.saveNotesLocally,
  });

  const formatResponseTitle = (content: string) => {
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

    if (!safeBook || !safeChapter || !safeStartVerse) {
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

    const referenceLabel = formatScriptureReference(
      safeBook,
      safeChapter,
      safeStartVerse,
      safeEndVerse
    );

    const editingNote = form.editingId
      ? data.notes.find((note) => note.id === form.editingId)
      : null;

    const titleValue = form.title.trim();
    const contentValue = form.content.trim();

    const titleValidation = validateUserText(titleValue);
    if (!titleValidation.ok) {
      toast.error(
        titleValidation.code === "empty"
          ? "기도 제목을 입력해주세요."
          : titleValidation.message
      );
      return;
    }

    const contentValidation = validateUserText(contentValue);
    if (!contentValidation.ok) {
      toast.error(
        contentValidation.code === "empty"
          ? "기도문을 입력해주세요."
          : contentValidation.message
      );
      return;
    }

    const payload = {
      title:
        titleValue ||
        editingNote?.title ||
        (referenceLabel ? `${referenceLabel}에 대한 기도` : "기도 노트"),
      content: contentValue || editingNote?.content || "",
      tags: editingNote?.tags ?? [],
      emotionNoteId: editingNote?.emotionNoteId ?? null,
      book: safeBook,
      chapter: safeChapter,
      startVerse: safeStartVerse,
      endVerse: safeEndVerse,
    };

    try {
      if (form.editingId) {
        await data.updateNote(form.editingId, payload);
      } else {
        await data.createNote(payload);
      }
      form.resetForm();
    } catch (error) {
      console.error("기도 노트 저장 실패:", error);
      toast.error(
        form.editingId
          ? "기도 노트를 수정하지 못했습니다."
          : "기도 노트를 저장하지 못했습니다."
      );
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      await data.deleteNote(noteId);
      toast.success("기도 노트를 삭제했습니다.");
    } catch (error) {
      console.error("기도 노트 삭제 실패:", error);
      toast.error("기도 노트를 삭제하지 못했습니다.");
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return {
    scriptureFont,
    notes: data.notes,
    isCreating: form.isCreating,
    editingId: form.editingId,
    title: form.title,
    content: form.content,
    book: form.book,
    chapterInput: form.chapterInput,
    startVerseInput: form.startVerseInput,
    endVerseInput: form.endVerseInput,
    verseLines: form.verseLines,
    chapterOptions: form.chapterOptions,
    canSelectChapter: form.canSelectChapter,
    autoFillLoading: form.autoFillLoading,
    autoFillError: form.autoFillError,
    loading: data.loading,
    chapterPreview: preview.chapterPreview,
    chapterPreviewLoading: preview.chapterPreviewLoading,
    chapterPreviewError: preview.chapterPreviewError,
    responseDrafts: responses.responseDrafts,
    editingResponseNoteId: responses.editingResponseNoteId,
    editingResponseId: responses.editingResponseId,
    editingResponseContent: responses.editingResponseContent,
    expandedResponses: responses.expandedResponses,
    bookRef: form.bookRef,
    startCreate: form.startCreate,
    handleBookChange: form.handleBookChange,
    handleChapterChange: form.handleChapterChange,
    handleStartVerseChange: form.handleStartVerseChange,
    handleEndVerseChange: form.handleEndVerseChange,
    setTitle: form.setTitle,
    setContent: form.setContent,
    handleSubmit,
    resetForm: form.resetForm,
    handleEdit: form.setFormFromNote,
    handleDelete,
    handleOpenChapterPreview: preview.handleOpenChapterPreview,
    closeChapterPreview: preview.closeChapterPreview,
    setEditingResponseContent: responses.setEditingResponseContent,
    startEditResponse: responses.startEditResponse,
    resetResponseEdit: responses.resetResponseEdit,
    handleCreateResponse: responses.handleCreateResponse,
    handleUpdateResponse: responses.handleUpdateResponse,
    handleDeleteResponse: responses.handleDeleteResponse,
    toggleExpandedResponse: responses.toggleExpandedResponse,
    updateResponseDraft: responses.updateResponseDraft,
    formatResponseTitle,
    formatDate,
  };
}
