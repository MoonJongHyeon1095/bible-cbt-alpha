import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import { formatAutoTitle } from "../../../utils/formatAutoTitle";
import type { Pattern } from "../../feature/emotion-note/types";
import {
  createAlternativeAPI,
  createNoteAPI,
  fetchNotesAPI,
} from "../../feature/emotion-note/utils/api";
import {
  loadLocalPatterns,
  saveLocalPatterns,
} from "../../feature/emotion-note/utils/storage";

type TriggerNoteSummary = {
  id: string;
  title: string;
  trigger: string;
};

const MIN_TRIGGER_LENGTH = 10;

type UseTriggerNotesParams = {
  user: User | null;
  userInput: string;
  selectedAlternativeThought: string;
};

export function useTriggerNotes({
  user,
  userInput,
  selectedAlternativeThought,
}: UseTriggerNotesParams) {
  const [savingAlternative, setSavingAlternative] = useState(false);
  const [activeNoteIdState, setActiveNoteIdState] = useState<string | null>(
    null
  );
  const [savedTriggerNotes, setSavedTriggerNotes] = useState<
    TriggerNoteSummary[]
  >([]);

  const mapServerNote = useCallback(
    (row: any): TriggerNoteSummary => ({
      id: String(row.id ?? ""),
      title: row.title ?? "",
      trigger: row.trigger ?? row.trigger_text ?? "",
    }),
    []
  );

  const persistActiveNote = useCallback((note: TriggerNoteSummary | null) => {
    setActiveNoteIdState(note?.id ?? null);
    try {
      if (note) {
        sessionStorage.setItem(
          "cbt_active_note",
          JSON.stringify({
            noteId: note.id,
            title: note.title,
            trigger: note.trigger,
          })
        );
      } else {
        sessionStorage.removeItem("cbt_active_note");
      }
      window.dispatchEvent(new Event("cbt-active-note-update"));
    } catch {
      /* ignore */
    }
  }, []);

  const loadServerNotes = useCallback(async () => {
    try {
      const { ok, payload } = await fetchNotesAPI(false);
      if (!ok) throw new Error(payload?.error || "노트를 불러오지 못했습니다.");
      const notes = Array.isArray(payload?.notes)
        ? payload.notes.map(mapServerNote)
        : [];
      setSavedTriggerNotes(notes);
      return notes;
    } catch (e) {
      console.error("노트 로드 실패:", e);
      return [];
    }
  }, [mapServerNote]);

  const loadLocalNotes = useCallback(() => {
    const patterns = loadLocalPatterns();
    const notes = patterns.map((pattern) => ({
      id: pattern.id,
      title: pattern.title,
      trigger: pattern.trigger,
    }));
    setSavedTriggerNotes(notes);
    return notes;
  }, []);

  useEffect(() => {
    const key = "cbt_active_note";
    const read = () => {
      try {
        const raw = sessionStorage.getItem(key);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed?.noteId) setActiveNoteIdState(String(parsed.noteId));
      } catch {
        /* ignore */
      }
    };
    read();
    const handler = () => read();
    window.addEventListener("cbt-active-note-update", handler as any);
    return () => {
      window.removeEventListener("cbt-active-note-update", handler as any);
    };
  }, []);

  useEffect(() => {
    if (user) {
      void loadServerNotes();
      return;
    }
    loadLocalNotes();
  }, [loadLocalNotes, loadServerNotes, user]);

  const handleSaveAlternative = useCallback(async () => {
    const altText = selectedAlternativeThought.trim();
    if (!altText) {
      toast.error("대안사고를 먼저 선택해주세요.");
      return;
    }

    const triggerText = userInput.trim();
    if (!triggerText) {
      toast.error("먼저 상황을 입력해주세요.");
      return;
    }
    if (triggerText.length < MIN_TRIGGER_LENGTH) {
      toast.error("상황을 10자 이상 입력해주세요.");
      return;
    }

    if (savingAlternative) return;

    const now = new Date();
    const nowIso = now.toISOString();
    const title = formatAutoTitle(now);

    if (user) {
      try {
        setSavingAlternative(true);
        let notes = savedTriggerNotes;
        let noteId = activeNoteIdState;
        let noteTitle = "";
        let noteTrigger = "";

        if (!noteId && notes.length === 0) {
          notes = await loadServerNotes();
        }

        if (noteId) {
          const matchedById = notes.find((note) => note.id === noteId);
          if (matchedById) {
            noteTitle = matchedById.title;
            noteTrigger = matchedById.trigger;
          }
        }

        if (!noteId) {
          const existing = notes.find((note) => note.trigger === triggerText);
          if (existing) {
            noteId = existing.id;
            noteTitle = existing.title;
            noteTrigger = existing.trigger;
          }
        }

        if (!noteId) {
          const { ok, payload } = await createNoteAPI({
            title,
            trigger: triggerText,
          });
          if (!ok || !payload?.note) {
            throw new Error(payload?.error || "상황을 저장하지 못했습니다.");
          }
          const created = mapServerNote(payload.note);
          setSavedTriggerNotes((prev) => [created, ...prev]);
          noteId = created.id;
          noteTitle = created.title;
          noteTrigger = created.trigger;
        }

        const activeNote = {
          id: noteId,
          title: noteTitle || title,
          trigger: noteTrigger || triggerText,
        };
        persistActiveNote(activeNote);

        const numericId = Number(noteId);
        const resolvedId = Number.isNaN(numericId) ? noteId : numericId;
        const { ok, payload } = await createAlternativeAPI({
          noteId: resolvedId,
          alternative: altText,
        });
        if (!ok) throw new Error(payload?.error || "저장에 실패했습니다.");
        toast.success("대안사고가 저장되었습니다.");
      } catch (e) {
        console.error("대안사고 저장 실패:", e);
        toast.error("대안사고를 저장하지 못했습니다.");
      } finally {
        setSavingAlternative(false);
      }
      return;
    }

    try {
      setSavingAlternative(true);
      const patterns = loadLocalPatterns();
      let note =
        (activeNoteIdState
          ? patterns.find((p) => p.id === activeNoteIdState)
          : null) ?? patterns.find((p) => p.trigger === triggerText);

      if (!note) {
        note = {
          id: Date.now().toString(),
          title,
          trigger: triggerText,
          behavior: "",
          frequency: 1,
          timestamp: nowIso,
          details: [],
          alternatives: [],
        } as Pattern;
      }

      const newAlternative = {
        id: Date.now().toString(),
        noteId: note.id,
        alternative: altText,
        createdAt: nowIso,
      };

      const updatedNote: Pattern = {
        ...note,
        alternatives: [newAlternative, ...(note.alternatives ?? [])],
      };

      const updatedPatterns = [
        updatedNote,
        ...patterns.filter((p) => p.id !== note.id),
      ];
      saveLocalPatterns(updatedPatterns);
      setSavedTriggerNotes(
        updatedPatterns.map((p) => ({
          id: p.id,
          title: p.title,
          trigger: p.trigger,
        }))
      );

      persistActiveNote({
        id: updatedNote.id,
        title: updatedNote.title,
        trigger: updatedNote.trigger,
      });
      toast.success("대안사고가 저장되었습니다.");
    } catch (e) {
      console.error("대안사고 저장 실패:", e);
      toast.error("대안사고를 저장하지 못했습니다.");
    } finally {
      setSavingAlternative(false);
    }
  }, [
    activeNoteIdState,
    loadServerNotes,
    mapServerNote,
    persistActiveNote,
    savedTriggerNotes,
    savingAlternative,
    selectedAlternativeThought,
    user,
    userInput,
  ]);

  return {
    handleSaveAlternative,
    savingAlternative,
  };
}
