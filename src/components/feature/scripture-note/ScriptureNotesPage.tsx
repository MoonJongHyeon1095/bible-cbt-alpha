import type { User } from "@supabase/supabase-js";
import {
  BookMarked,
  ChevronDown,
  ChevronRight,
  Edit2,
  NotebookPen,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  BIBLE_BOOKS,
  getBibleBookByKorean,
} from "../../../constants/bibleBooks";
import {
  fetchGetBibleChapter,
  fetchGetBibleVerses,
  type BibleVerseEntry,
} from "../../../lib/getBible";
import { supabase } from "../../../lib/supabase/client";
import { formatScriptureReference } from "../../../utils/scripture";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Textarea } from "../../ui/textarea";
import { FeatureHeader } from "../common/FeatureHeader";

interface ScriptureNote {
  id: string;
  book: string;
  chapter: number | null;
  startVerse: number | null;
  endVerse: number | null;
  verse: string;
  timestamp: string;
  reflections: ScriptureNoteReflection[];
}

interface ScriptureNoteReflection {
  id: string;
  content: string;
  timestamp: string;
}

interface ScriptureNotesPageProps {
  user: User | null;
}

export function ScriptureNotesPage({ user }: ScriptureNotesPageProps) {
  const scriptureFont = {
    fontFamily:
      '"Nanum Myeongjo", "Noto Serif KR", "Apple SD Gothic Neo", serif',
  };
  const [notes, setNotes] = useState<ScriptureNote[]>([]);
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
  const [chapterPreview, setChapterPreview] = useState<{
    noteId: string;
    book: string;
    chapter: number;
    startVerse: number | null;
    endVerse: number | null;
    verses: BibleVerseEntry[];
  } | null>(null);
  const [chapterPreviewLoading, setChapterPreviewLoading] = useState(false);
  const [chapterPreviewError, setChapterPreviewError] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [reflectionDrafts, setReflectionDrafts] = useState<
    Record<string, string>
  >({});
  const [editingReflectionNoteId, setEditingReflectionNoteId] = useState<
    string | null
  >(null);
  const [editingReflectionId, setEditingReflectionId] = useState<string | null>(
    null
  );
  const [editingReflectionContent, setEditingReflectionContent] = useState("");
  const [expandedReflections, setExpandedReflections] = useState<
    Record<string, boolean>
  >({});
  const bookRef = useRef<HTMLButtonElement | null>(null);
  const autoFillRequestId = useRef(0);
  const chapterRequestId = useRef(0);
  const selectedBook = getBibleBookByKorean(book);
  const chapterOptions = selectedBook
    ? Array.from({ length: selectedBook.chapters }, (_, idx) => String(idx + 1))
    : [];

  const formatReflectionTitle = (content: string) => {
    const trimmed = content.trim();
    if (trimmed.length <= 20) return trimmed;
    return `${trimmed.slice(0, 20)}…`;
  };

  useEffect(() => {
    loadNotes();
  }, [user]);

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

    fetchGetBibleVerses({
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

  const normalizeLocalNotes = (rawNotes: unknown[]): ScriptureNote[] => {
    return rawNotes.map((note) => {
      const rawNote = note as {
        id?: string;
        book?: string;
        chapter?: number | string | null;
        startVerse?: number | string | null;
        endVerse?: number | string | null;
        start_verse?: number | string | null;
        end_verse?: number | string | null;
        verse?: string;
        timestamp?: string;
        reflections?: ScriptureNoteReflection[];
        reflection?: string;
      };
      const safeTimestamp =
        typeof rawNote.timestamp === "string" && rawNote.timestamp
          ? rawNote.timestamp
          : new Date().toISOString();
      const existingReflections = Array.isArray(rawNote.reflections)
        ? rawNote.reflections.map((reflection) => ({
            id: String(reflection.id ?? Date.now().toString()),
            content: reflection.content ?? "",
            timestamp: reflection.timestamp ?? safeTimestamp,
          }))
        : [];
      const legacyReflection =
        typeof rawNote.reflection === "string" ? rawNote.reflection.trim() : "";
      const normalizedReflections = [...existingReflections];

      if (legacyReflection) {
        normalizedReflections.unshift({
          id: `legacy-${rawNote.id ?? Date.now().toString()}`,
          content: legacyReflection,
          timestamp: safeTimestamp,
        });
      }

      const parsedChapter =
        typeof rawNote.chapter === "number"
          ? rawNote.chapter
          : typeof rawNote.chapter === "string"
          ? Number.parseInt(rawNote.chapter, 10)
          : null;
      const rawStartVerse =
        typeof rawNote.startVerse === "number"
          ? rawNote.startVerse
          : typeof rawNote.startVerse === "string"
          ? Number.parseInt(rawNote.startVerse, 10)
          : typeof rawNote.start_verse === "number"
          ? rawNote.start_verse
          : typeof rawNote.start_verse === "string"
          ? Number.parseInt(rawNote.start_verse, 10)
          : null;
      const rawEndVerse =
        typeof rawNote.endVerse === "number"
          ? rawNote.endVerse
          : typeof rawNote.endVerse === "string"
          ? Number.parseInt(rawNote.endVerse, 10)
          : typeof rawNote.end_verse === "number"
          ? rawNote.end_verse
          : typeof rawNote.end_verse === "string"
          ? Number.parseInt(rawNote.end_verse, 10)
          : null;
      const resolvedStartVerse =
        Number.isFinite(rawStartVerse ?? NaN) && rawStartVerse !== null
          ? rawStartVerse
          : null;
      const resolvedEndVerse =
        Number.isFinite(rawEndVerse ?? NaN) && rawEndVerse !== null
          ? rawEndVerse
          : resolvedStartVerse ?? null;

      return {
        id: rawNote.id ? String(rawNote.id) : Date.now().toString(),
        book: rawNote.book?.trim() || "",
        chapter:
          Number.isFinite(parsedChapter ?? NaN) && parsedChapter !== null
            ? parsedChapter
            : null,
        startVerse: resolvedStartVerse,
        endVerse: resolvedEndVerse,
        verse: rawNote.verse ?? "",
        timestamp: safeTimestamp,
        reflections: normalizedReflections,
      };
    });
  };

  const loadNotes = async () => {
    setLoading(true);

    // 로그인 상태: Supabase에서 로드
    if (user) {
      try {
        const { data, error } = await supabase
          .from("scripture_notes")
          .select(
            "id, book, chapter, start_verse, end_verse, verse, created_at, reflections:scripture_note_reflections ( id, content, created_at )"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const mapped =
          data?.map((row) => ({
            id: String(row.id),
            book: row.book ?? "",
            chapter: row.chapter ?? null,
            startVerse: row.start_verse ?? null,
            endVerse: row.end_verse ?? null,
            verse: row.verse ?? "",
            timestamp: row.created_at ?? "",
            reflections:
              row.reflections
                ?.map((reflection) => ({
                  id: String(reflection.id),
                  content: reflection.content ?? "",
                  timestamp: reflection.created_at ?? "",
                }))
                .sort(
                  (a, b) =>
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime()
                ) ?? [],
          })) ?? [];

        setNotes(mapped);
        return;
      } catch (e) {
        console.error("말씀 노트 로드 실패:", e);
        toast.error("말씀 노트를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }

    // 비로그인: 로컬 저장소
    try {
      const saved = localStorage.getItem("scripture_notes");
      const parsed = saved ? JSON.parse(saved) : [];
      const normalized = Array.isArray(parsed)
        ? normalizeLocalNotes(parsed)
        : [];
      setNotes(normalized);
      if (saved) {
        localStorage.setItem("scripture_notes", JSON.stringify(normalized));
      }
    } catch (e) {
      console.error("말씀 노트 로드 실패:", e);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const saveNotesLocally = (updatedNotes: ScriptureNote[]) => {
    localStorage.setItem("scripture_notes", JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  const handleCreate = async () => {
    const safeBook = book.trim();
    const parsedChapter = Number.parseInt(chapterInput.trim(), 10);
    const safeChapter = Number.isFinite(parsedChapter) ? parsedChapter : null;
    const parsedStartVerse = Number.parseInt(startVerseInput.trim(), 10);
    const parsedEndVerse = Number.parseInt(endVerseInput.trim(), 10);
    const safeStartVerse = Number.isFinite(parsedStartVerse)
      ? parsedStartVerse
      : null;
    const safeEndVerse = Number.isFinite(parsedEndVerse)
      ? parsedEndVerse
      : safeStartVerse;

    if (!safeBook || !safeChapter || !safeStartVerse || !verse.trim()) {
      toast.error("성경 구절(책, 장, 절)과 말씀을 입력해주세요.");
      return;
    }
    if (safeStartVerse && safeEndVerse && safeEndVerse < safeStartVerse) {
      toast.error("끝 절은 시작 절보다 클 수 없습니다.");
      return;
    }
    if (autoFillError) {
      toast.error(autoFillError);
      return;
    }

    // 로그인 상태: Supabase에 저장
    if (user) {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("scripture_notes")
          .insert({
            user_id: user.id,
            book: safeBook,
            chapter: safeChapter,
            start_verse: safeStartVerse,
            end_verse: safeEndVerse,
            verse: verse.trim(),
          })
          .select(
            "id, book, chapter, start_verse, end_verse, verse, created_at"
          )
          .single();

        if (error) throw error;
        if (data) {
          const newNote: ScriptureNote = {
            id: String(data.id),
            book: data.book ?? safeBook,
            chapter: data.chapter ?? safeChapter,
            startVerse: data.start_verse ?? safeStartVerse,
            endVerse: data.end_verse ?? safeEndVerse,
            verse: data.verse ?? "",
            timestamp: data.created_at ?? new Date().toISOString(),
            reflections: [],
          };
          setNotes((prev) => [newNote, ...prev]);
        }
      } catch (e) {
        console.error("말씀 노트 저장 실패:", e);
        toast.error("말씀 노트를 저장하지 못했습니다.");
        return;
      } finally {
        setLoading(false);
        resetForm();
      }
      return;
    }

    const newNote: ScriptureNote = {
      id: Date.now().toString(),
      book: safeBook,
      chapter: safeChapter,
      startVerse: safeStartVerse,
      endVerse: safeEndVerse,
      verse: verse.trim(),
      timestamp: new Date().toISOString(),
      reflections: [],
    };

    const updated = [newNote, ...notes];
    saveNotesLocally(updated);
    resetForm();
  };

  const handleUpdate = async (id: string) => {
    const safeBook = book.trim();
    const parsedChapter = Number.parseInt(chapterInput.trim(), 10);
    const safeChapter = Number.isFinite(parsedChapter) ? parsedChapter : null;
    const parsedStartVerse = Number.parseInt(startVerseInput.trim(), 10);
    const parsedEndVerse = Number.parseInt(endVerseInput.trim(), 10);
    const safeStartVerse = Number.isFinite(parsedStartVerse)
      ? parsedStartVerse
      : null;
    const safeEndVerse = Number.isFinite(parsedEndVerse)
      ? parsedEndVerse
      : safeStartVerse;

    if (!safeBook || !safeChapter || !safeStartVerse || !verse.trim()) {
      toast.error("성경 구절(책, 장, 절)과 말씀을 입력해주세요.");
      return;
    }
    if (safeStartVerse && safeEndVerse && safeEndVerse < safeStartVerse) {
      toast.error("끝 절은 시작 절보다 클 수 없습니다.");
      return;
    }
    if (autoFillError) {
      toast.error(autoFillError);
      return;
    }

    // 로그인 상태: Supabase 업데이트
    if (user) {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("scripture_notes")
          .update({
            book: safeBook,
            chapter: safeChapter,
            start_verse: safeStartVerse,
            end_verse: safeEndVerse,
            verse: verse.trim(),
          })
          .eq("id", id)
          .eq("user_id", user.id)
          .select(
            "id, book, chapter, start_verse, end_verse, verse, created_at"
          )
          .single();

        if (error) throw error;
        if (data) {
          const updated = notes.map((note) =>
            note.id === id
              ? {
                  id: String(data.id),
                  book: data.book ?? safeBook,
                  chapter: data.chapter ?? safeChapter,
                  startVerse: data.start_verse ?? safeStartVerse,
                  endVerse: data.end_verse ?? safeEndVerse,
                  verse: data.verse ?? "",
                  timestamp: data.created_at ?? note.timestamp,
                  reflections: note.reflections ?? [],
                }
              : note
          );
          setNotes(updated);
        }
      } catch (e) {
        console.error("말씀 노트 수정 실패:", e);
        toast.error("말씀 노트를 수정하지 못했습니다.");
        return;
      } finally {
        setLoading(false);
        resetForm();
      }
      return;
    }

    const updated = notes.map((note) =>
      note.id === id
        ? {
            ...note,
            book: safeBook,
            chapter: safeChapter,
            startVerse: safeStartVerse,
            endVerse: safeEndVerse,
            verse: verse.trim(),
          }
        : note
    );

    saveNotesLocally(updated);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (user) {
      try {
        setLoading(true);
        const { error } = await supabase
          .from("scripture_notes")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);
        if (error) throw error;
      } catch (e) {
        console.error("말씀 노트 삭제 실패:", e);
        toast.error("말씀 노트를 삭제하지 못했습니다.");
        return;
      } finally {
        setLoading(false);
      }
    }

    const updated = notes.filter((note) => note.id !== id);
    if (user) {
      setNotes(updated);
    } else {
      saveNotesLocally(updated);
    }
    toast.success("말씀 노트를 삭제했습니다.");
  };

  const handleEdit = (note: ScriptureNote) => {
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

  const handleOpenChapterPreview = async (note: ScriptureNote) => {
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
      const verses = await fetchGetBibleChapter({
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

  const resetReflectionEdit = () => {
    setEditingReflectionNoteId(null);
    setEditingReflectionId(null);
    setEditingReflectionContent("");
  };

  const handleCreateReflection = async (noteId: string) => {
    const content = (reflectionDrafts[noteId] ?? "").trim();
    if (!content) {
      toast.error("묵상을 입력해주세요.");
      return;
    }

    if (user) {
      try {
        const noteIdValue = Number(noteId);
        if (!Number.isFinite(noteIdValue)) {
          toast.error("묵상을 저장할 수 없습니다.");
          return;
        }

        const { data, error } = await supabase
          .from("scripture_note_reflections")
          .insert({
            user_id: user.id,
            scripture_note_id: noteIdValue,
            content,
          })
          .select("id, content, created_at")
          .single();

        if (error) throw error;
        if (data) {
          const newReflection: ScriptureNoteReflection = {
            id: String(data.id),
            content: data.content ?? "",
            timestamp: data.created_at ?? new Date().toISOString(),
          };
          setNotes((prev) =>
            prev.map((note) =>
              note.id === noteId
                ? {
                    ...note,
                    reflections: [newReflection, ...note.reflections],
                  }
                : note
            )
          );
        }
      } catch (e) {
        console.error("묵상 저장 실패:", e);
        toast.error("묵상을 저장하지 못했습니다.");
        return;
      }
    } else {
      const newReflection: ScriptureNoteReflection = {
        id: Date.now().toString(),
        content,
        timestamp: new Date().toISOString(),
      };
      const updated = notes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              reflections: [newReflection, ...note.reflections],
            }
          : note
      );
      saveNotesLocally(updated);
    }

    setReflectionDrafts((prev) => ({ ...prev, [noteId]: "" }));
  };

  const handleUpdateReflection = async (
    noteId: string,
    reflectionId: string
  ) => {
    const content = editingReflectionContent.trim();
    if (!content) {
      toast.error("묵상을 입력해주세요.");
      return;
    }

    if (user) {
      try {
        const { data, error } = await supabase
          .from("scripture_note_reflections")
          .update({ content })
          .eq("id", reflectionId)
          .eq("user_id", user.id)
          .select("id, content, created_at")
          .single();

        if (error) throw error;
        if (data) {
          setNotes((prev) =>
            prev.map((note) =>
              note.id === noteId
                ? {
                    ...note,
                    reflections: note.reflections.map((reflection) =>
                      reflection.id === reflectionId
                        ? {
                            ...reflection,
                            content: data.content ?? "",
                            timestamp: data.created_at ?? reflection.timestamp,
                          }
                        : reflection
                    ),
                  }
                : note
            )
          );
        }
      } catch (e) {
        console.error("묵상 수정 실패:", e);
        toast.error("묵상을 수정하지 못했습니다.");
        return;
      }
    } else {
      const updated = notes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              reflections: note.reflections.map((reflection) =>
                reflection.id === reflectionId
                  ? { ...reflection, content }
                  : reflection
              ),
            }
          : note
      );
      saveNotesLocally(updated);
    }

    resetReflectionEdit();
  };

  const handleDeleteReflection = async (
    noteId: string,
    reflectionId: string
  ) => {
    if (user) {
      try {
        const { error } = await supabase
          .from("scripture_note_reflections")
          .delete()
          .eq("id", reflectionId)
          .eq("user_id", user.id);

        if (error) throw error;
      } catch (e) {
        console.error("묵상 삭제 실패:", e);
        toast.error("묵상을 삭제하지 못했습니다.");
        return;
      }
    }

    const updated = notes.map((note) =>
      note.id === noteId
        ? {
            ...note,
            reflections: note.reflections.filter(
              (reflection) => reflection.id !== reflectionId
            ),
          }
        : note
    );

    if (user) {
      setNotes(updated);
    } else {
      saveNotesLocally(updated);
    }

    if (editingReflectionId === reflectionId) {
      resetReflectionEdit();
    }
    toast.success("묵상을 삭제했습니다.");
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/70 via-white to-emerald-50/40">
      <div className="max-w-[960px] mx-auto px-6 sm:px-8 py-10">
        <FeatureHeader
          overline="Scripture Notes"
          title="말씀 노트"
          subtitle="말씀과 묵상을 한 권의 책처럼 기록하세요."
          icon={BookMarked}
          iconClassName="text-emerald-600"
          action={
            !isCreating ? (
              <Button
                onClick={() => setIsCreating(true)}
                className="bg-emerald-700 hover:bg-emerald-800 shadow-md shadow-emerald-900/10"
              >
                <Plus className="size-5 mr-2" />새 말씀 노트
              </Button>
            ) : null
          }
        />
        {/* 작성/수정 폼 */}
        {isCreating && (
          <Card className="p-8 mb-8 bg-white/90 border border-emerald-100 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.45)]">
            <h3 className="text-lg text-slate-900 mb-5">
              {editingId ? "말씀 노트 수정" : "새 말씀 노트 작성"}
            </h3>
            <div className="space-y-5">
              <div>
                <label className="text-sm text-slate-700 mb-2 flex items-center">
                  성경 구절
                  {(autoFillLoading || autoFillError) && (
                    <span
                      className={`ml-2 text-[13px] font-medium ${
                        autoFillError ? "text-rose-600" : "text-emerald-600"
                      }`}
                    >
                      {autoFillLoading
                        ? "말씀을 불러오고 있습니다..."
                        : autoFillError}
                    </span>
                  )}
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.4fr_0.8fr_1fr]">
                  <Select
                    value={book}
                    onValueChange={(value: string) => {
                      setBook(value);
                      setVerseDirty(false);
                      setChapterInput("");
                      setStartVerseInput("");
                      setEndVerseInput("");
                    }}
                  >
                    <SelectTrigger
                      ref={bookRef}
                      className="border-emerald-200 bg-emerald-50/40 focus-visible:ring-emerald-200"
                    >
                      <SelectValue placeholder="책 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {BIBLE_BOOKS.map((bookItem) => (
                        <SelectItem
                          key={bookItem.number}
                          value={bookItem.korean}
                        >
                          {bookItem.korean}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={chapterInput}
                    onValueChange={(value: string) => {
                      setChapterInput(value);
                      setVerseDirty(false);
                      setStartVerseInput("");
                      setEndVerseInput("");
                    }}
                    disabled={!selectedBook}
                  >
                    <SelectTrigger className="border-emerald-200 bg-emerald-50/40 focus-visible:ring-emerald-200">
                      <SelectValue placeholder="장 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {chapterOptions.map((chapter) => (
                        <SelectItem key={chapter} value={chapter}>
                          {chapter}장
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={startVerseInput}
                      onChange={(e) => {
                        setStartVerseInput(e.target.value);
                        setVerseDirty(false);
                      }}
                      placeholder="시작 절"
                      className="border-emerald-200 bg-emerald-50/40 focus-visible:ring-emerald-200"
                    />
                    <span className="text-slate-500">~</span>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={endVerseInput}
                      onChange={(e) => {
                        setEndVerseInput(e.target.value);
                        setVerseDirty(false);
                      }}
                      placeholder="끝 절"
                      className="border-emerald-200 bg-emerald-50/40 focus-visible:ring-emerald-200"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-700 mb-2 block">
                  말씀 본문 (개역한글)
                </label>
                <Textarea
                  value={verse}
                  onChange={(e) => {
                    setVerse(e.target.value);
                    setVerseDirty(true);
                  }}
                  placeholder="성경 말씀 본문을 입력하세요..."
                  className="min-h-[160px] border-emerald-200 bg-emerald-50/40 focus-visible:ring-emerald-200"
                  style={scriptureFont}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    editingId ? handleUpdate(editingId) : handleCreate()
                  }
                  disabled={
                    loading || autoFillLoading || Boolean(autoFillError)
                  }
                  className="bg-emerald-700 hover:bg-emerald-800"
                >
                  <Save className="size-4 mr-2" />
                  {editingId ? "수정 완료" : "저장"}
                </Button>
                <Button onClick={resetForm} variant="outline">
                  <X className="size-4 mr-2" />
                  취소
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* 노트 목록 */}
        {loading ? (
          <Card className="p-12 text-center bg-white/80 border border-emerald-100">
            <BookMarked className="size-16 text-emerald-200 mx-auto mb-4 animate-pulse" />
            <p className="text-slate-500 text-lg mb-2">
              말씀 노트를 불러오는 중입니다...
            </p>
          </Card>
        ) : notes.length === 0 ? (
          <Card className="p-12 text-center bg-white/80 border border-emerald-100">
            <BookMarked className="size-16 text-emerald-200 mx-auto mb-4" />
            <p className="text-slate-500 text-lg mb-2">
              아직 말씀 노트가 없습니다.
            </p>
            <p className="text-slate-400">첫 번째 말씀 노트를 작성해보세요.</p>
          </Card>
      ) : (
        <div className="space-y-8">
          {notes.map((note) => {
            const reflections = [...note.reflections].sort(
              (a, b) =>
                  new Date(b.timestamp).getTime() -
                  new Date(a.timestamp).getTime()
              );

              return (
                <Card
                  key={note.id}
                  className="p-8 hover:shadow-[0_24px_60px_-42px_rgba(15,23,42,0.6)] transition-shadow bg-white/95 border border-emerald-100"
                >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
                  <div className="flex-1">
                    <div className="text-xs uppercase tracking-[0.2em] text-emerald-600/70 mb-2">
                      Reference
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className="text-2xl sm:text-3xl text-emerald-900 leading-tight"
                        style={scriptureFont}
                      >
                        {formatScriptureReference(
                          note.book,
                          note.chapter,
                          note.startVerse,
                          note.endVerse
                        )}
                      </h3>
                      <button
                        onClick={() => handleOpenChapterPreview(note)}
                        className="text-slate-500 hover:text-emerald-700 p-1 disabled:opacity-50"
                        title="장 보기"
                        disabled={
                          chapterPreviewLoading &&
                          chapterPreview?.noteId === note.id
                        }
                      >
                        <Search className="size-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(note)}
                      className="text-emerald-600 hover:text-emerald-700 p-1"
                      title="수정"
                    >
                        <Edit2 className="size-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="삭제"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-emerald-50/70 border-l-2 border-emerald-400 p-5 rounded-r-2xl mb-6">
                    <p
                      className="text-[15px] sm:text-base text-slate-700 leading-7 sm:leading-8 whitespace-pre-wrap"
                      style={scriptureFont}
                    >
                      "{note.verse}"
                    </p>
                  </div>

                  <div className="bg-white border border-slate-100 p-5 rounded-2xl mb-6">
                    <p className="text-sm text-slate-600 mb-4 flex items-center gap-2">
                      <NotebookPen className="size-4 text-emerald-600" />
                      묵상 기록
                    </p>
                    {reflections.length === 0 ? (
                      <p className="text-sm text-slate-400">
                        아직 묵상이 없습니다.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {reflections.map((reflection) => {
                          const isEditing =
                            editingReflectionNoteId === note.id &&
                            editingReflectionId === reflection.id;
                          const reflectionKey = `${note.id}-${reflection.id}`;
                          const isExpanded = Boolean(
                            expandedReflections[reflectionKey]
                          );

                          return (
                            <div
                              key={reflection.id}
                              className="rounded-2xl border border-slate-100 bg-emerald-50/30 p-4"
                            >
                              {isEditing ? (
                                <div className="space-y-2">
                                  <Textarea
                                    value={editingReflectionContent}
                                    onChange={(e) =>
                                      setEditingReflectionContent(
                                        e.target.value
                                      )
                                    }
                                    className="min-h-[120px] border-slate-200"
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() =>
                                        handleUpdateReflection(
                                          note.id,
                                          reflection.id
                                        )
                                      }
                                      className="bg-amber-600 hover:bg-amber-700"
                                    >
                                      <Save className="size-4 mr-2" />
                                      수정 완료
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={resetReflectionEdit}
                                    >
                                      <X className="size-4 mr-2" />
                                      취소
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="flex items-start justify-between gap-3">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setExpandedReflections((prev) => ({
                                          ...prev,
                                          [reflectionKey]: !isExpanded,
                                        }))
                                      }
                                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                                      title={
                                        isExpanded ? "묵상 접기" : "묵상 펼치기"
                                      }
                                    >
                                      {isExpanded ? (
                                        <ChevronDown className="size-4 text-slate-400" />
                                      ) : (
                                        <ChevronRight className="size-4 text-slate-400" />
                                      )}
                                      <span className="min-w-0 flex-1 text-sm text-slate-500">
                                        {formatReflectionTitle(
                                          reflection.content
                                        )}
                                      </span>
                                    </button>
                                    <div className="flex shrink-0 items-center gap-1">
                                      <button
                                        onClick={() => {
                                          setEditingReflectionNoteId(note.id);
                                          setEditingReflectionId(reflection.id);
                                          setEditingReflectionContent(
                                            reflection.content
                                          );
                                        }}
                                        className="text-amber-600 hover:text-amber-700 p-1"
                                        title="묵상 수정"
                                      >
                                        <Edit2 className="size-4" />
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteReflection(
                                            note.id,
                                            reflection.id
                                          )
                                        }
                                        className="text-red-600 hover:text-red-700 p-1"
                                        title="묵상 삭제"
                                      >
                                        <Trash2 className="size-4" />
                                      </button>
                                    </div>
                                  </div>
                                  {isExpanded && (
                                    <p
                                      className="mt-3 text-[15px] sm:text-base text-slate-700 leading-7 whitespace-pre-wrap break-words"
                                      style={scriptureFont}
                                    >
                                      {reflection.content}
                                    </p>
                                  )}
                                  <p className="text-xs text-slate-400 mt-3">
                                    {formatDate(reflection.timestamp)}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="mt-5 space-y-3">
                      <Textarea
                        value={reflectionDrafts[note.id] ?? ""}
                        onChange={(e) =>
                          setReflectionDrafts((prev) => ({
                            ...prev,
                            [note.id]: e.target.value,
                          }))
                        }
                        placeholder="묵상을 기록하세요..."
                        className="min-h-[140px] border-slate-200"
                        style={scriptureFont}
                      />
                      <Button
                        onClick={() => handleCreateReflection(note.id)}
                        className="bg-emerald-700 hover:bg-emerald-800"
                      >
                        <Plus className="size-4 mr-2" />
                        묵상 추가
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400">
                    {formatDate(note.timestamp)}
                  </p>
                </Card>
              );
          })}
        </div>
      )}
      <Dialog
        open={Boolean(chapterPreview)}
        onOpenChange={(open) => {
          if (!open) {
            setChapterPreview(null);
            setChapterPreviewError(null);
            setChapterPreviewLoading(false);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {chapterPreview
                ? `${chapterPreview.book} ${chapterPreview.chapter}장`
                : "말씀"}
            </DialogTitle>
          </DialogHeader>
          {chapterPreviewLoading && (
            <p className="text-sm text-slate-500">
              말씀을 불러오고 있습니다...
            </p>
          )}
          {chapterPreviewError && (
            <p className="text-sm text-rose-600">{chapterPreviewError}</p>
          )}
          {!chapterPreviewLoading &&
            !chapterPreviewError &&
            chapterPreview && (
              <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-2">
                {chapterPreview.verses.map((verseEntry) => {
                  const start = chapterPreview.startVerse;
                  const end =
                    chapterPreview.endVerse ?? chapterPreview.startVerse;
                  const isHighlighted =
                    start !== null &&
                    end !== null &&
                    verseEntry.verse >= start &&
                    verseEntry.verse <= end;
                  return (
                    <div
                      key={`${chapterPreview.noteId}-${verseEntry.verse}`}
                      className={`flex items-baseline gap-3 rounded-lg px-3 py-2 ${
                        isHighlighted
                          ? "bg-amber-100/70 text-amber-900"
                          : "bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span className="text-xs font-semibold text-slate-500 tabular-nums">
                        {verseEntry.verse}
                      </span>
                      <p className="text-sm leading-relaxed" style={scriptureFont}>
                        {verseEntry.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
