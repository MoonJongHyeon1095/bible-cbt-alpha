import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { ScriptureNote } from "../types/scriptureNotes.types";
import {
  createScriptureNote,
  deleteScriptureNote,
  fetchScriptureNotes,
  updateScriptureNote,
} from "../utils/api";
import { loadLocalScriptureNotes, saveLocalScriptureNotes } from "../utils/storage";

interface UseScriptureNotesDataParams {
  user: User | null;
}

interface ScriptureNotePayload {
  book: string;
  chapter: number | null;
  startVerse: number | null;
  endVerse: number | null;
  verse: string;
}

export function useScriptureNotesData({ user }: UseScriptureNotesDataParams) {
  const [notes, setNotes] = useState<ScriptureNote[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadNotes = async () => {
      setLoading(true);

      if (user) {
        try {
          const fetched = await fetchScriptureNotes(user.id);
          setNotes(fetched);
          return;
        } catch (error) {
          console.error("말씀 노트 로드 실패:", error);
          toast.error("말씀 노트를 불러오지 못했습니다.");
        } finally {
          setLoading(false);
        }
      }

      const normalized = loadLocalScriptureNotes();
      setNotes(normalized);
      setLoading(false);
    };

    loadNotes();
  }, [user]);

  const saveNotesLocally = (updatedNotes: ScriptureNote[]) => {
    saveLocalScriptureNotes(updatedNotes);
    setNotes(updatedNotes);
  };

  const createNote = async (payload: ScriptureNotePayload) => {
    if (user) {
      const newNote = await createScriptureNote(user.id, payload);
      setNotes((prev) => [newNote, ...prev]);
      return;
    }

    const newNote: ScriptureNote = {
      id: Date.now().toString(),
      book: payload.book,
      chapter: payload.chapter,
      startVerse: payload.startVerse,
      endVerse: payload.endVerse,
      verse: payload.verse,
      timestamp: new Date().toISOString(),
      reflections: [],
    };

    const updated = [newNote, ...notes];
    saveNotesLocally(updated);
  };

  const updateNote = async (noteId: string, payload: ScriptureNotePayload) => {
    if (user) {
      const updatedNote = await updateScriptureNote(user.id, noteId, payload);
      const updated = notes.map((note) =>
        note.id === noteId
          ? {
              ...updatedNote,
              timestamp: updatedNote.timestamp || note.timestamp,
              reflections: note.reflections ?? [],
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
            book: payload.book,
            chapter: payload.chapter,
            startVerse: payload.startVerse,
            endVerse: payload.endVerse,
            verse: payload.verse,
          }
        : note
    );

    saveNotesLocally(updated);
  };

  const deleteNote = async (noteId: string) => {
    if (user) {
      await deleteScriptureNote(user.id, noteId);
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
