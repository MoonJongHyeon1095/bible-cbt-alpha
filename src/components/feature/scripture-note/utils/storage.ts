import type { ScriptureNote, ScriptureNoteReflection } from "../types/scriptureNotes.types";

const STORAGE_KEY = "scripture_notes";

const normalizeLocalNotes = (rawNotes: unknown[]): ScriptureNote[] => {
  return rawNotes.map((note) => {
    const rawNote = note as {
      id?: string;
      book?: string;
      chapter?: number | string | null;
      startVerse?: number | string | null;
      endVerse?: number | string | null;
      verse?: string;
      timestamp?: string;
      reflections?: ScriptureNoteReflection[];
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
    const normalizedReflections = [...existingReflections];

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
        : null;
    const rawEndVerse =
      typeof rawNote.endVerse === "number"
        ? rawNote.endVerse
        : typeof rawNote.endVerse === "string"
        ? Number.parseInt(rawNote.endVerse, 10)
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

export const loadLocalScriptureNotes = (): ScriptureNote[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    const normalized = Array.isArray(parsed) ? normalizeLocalNotes(parsed) : [];
    if (saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    }
    return normalized;
  } catch (error) {
    console.error("말씀 노트 로드 실패:", error);
    return [];
  }
};

export const saveLocalScriptureNotes = (notes: ScriptureNote[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
};
