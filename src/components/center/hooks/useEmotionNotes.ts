import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import type { EmotionThoughtPair } from "../../../types";
import type {
  EmotionNote,
  EmotionNoteDetailWithNote,
} from "../types";
import { validateUserText } from "../../../utils/validation";
import {
  deleteDetailAPI,
  fetchDetailsAPI,
  fetchNotesAPI,
} from "../utils/api";
import {
  flattenLocalDetails,
  getLocalNotes,
  saveLocalNotes,
} from "../utils/storage";

type ActiveNote = {
  id: string;
  title: string;
  trigger: string;
};

interface UseEmotionNotesParams {
  user: User | null;
  userInput: string;
  selectedEmotion: string;
  emotionIntensity: number;
  isEmotionDialActive: boolean;
  emotionThoughtPairs: EmotionThoughtPair[];
  onSetEmotionThoughtPairs: (pairs: EmotionThoughtPair[]) => void;
  onNext: () => void;
  onScrollTop: () => void;
  onInputPreserveNote: (value: string) => void;
  onSetSelectedEmotion: (emotion: string) => void;
}

export function useEmotionNotes({
  user,
  userInput,
  selectedEmotion,
  emotionIntensity,
  isEmotionDialActive,
  emotionThoughtPairs,
  onSetEmotionThoughtPairs,
  onNext,
  onScrollTop,
  onInputPreserveNote,
  onSetSelectedEmotion,
}: UseEmotionNotesParams) {
  const [showSavedDetailsModal, setShowSavedDetailsModal] = useState(false);
  const [savedDetails, setSavedDetails] = useState<EmotionNoteDetailWithNote[]>(
    []
  );
  const [notesLoading, setNotesLoading] = useState(false);
  const [showSavedTriggersModal, setShowSavedTriggersModal] = useState(false);
  const [savedTriggerNotes, setSavedTriggerNotes] = useState<EmotionNote[]>([]);
  const [activeNote, setActiveNoteState] = useState<ActiveNote | null>(null);
  const activeNoteIdRef = useRef<string | null>(null);

  const useServerNotes = Boolean(user);
  const useServerNotesRef = useRef(useServerNotes);

  useEffect(() => {
    useServerNotesRef.current = useServerNotes;
  }, [useServerNotes]);

  const setActiveNote = (
    noteId: string | null,
    title?: string | null,
    trigger?: string | null
  ) => {
    if (noteId) {
      setActiveNoteState({
        id: noteId,
        title: title ?? "",
        trigger: trigger ?? "",
      });
    } else {
      setActiveNoteState(null);
    }

    activeNoteIdRef.current = noteId;

    try {
      if (noteId) {
        sessionStorage.setItem(
          "cbt_active_note",
          JSON.stringify({ noteId, title, trigger })
        );
      } else {
        sessionStorage.removeItem("cbt_active_note");
      }
      window.dispatchEvent(new Event("cbt-active-note-update"));
    } catch {
      /* ignore */
    }
  };

  const clearActiveNote = () => setActiveNote(null, null, null);

  const mapServerNote = (row: any): EmotionNote => ({
    id: row.id?.toString() ?? `${Date.now()}`,
    title: row.title ?? "",
    trigger: row.trigger ?? row.trigger_text ?? "",
    behavior: row.behavior ?? "",
    frequency: Number(row.frequency) || 1,
    createdAt: row.created_at ?? new Date().toISOString(),
    timestamp: row.created_at ?? new Date().toISOString(),
  });

  const mapServerDetail = (row: any): EmotionNoteDetailWithNote => {
    const resolvedNoteId =
      row.note_id ??
      row.noteId ??
      row.note?.id ??
      row.emotion_note_id ??
      row.emotion_notes?.id ??
      row.emotion_note?.id ??
      null;

    return {
      id: row.id?.toString() ?? `${Date.now()}`,
      noteId: resolvedNoteId != null ? resolvedNoteId.toString() : "",
      automaticThought: row.automatic_thought ?? row.automaticThought ?? "",
      emotion: row.emotion ?? "",
      alternative: row.alternative ?? "",
      createdAt: row.created_at ?? new Date().toISOString(),
      noteTitle:
        row.noteTitle ??
        row.note_title ??
        row.emotion_notes?.title ??
        row.note?.title ??
        "",
      noteTrigger:
        row.noteTrigger ??
        row.note_trigger ??
        row.emotion_notes?.trigger ??
        row.emotion_notes?.trigger_text ??
        row.note?.trigger ??
        row.note?.trigger_text ??
        "",
    };
  };

  const fetchServerNotes = async ({ silent = false } = {}) => {
    if (!useServerNotes) return;
    if (!silent) setNotesLoading(true);

    try {
      const { ok, payload } = await fetchNotesAPI();
      if (!useServerNotesRef.current) return;
      if (!ok)
        throw new Error(payload?.error || "노트를 불러오지 못했습니다.");
      const notes = Array.isArray(payload?.notes)
        ? payload.notes.map(mapServerNote)
        : [];
      setSavedTriggerNotes(notes);
    } catch (e) {
      if (!useServerNotesRef.current) return;
      console.error("감정 노트 불러오기 실패:", e);
      if (!silent) toast.error("감정 노트를 불러오지 못했습니다.");
    } finally {
      if (!silent) setNotesLoading(false);
    }
  };

  useEffect(() => {
    if (useServerNotes) {
      void fetchServerNotes({ silent: true });
    } else {
      const locals = getLocalNotes();
      setSavedTriggerNotes(locals);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useServerNotes]);

  // 저장 키 관리/중간 저장 로직은 최종 완료 저장으로 이동.

  const openSavedTriggersModal = async () => {
    setShowSavedTriggersModal(true);
    if (useServerNotes) {
      await fetchServerNotes();
    } else {
      const locals = getLocalNotes();
      setSavedTriggerNotes(locals);
    }
  };

  const closeSavedTriggersModal = () => setShowSavedTriggersModal(false);
  const closeSavedDetailsModal = () => setShowSavedDetailsModal(false);

  const fetchSavedDetails = async (noteId?: string) => {
    setNotesLoading(true);
    try {
      if (useServerNotes) {
        const effectiveNoteId =
          noteId ||
          activeNoteIdRef.current ||
          savedTriggerNotes.find((n) => n.trigger === userInput.trim())?.id ||
          undefined;

        const params = new URLSearchParams();
        if (effectiveNoteId) params.set("noteId", effectiveNoteId);

        const { ok, payload } = await fetchDetailsAPI(
          params.get("noteId") || undefined
        );
        if (!ok)
          throw new Error(payload?.error || "감정 노트를 불러오지 못했습니다.");
        const details = Array.isArray(payload?.details)
          ? payload.details.map(mapServerDetail)
          : [];
        setSavedDetails(details);
      } else {
        const notes = getLocalNotes();
        const effectiveNoteId =
          noteId ||
          activeNoteIdRef.current ||
          savedTriggerNotes.find((n) => n.trigger === userInput.trim())?.id ||
          undefined;
        const filtered = effectiveNoteId
          ? notes.filter((n) => n.id === effectiveNoteId)
          : notes;
        setSavedDetails(flattenLocalDetails(filtered));
      }
    } catch (e) {
      console.error("감정 노트 불러오기 실패:", e);
      toast.error("감정 노트를 불러오지 못했습니다.");
    } finally {
      setNotesLoading(false);
    }
  };

  const openSavedDetailsModal = async () => {
    setShowSavedDetailsModal(true);
    await fetchSavedDetails(activeNoteIdRef.current ?? undefined);
  };

  useEffect(() => {
    if (showSavedDetailsModal) {
      void fetchSavedDetails(activeNoteIdRef.current ?? undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSavedDetailsModal, useServerNotes]);

  const loadFromFavorites = (detail: EmotionNoteDetailWithNote) => {
    const emotion = detail.emotion || selectedEmotion;
    const thought = detail.automaticThought;
    const storedIntensity = isEmotionDialActive ? emotionIntensity : null;
    const validation = validateUserText(thought);
    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }

    const matchedNote =
      savedTriggerNotes.find((n) => n.id === detail.noteId) ||
      (detail.noteTrigger
        ? savedTriggerNotes.find((n) => n.trigger === detail.noteTrigger)
        : null);
    const resolvedNoteId = matchedNote?.id || detail.noteId;
    const resolvedTitle = matchedNote?.title || detail.noteTitle;
    const resolvedTrigger = matchedNote?.trigger || detail.noteTrigger;

    if (detail.noteTrigger) {
      onInputPreserveNote(detail.noteTrigger);
    }
    onSetSelectedEmotion(emotion);
    setShowSavedDetailsModal(false);
    if (resolvedNoteId) {
      setActiveNote(resolvedNoteId, resolvedTitle, resolvedTrigger);
    }

    const newPair: EmotionThoughtPair = {
      emotion,
      intensity: storedIntensity,
      thought,
    };

    const nextPairs = [
      ...emotionThoughtPairs.filter((pair) => pair.emotion !== newPair.emotion),
      newPair,
    ];
    onSetEmotionThoughtPairs(nextPairs);

    onScrollTop();
    onNext();
  };

  const removeFromFavorites = async (id: string) => {
    if (useServerNotes) {
      try {
        const { ok, payload } = await deleteDetailAPI(id);
        if (!ok) throw new Error(payload?.error || "삭제하지 못했습니다.");
        setSavedDetails((prev) => prev.filter((f) => f.id !== id));
        return;
      } catch (e) {
        console.error("감정 노트 삭제 실패:", e);
        toast.error("삭제하지 못했습니다.");
        return;
      }
    }

    const stored = getLocalNotes();
    const next = stored.map((note) => {
      const filteredDetails = (note.details ?? []).filter(
        (detail) => detail.id !== id
      );
      return { ...note, details: filteredDetails };
    });

    saveLocalNotes(next);
    setSavedTriggerNotes(next);
    setSavedDetails((prev) => prev.filter((f) => f.id !== id));
  };

  return {
    useServerNotes,
    showSavedDetailsModal,
    showSavedTriggersModal,
    savedDetails,
    savedTriggerNotes,
    notesLoading,
    activeNoteId: activeNote?.id ?? null,
    activeNoteTitle: activeNote?.title ?? null,
    activeNoteTrigger: activeNote?.trigger ?? null,
    setActiveNote,
    clearActiveNote,
    openSavedTriggersModal,
    closeSavedTriggersModal,
    openSavedDetailsModal,
    closeSavedDetailsModal,
    loadFromFavorites,
    removeFromFavorites,
  };
}
