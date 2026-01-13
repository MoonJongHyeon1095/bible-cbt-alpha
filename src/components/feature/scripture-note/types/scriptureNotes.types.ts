import type { BibleVerseEntry } from "../../../../lib/getBible";

export interface ScriptureNoteReflection {
  id: string;
  content: string;
  timestamp: string;
}

export interface ScriptureNote {
  id: string;
  book: string;
  chapter: number | null;
  startVerse: number | null;
  endVerse: number | null;
  verse: string;
  timestamp: string;
  reflections: ScriptureNoteReflection[];
}

export interface ChapterPreviewState {
  noteId: string;
  book: string;
  chapter: number;
  startVerse: number | null;
  endVerse: number | null;
  verses: BibleVerseEntry[];
}
