import { useRef, useState } from "react";
import { toast } from "sonner";
import { getBibleBookByKorean } from "../../../../constants/bibleBooks";
import type { ChapterPreviewState, PrayerNote } from "../types/prayerNotes.types";
import { fetchBibleChapter } from "../utils/api";

export function usePrayerNotePreview() {
  const [chapterPreview, setChapterPreview] =
    useState<ChapterPreviewState | null>(null);
  const [chapterPreviewLoading, setChapterPreviewLoading] = useState(false);
  const [chapterPreviewError, setChapterPreviewError] = useState<string | null>(
    null
  );
  const chapterRequestId = useRef(0);

  const handleOpenChapterPreview = async (note: PrayerNote) => {
    if (!note.book || !note.chapter) {
      toast.error("책과 장 정보를 확인해주세요.");
      return;
    }
    const bookMeta = getBibleBookByKorean(note.book);
    if (!bookMeta) {
      toast.error("책 정보를 찾을 수 없습니다.");
      return;
    }

    const requestId = ++chapterRequestId.current;
    setChapterPreviewLoading(true);
    setChapterPreviewError(null);
    setChapterPreview({
      noteId: note.id,
      book: note.book,
      chapter: note.chapter,
      startVerse: note.startVerse,
      endVerse: note.endVerse,
      verses: [],
    });

    try {
      const verses = await fetchBibleChapter({
        bookNumber: bookMeta.number,
        chapter: note.chapter,
      });
      if (chapterRequestId.current !== requestId) return;
      if (!verses.length) {
        setChapterPreviewError("본문을 불러오지 못했습니다.");
        return;
      }
      setChapterPreview((prev) =>
        prev
          ? {
              ...prev,
              verses,
            }
          : null
      );
    } catch (error) {
      if (chapterRequestId.current !== requestId) return;
      const message = error instanceof Error ? error.message : "";
      setChapterPreviewError(message || "본문을 불러오지 못했습니다.");
    } finally {
      if (chapterRequestId.current !== requestId) return;
      setChapterPreviewLoading(false);
    }
  };

  const closeChapterPreview = () => {
    setChapterPreview(null);
    setChapterPreviewError(null);
    setChapterPreviewLoading(false);
  };

  return {
    chapterPreview,
    chapterPreviewLoading,
    chapterPreviewError,
    handleOpenChapterPreview,
    closeChapterPreview,
  };
}
