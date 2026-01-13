import type { BibleVerseEntry } from "../../../../lib/getBible";
import {
  fetchGetBibleChapter,
  fetchGetBibleVerses,
} from "../../../../lib/getBible";
import { supabase } from "../../../../lib/supabase/client";
import type {
  ScriptureNote,
  ScriptureNoteReflection,
} from "../types/scriptureNotes.types";

interface ScriptureNotePayload {
  book: string;
  chapter: number | null;
  startVerse: number | null;
  endVerse: number | null;
  verse: string;
}

export async function fetchBibleVersesRange(params: {
  englishBook: string;
  chapter: number;
  startVerse: number;
  endVerse: number;
}): Promise<string[]> {
  return fetchGetBibleVerses(params);
}

export async function fetchBibleChapter(params: {
  bookNumber: number;
  chapter: number;
}): Promise<BibleVerseEntry[]> {
  return fetchGetBibleChapter(params);
}

export async function fetchScriptureNotes(
  userId: string
): Promise<ScriptureNote[]> {
  const { data, error } = await supabase
    .from("scripture_notes")
    .select(
      "id, book, chapter, start_verse, end_verse, verse, created_at, reflections:scripture_note_reflections ( id, content, created_at )"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (
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
    })) ?? []
  );
}

export async function createScriptureNote(
  userId: string,
  payload: ScriptureNotePayload
): Promise<ScriptureNote> {
  const { data, error } = await supabase
    .from("scripture_notes")
    .insert({
      user_id: userId,
      book: payload.book,
      chapter: payload.chapter,
      start_verse: payload.startVerse,
      end_verse: payload.endVerse,
      verse: payload.verse,
    })
    .select("id, book, chapter, start_verse, end_verse, verse, created_at")
    .single();

  if (error) throw error;

  return {
    id: String(data.id),
    book: data.book ?? payload.book,
    chapter: data.chapter ?? payload.chapter,
    startVerse: data.start_verse ?? payload.startVerse,
    endVerse: data.end_verse ?? payload.endVerse,
    verse: data.verse ?? "",
    timestamp: data.created_at ?? new Date().toISOString(),
    reflections: [],
  };
}

export async function updateScriptureNote(
  userId: string,
  noteId: string,
  payload: ScriptureNotePayload
): Promise<ScriptureNote> {
  const { data, error } = await supabase
    .from("scripture_notes")
    .update({
      book: payload.book,
      chapter: payload.chapter,
      start_verse: payload.startVerse,
      end_verse: payload.endVerse,
      verse: payload.verse,
    })
    .eq("id", noteId)
    .eq("user_id", userId)
    .select("id, book, chapter, start_verse, end_verse, verse, created_at")
    .single();

  if (error) throw error;

  return {
    id: String(data.id),
    book: data.book ?? payload.book,
    chapter: data.chapter ?? payload.chapter,
    startVerse: data.start_verse ?? payload.startVerse,
    endVerse: data.end_verse ?? payload.endVerse,
    verse: data.verse ?? "",
    timestamp: data.created_at ?? new Date().toISOString(),
    reflections: [],
  };
}

export async function deleteScriptureNote(
  userId: string,
  noteId: string
): Promise<void> {
  const { error } = await supabase
    .from("scripture_notes")
    .delete()
    .eq("id", noteId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function createScriptureNoteReflection(
  userId: string,
  noteId: number,
  content: string
): Promise<ScriptureNoteReflection> {
  const { data, error } = await supabase
    .from("scripture_note_reflections")
    .insert({
      user_id: userId,
      scripture_note_id: noteId,
      content,
    })
    .select("id, content, created_at")
    .single();

  if (error) throw error;

  return {
    id: String(data.id),
    content: data.content ?? "",
    timestamp: data.created_at ?? new Date().toISOString(),
  };
}

export async function updateScriptureNoteReflection(
  userId: string,
  reflectionId: string,
  content: string
): Promise<ScriptureNoteReflection> {
  const { data, error } = await supabase
    .from("scripture_note_reflections")
    .update({ content })
    .eq("id", reflectionId)
    .eq("user_id", userId)
    .select("id, content, created_at")
    .single();

  if (error) throw error;

  return {
    id: String(data.id),
    content: data.content ?? "",
    timestamp: data.created_at ?? new Date().toISOString(),
  };
}

export async function deleteScriptureNoteReflection(
  userId: string,
  reflectionId: string
): Promise<void> {
  const { error } = await supabase
    .from("scripture_note_reflections")
    .delete()
    .eq("id", reflectionId)
    .eq("user_id", userId);

  if (error) throw error;
}
