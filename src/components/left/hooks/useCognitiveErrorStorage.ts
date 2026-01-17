import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { COGNITIVE_ERRORS_BY_INDEX, type ErrorIndex } from "../../../lib/ai";
import type { Pattern } from "../../feature/emotion-note/types";
import {
  createErrorDetailsAPI,
  createNoteAPI,
  fetchNotesAPI,
} from "../../feature/emotion-note/utils/api";
import {
  loadLocalPatterns,
  saveLocalPatterns,
} from "../../feature/emotion-note/utils/storage";
import { formatAutoTitle } from "../../../utils/formatAutoTitle";
import { validateUserText } from "../../../utils/validation";
import type { DetailItem } from "./useLeftPageTypes";

type UseCognitiveErrorStorageParams = {
  user: User | null;
  userInput: string;
  detailByIndex: Partial<Record<ErrorIndex, DetailItem>>;
};

export function useCognitiveErrorStorage({
  user,
  userInput,
  detailByIndex,
}: UseCognitiveErrorStorageParams) {
  const [savingErrorId, setSavingErrorId] = useState<ErrorIndex | null>(null);
  const [activeNoteIdState, setActiveNoteIdState] = useState<string | null>(
    null
  );
  const [savedTriggerNotes, setSavedTriggerNotes] = useState<
    { id: string; title: string; trigger: string }[]
  >([]);
  const [savedErrorKeys, setSavedErrorKeys] = useState<Set<string>>(
    () => new Set()
  );

  const mapServerNote = useCallback(
    (row: any) => ({
      id: String(row.id ?? ""),
      title: row.title ?? "",
      trigger: row.trigger ?? row.trigger_text ?? "",
    }),
    []
  );

  const persistActiveNote = useCallback((note: {
    id: string;
    title: string;
    trigger: string;
  } | null) => {
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

  useEffect(() => {
    const key = "cbt_saved_error_keys";
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setSavedErrorKeys(new Set(parsed.map((id) => String(id))));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const persistSavedErrorKey = useCallback((key: string) => {
    setSavedErrorKeys((prev) => {
      const next = new Set(prev);
      next.add(key);
      try {
        sessionStorage.setItem(
          "cbt_saved_error_keys",
          JSON.stringify(Array.from(next))
        );
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const resolveServerNote = useCallback(
    async (triggerText: string, title: string) => {
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
      return activeNote;
    },
    [
      activeNoteIdState,
      loadServerNotes,
      mapServerNote,
      persistActiveNote,
      savedTriggerNotes,
    ]
  );

  const resolveLocalNote = useCallback(
    (patterns: Pattern[], triggerText: string, title: string, nowIso: string) =>
      (activeNoteIdState
        ? patterns.find((p) => p.id === activeNoteIdState)
        : null) ?? patterns.find((p) => p.trigger === triggerText) ?? {
        id: Date.now().toString(),
        title,
        trigger: triggerText,
        behavior: "",
        frequency: 1,
        timestamp: nowIso,
        details: [],
        alternatives: [],
        behaviorDetails: [],
        errorDetails: [],
      },
    [activeNoteIdState]
  );

  const handleSaveError = useCallback(
    async (idx: ErrorIndex) => {
      const meta = COGNITIVE_ERRORS_BY_INDEX[idx];
      if (!meta) return;

      const triggerText = userInput.trim();
      if (!triggerText) {
        toast.error("먼저 상황을 입력해주세요.");
        return;
      }
      const validation = validateUserText(triggerText, {
        minLength: 10,
        minLengthMessage: "상황을 10자 이상 입력해주세요.",
      });
      if (!validation.ok) {
        toast.error(validation.message);
        return;
      }

      if (savingErrorId === idx) return;

      const errorDescription =
        detailByIndex[idx]?.analysis ?? meta.description ?? "";
      const now = new Date();
      const nowIso = now.toISOString();
      const title = formatAutoTitle(now);

      if (user) {
        try {
          setSavingErrorId(idx);
          const activeNote = await resolveServerNote(triggerText, title);
          const errorKey = `${activeNote.id}:${meta.id}`;
          if (savedErrorKeys.has(errorKey)) {
            toast.info("이미 저장된 인지오류입니다.");
            return;
          }
          const numericId = Number(activeNote.id);
          const resolvedId = Number.isNaN(numericId)
            ? activeNote.id
            : numericId;

          const { ok, payload } = await createErrorDetailsAPI({
            noteId: resolvedId,
            errors: [
              {
                errorLabel: meta.title,
                errorDescription,
              },
            ],
          });
          if (!ok) {
            throw new Error(payload?.error || "인지오류 저장에 실패했습니다.");
          }
          persistSavedErrorKey(errorKey);
          toast.success("인지오류가 저장되었습니다.");
        } catch (e) {
          console.error("인지오류 저장 실패:", e);
          toast.error("인지오류를 저장하지 못했습니다.");
        } finally {
          setSavingErrorId(null);
        }
        return;
      }

      try {
        setSavingErrorId(idx);
        const patterns = loadLocalPatterns();
        const note = resolveLocalNote(patterns, triggerText, title, nowIso);
        const errorKey = `${note.id}:${meta.id}`;
        if (savedErrorKeys.has(errorKey)) {
          toast.info("이미 저장된 인지오류입니다.");
          return;
        }

        const newError = {
          id: `${Date.now()}-${meta.id}`,
          noteId: note.id,
          errorLabel: meta.title,
          errorDescription,
          createdAt: nowIso,
        };

        const nextNote: Pattern = {
          ...note,
          errorDetails: [newError, ...(note.errorDetails ?? [])],
        };

        const updatedPatterns = [
          nextNote,
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
          id: nextNote.id,
          title: nextNote.title,
          trigger: nextNote.trigger,
        });
        persistSavedErrorKey(errorKey);
        toast.success("인지오류가 저장되었습니다.");
      } catch (e) {
        console.error("인지오류 저장 실패:", e);
        toast.error("인지오류를 저장하지 못했습니다.");
      } finally {
        setSavingErrorId(null);
      }
    },
    [
      detailByIndex,
      persistActiveNote,
      persistSavedErrorKey,
      resolveLocalNote,
      resolveServerNote,
      savedErrorKeys,
      savingErrorId,
      user,
      userInput,
    ]
  );

  const isErrorSaved = useCallback(
    (idx: ErrorIndex) => {
      if (!activeNoteIdState) return false;
      const meta = COGNITIVE_ERRORS_BY_INDEX[idx];
      if (!meta) return false;
      return savedErrorKeys.has(`${activeNoteIdState}:${meta.id}`);
    },
    [activeNoteIdState, savedErrorKeys]
  );

  return {
    handleSaveError,
    isErrorSaved,
    savingErrorId,
  };
}
