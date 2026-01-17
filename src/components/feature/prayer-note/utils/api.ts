import type { BibleVerseEntry } from "../../../../lib/getBible";
import {
  fetchGetBibleChapter,
  fetchGetBibleVerses,
} from "../../../../lib/getBible";
import { supabase } from "../../../../lib/supabase/client";
import type { PrayerNote, PrayerNoteResponse } from "../types/prayerNotes.types";

interface PrayerNotePayload {
  title: string;
  content: string;
  tags: string[];
  emotionNoteId?: string | null;
  book: string;
  chapter: number | null;
  startVerse: number | null;
  endVerse: number | null;
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

export async function fetchPrayerNotes(
  userId: string
): Promise<PrayerNote[]> {
  const { data, error } = await supabase
    .from("prayer_notes")
    .select(
      "id, title, content, tags, emotion_note_id, book, chapter, start_verse, end_verse, created_at, responses:prayer_note_responses ( id, content, created_at )"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (
    data?.map((row) => ({
      id: String(row.id),
      title: row.title ?? "",
      content: row.content ?? "",
      tags: Array.isArray(row.tags) ? row.tags : [],
      emotionNoteId: row.emotion_note_id ? String(row.emotion_note_id) : null,
      book: row.book ?? "",
      chapter: row.chapter ?? null,
      startVerse: row.start_verse ?? null,
      endVerse: row.end_verse ?? null,
      timestamp: row.created_at ?? "",
      responses:
        row.responses
          ?.map((response) => ({
            id: String(response.id),
            content: response.content ?? "",
            timestamp: response.created_at ?? "",
          }))
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() -
              new Date(a.timestamp).getTime()
          ) ?? [],
    })) ?? []
  );
}

export async function createPrayerNote(
  userId: string,
  payload: PrayerNotePayload
): Promise<PrayerNote> {
  const { data, error } = await supabase
    .from("prayer_notes")
    .insert({
      user_id: userId,
      title: payload.title,
      content: payload.content,
      tags: payload.tags,
      emotion_note_id: payload.emotionNoteId ?? null,
      book: payload.book,
      chapter: payload.chapter,
      start_verse: payload.startVerse,
      end_verse: payload.endVerse,
    })
    .select(
      "id, title, content, tags, emotion_note_id, book, chapter, start_verse, end_verse, created_at"
    )
    .single();

  if (error) throw error;

  return {
    id: String(data.id),
    title: data.title ?? payload.title,
    content: data.content ?? payload.content,
    tags: Array.isArray(data.tags) ? data.tags : payload.tags,
    emotionNoteId: data.emotion_note_id ? String(data.emotion_note_id) : null,
    book: data.book ?? payload.book,
    chapter: data.chapter ?? payload.chapter,
    startVerse: data.start_verse ?? payload.startVerse,
    endVerse: data.end_verse ?? payload.endVerse,
    timestamp: data.created_at ?? new Date().toISOString(),
    responses: [],
  };
}

export async function updatePrayerNote(
  userId: string,
  noteId: string,
  payload: PrayerNotePayload
): Promise<PrayerNote> {
  const { data, error } = await supabase
    .from("prayer_notes")
    .update({
      title: payload.title,
      content: payload.content,
      tags: payload.tags,
      emotion_note_id: payload.emotionNoteId ?? null,
      book: payload.book,
      chapter: payload.chapter,
      start_verse: payload.startVerse,
      end_verse: payload.endVerse,
    })
    .eq("id", noteId)
    .eq("user_id", userId)
    .select(
      "id, title, content, tags, emotion_note_id, book, chapter, start_verse, end_verse, created_at"
    )
    .single();

  if (error) throw error;

  return {
    id: String(data.id),
    title: data.title ?? payload.title,
    content: data.content ?? payload.content,
    tags: Array.isArray(data.tags) ? data.tags : payload.tags,
    emotionNoteId: data.emotion_note_id ? String(data.emotion_note_id) : null,
    book: data.book ?? payload.book,
    chapter: data.chapter ?? payload.chapter,
    startVerse: data.start_verse ?? payload.startVerse,
    endVerse: data.end_verse ?? payload.endVerse,
    timestamp: data.created_at ?? new Date().toISOString(),
    responses: [],
  };
}

export async function deletePrayerNote(
  userId: string,
  noteId: string
): Promise<void> {
  const { error } = await supabase
    .from("prayer_notes")
    .delete()
    .eq("id", noteId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function createPrayerNoteResponse(
  userId: string,
  noteId: number,
  content: string
): Promise<PrayerNoteResponse> {
  const { data, error } = await supabase
    .from("prayer_note_responses")
    .insert({
      user_id: userId,
      prayer_note_id: noteId,
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

export async function updatePrayerNoteResponse(
  userId: string,
  responseId: string,
  content: string
): Promise<PrayerNoteResponse> {
  const { data, error } = await supabase
    .from("prayer_note_responses")
    .update({ content })
    .eq("id", responseId)
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

export async function deletePrayerNoteResponse(
  userId: string,
  responseId: string
): Promise<void> {
  const { error } = await supabase
    .from("prayer_note_responses")
    .delete()
    .eq("id", responseId)
    .eq("user_id", userId);

  if (error) throw error;
}
