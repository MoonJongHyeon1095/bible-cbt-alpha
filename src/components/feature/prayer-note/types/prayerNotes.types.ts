import type { BibleVerseEntry } from "../../../../lib/getBible";

export interface PrayerNoteResponse {
  id: string;
  content: string;
  timestamp: string;
}

export interface PrayerNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  emotionNoteId?: string | null;
  book: string;
  chapter: number | null;
  startVerse: number | null;
  endVerse: number | null;
  timestamp: string;
  responses: PrayerNoteResponse[];
}

export interface ChapterPreviewState {
  noteId: string;
  book: string;
  chapter: number;
  startVerse: number | null;
  endVerse: number | null;
  verses: BibleVerseEntry[];
}
