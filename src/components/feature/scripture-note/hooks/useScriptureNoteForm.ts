import { useEffect, useRef, useState } from "react";
import { getBibleBookByKorean } from "../../../../constants/bibleBooks";
import type { ScriptureNote } from "../types/scriptureNotes.types";
import { fetchBibleVersesRange } from "../utils/api";

export function useScriptureNoteForm() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [book, setBook] = useState("");
  const [chapterInput, setChapterInput] = useState("");
  const [startVerseInput, setStartVerseInput] = useState("");
  const [endVerseInput, setEndVerseInput] = useState("");
  const [verse, setVerse] = useState("");
  const [verseDirty, setVerseDirty] = useState(false);
  const [autoFillLoading, setAutoFillLoading] = useState(false);
  const [autoFillError, setAutoFillError] = useState<string | null>(null);
  const bookRef = useRef<HTMLButtonElement | null>(null);
  const autoFillRequestId = useRef(0);

  const selectedBook = getBibleBookByKorean(book);
  const chapterOptions = selectedBook
    ? Array.from({ length: selectedBook.chapters }, (_, idx) => String(idx + 1))
    : [];

  useEffect(() => {
    if (isCreating && bookRef.current) {
      bookRef.current.focus();
    }
  }, [isCreating]);

  useEffect(() => {
    if (!isCreating || !selectedBook) return;
    if (verseDirty) return;

    const parsedChapter = Number.parseInt(chapterInput.trim(), 10);
    const parsedStartVerse = Number.parseInt(startVerseInput.trim(), 10);
    const parsedEndVerse = Number.parseInt(endVerseInput.trim(), 10);

    if (!Number.isFinite(parsedChapter) || !Number.isFinite(parsedStartVerse)) {
      return;
    }

    const safeEndVerse = Number.isFinite(parsedEndVerse)
      ? parsedEndVerse
      : parsedStartVerse;

    if (safeEndVerse < parsedStartVerse) {
      return;
    }

    const requestId = ++autoFillRequestId.current;
    setAutoFillLoading(true);
    setAutoFillError(null);

    fetchBibleVersesRange({
      englishBook: selectedBook.english,
      chapter: parsedChapter,
      startVerse: parsedStartVerse,
      endVerse: safeEndVerse,
    })
      .then((lines) => {
        if (autoFillRequestId.current !== requestId) return;
        if (!lines.length) {
          setAutoFillError("본문을 불러오지 못했습니다.");
          return;
        }
        setVerse(lines.join("\n"));
        setVerseDirty(false);
      })
      .catch((error: unknown) => {
        if (autoFillRequestId.current !== requestId) return;
        const message = error instanceof Error ? error.message : "";
        if (message.includes("Verse") && message.includes("not found")) {
          setAutoFillError("입력한 절 범위가 이 장을 벗어났습니다.");
          return;
        }
        setAutoFillError("본문을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (autoFillRequestId.current !== requestId) return;
        setAutoFillLoading(false);
      });
  }, [
    isCreating,
    selectedBook,
    chapterInput,
    startVerseInput,
    endVerseInput,
    verseDirty,
  ]);

  const startCreate = () => setIsCreating(true);

  const handleBookChange = (value: string) => {
    setBook(value);
    setVerseDirty(false);
    setChapterInput("");
    setStartVerseInput("");
    setEndVerseInput("");
  };

  const handleChapterChange = (value: string) => {
    setChapterInput(value);
    setVerseDirty(false);
    setStartVerseInput("");
    setEndVerseInput("");
  };

  const handleStartVerseChange = (value: string) => {
    setStartVerseInput(value);
    setVerseDirty(false);
  };

  const handleEndVerseChange = (value: string) => {
    setEndVerseInput(value);
    setVerseDirty(false);
  };

  const handleVerseChange = (value: string) => {
    setVerse(value);
    setVerseDirty(true);
  };

  const setFormFromNote = (note: ScriptureNote) => {
    setEditingId(note.id);
    setBook(note.book);
    setChapterInput(note.chapter ? String(note.chapter) : "");
    setStartVerseInput(note.startVerse ? String(note.startVerse) : "");
    setEndVerseInput(note.endVerse ? String(note.endVerse) : "");
    setVerse(note.verse);
    setVerseDirty(false);
    setAutoFillError(null);
    setAutoFillLoading(false);
    setIsCreating(true);
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setBook("");
    setChapterInput("");
    setStartVerseInput("");
    setEndVerseInput("");
    setVerse("");
    setVerseDirty(false);
    setAutoFillError(null);
    setAutoFillLoading(false);
  };

  return {
    isCreating,
    editingId,
    book,
    chapterInput,
    startVerseInput,
    endVerseInput,
    verse,
    chapterOptions,
    canSelectChapter: Boolean(selectedBook),
    autoFillLoading,
    autoFillError,
    bookRef,
    startCreate,
    handleBookChange,
    handleChapterChange,
    handleStartVerseChange,
    handleEndVerseChange,
    handleVerseChange,
    setFormFromNote,
    resetForm,
  };
}
