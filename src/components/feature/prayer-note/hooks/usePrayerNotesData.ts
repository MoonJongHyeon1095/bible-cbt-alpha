import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { PrayerNote } from "../types/prayerNotes.types";
import {
  createPrayerNote,
  deletePrayerNote,
  fetchPrayerNotes,
  updatePrayerNote,
} from "../utils/api";
import {
  loadLocalPrayerNotes,
  saveLocalPrayerNotes,
} from "../utils/storage";

interface UsePrayerNotesDataParams {
  user: User | null;
}

export interface PrayerNotePayload {
  title: string;
  content: string;
  tags: string[];
  emotionNoteId?: string | null;
  book: string;
  chapter: number | null;
  startVerse: number | null;
  endVerse: number | null;
}

export function usePrayerNotesData({ user }: UsePrayerNotesDataParams) {
  const [notes, setNotes] = useState<PrayerNote[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadNotes = async () => {
      setLoading(true);

      if (user) {
        try {
          const fetched = await fetchPrayerNotes(user.id);
          setNotes(fetched);
          return;
        } catch (error) {
          console.error("기도 노트 로드 실패:", error);
          toast.error("기도 노트를 불러오지 못했습니다.");
        } finally {
          setLoading(false);
        }
      }

      const normalized = loadLocalPrayerNotes();
      setNotes(normalized);
      setLoading(false);
    };

    loadNotes();
  }, [user]);

  const saveNotesLocally = (updatedNotes: PrayerNote[]) => {
    saveLocalPrayerNotes(updatedNotes);
    setNotes(updatedNotes);
  };

  const createNote = async (payload: PrayerNotePayload) => {
    if (user) {
      const newNote = await createPrayerNote(user.id, payload);
      setNotes((prev) => [newNote, ...prev]);
      return;
    }

    const newNote: PrayerNote = {
      id: Date.now().toString(),
      title: payload.title,
      content: payload.content,
      tags: payload.tags,
      emotionNoteId: payload.emotionNoteId ?? null,
      book: payload.book,
      chapter: payload.chapter,
      startVerse: payload.startVerse,
      endVerse: payload.endVerse,
      timestamp: new Date().toISOString(),
      responses: [],
    };

    const updated = [newNote, ...notes];
    saveNotesLocally(updated);
  };

  const updateNote = async (noteId: string, payload: PrayerNotePayload) => {
    if (user) {
      const updatedNote = await updatePrayerNote(user.id, noteId, payload);
      const updated = notes.map((note) =>
        note.id === noteId
          ? {
              ...updatedNote,
              timestamp: updatedNote.timestamp || note.timestamp,
              responses: note.responses ?? [],
            }
          : note
      );
      setNotes(updated);
      return;
    }

    const updated = notes.map((note) =>
      note.id === noteId
        ? {
            ...note,
            title: payload.title,
            content: payload.content,
            tags: payload.tags,
            emotionNoteId: payload.emotionNoteId ?? note.emotionNoteId ?? null,
            book: payload.book,
            chapter: payload.chapter,
            startVerse: payload.startVerse,
            endVerse: payload.endVerse,
          }
        : note
    );

    saveNotesLocally(updated);
  };

  const deleteNote = async (noteId: string) => {
    if (user) {
      await deletePrayerNote(user.id, noteId);
    }

    const updated = notes.filter((note) => note.id !== noteId);
    if (user) {
      setNotes(updated);
    } else {
      saveNotesLocally(updated);
    }
  };

  return {
    notes,
    loading,
    setNotes,
    saveNotesLocally,
    createNote,
    updateNote,
    deleteNote,
  };
}
