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
        return;
      }
      setNotes([]);
      setLoading(false);
    };

    loadNotes();
  }, [user]);

  const createNote = async (payload: PrayerNotePayload) => {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    const newNote = await createPrayerNote(user.id, payload);
    setNotes((prev) => [newNote, ...prev]);
  };

  const updateNote = async (noteId: string, payload: PrayerNotePayload) => {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

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
  };

  const deleteNote = async (noteId: string) => {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    await deletePrayerNote(user.id, noteId);

    const updated = notes.filter((note) => note.id !== noteId);
    setNotes(updated);
  };

  return {
    notes,
    loading,
    setNotes,
    createNote,
    updateNote,
    deleteNote,
  };
}
