import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import { formatAutoTitle } from "../../../utils/formatAutoTitle";
import { validateUserText } from "../../../utils/validation";
import type { Pattern } from "../../feature/emotion-note/types";
import {
  createAlternativeAPI,
  createBehaviorDetailAPI,
  createNoteAPI,
  fetchNotesAPI,
} from "../../feature/emotion-note/utils/api";
import {
  loadLocalPatterns,
  saveLocalPatterns,
} from "../../feature/emotion-note/utils/storage";
import type { SelectedCognitiveError } from "../../../types/sessionHistory";

type TriggerNoteSummary = {
  id: string;
  title: string;
  trigger: string;
};

type UseTriggerNotesParams = {
  user: User | null;
  userInput: string;
  selectedAlternativeThought: string;
  selectedCognitiveErrors: SelectedCognitiveError[];
  selectedBehavior: {
    behaviorId: string;
    behaviorLabel: string;
    behaviorText: string;
  } | null;
};

export function useTriggerNotes({
  user,
  userInput,
  selectedAlternativeThought,
  selectedCognitiveErrors,
  selectedBehavior,
}: UseTriggerNotesParams) {
  const [savingAlternative, setSavingAlternative] = useState(false);
  const [savingBehavior, setSavingBehavior] = useState(false);
  const [activeNoteIdState, setActiveNoteIdState] = useState<string | null>(
    null
  );
  const [savedTriggerNotes, setSavedTriggerNotes] = useState<
    TriggerNoteSummary[]
  >([]);
  const [savedAlternativeKeys, setSavedAlternativeKeys] = useState<Set<string>>(
    () => new Set()
  );
  const [savedBehaviorKeys, setSavedBehaviorKeys] = useState<Set<string>>(
    () => new Set()
  );

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

  useEffect(() => {
    const key = "cbt_saved_alternative_keys";
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setSavedAlternativeKeys(new Set(parsed.map((id) => String(id))));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const persistSavedAlternativeKey = useCallback((key: string) => {
    setSavedAlternativeKeys((prev) => {
      const next = new Set(prev);
      next.add(key);
      try {
        sessionStorage.setItem(
          "cbt_saved_alternative_keys",
          JSON.stringify(Array.from(next))
        );
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const key = "cbt_saved_behavior_keys";
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setSavedBehaviorKeys(new Set(parsed.map((id) => String(id))));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const persistSavedBehaviorKey = useCallback((key: string) => {
    setSavedBehaviorKeys((prev) => {
      const next = new Set(prev);
      next.add(key);
      try {
        sessionStorage.setItem(
          "cbt_saved_behavior_keys",
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
    const validation = validateUserText(triggerText, {
      minLength: 10,
      minLengthMessage: "상황을 10자 이상 입력해주세요.",
    });
    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }

    if (savingAlternative) return;

    const now = new Date();
    const nowIso = now.toISOString();
    const title = formatAutoTitle(now);

    if (user) {
      try {
        setSavingAlternative(true);
        const activeNote = await resolveServerNote(triggerText, title);
        const altKey = `${activeNote.id}:${altText}`;
        if (savedAlternativeKeys.has(altKey)) {
          toast.info("이미 저장된 대안사고입니다.");
          return;
        }
        const numericId = Number(activeNote.id);
        const resolvedId = Number.isNaN(numericId)
          ? activeNote.id
          : numericId;
        const { ok, payload } = await createAlternativeAPI({
          noteId: resolvedId,
          alternative: altText,
        });
        if (!ok) throw new Error(payload?.error || "저장에 실패했습니다.");
        persistSavedAlternativeKey(altKey);
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
      const note = resolveLocalNote(patterns, triggerText, title, nowIso);
      const altKey = `${note.id}:${altText}`;
      if (savedAlternativeKeys.has(altKey)) {
        toast.info("이미 저장된 대안사고입니다.");
        return;
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
      persistSavedAlternativeKey(altKey);
      toast.success("대안사고가 저장되었습니다.");
    } catch (e) {
      console.error("대안사고 저장 실패:", e);
      toast.error("대안사고를 저장하지 못했습니다.");
    } finally {
      setSavingAlternative(false);
    }
  }, [
    persistActiveNote,
    savingAlternative,
    selectedAlternativeThought,
    savedAlternativeKeys,
    user,
    userInput,
    persistSavedAlternativeKey,
    resolveLocalNote,
    resolveServerNote,
  ]);

  const handleSaveBehavior = useCallback(async () => {
    if (!selectedBehavior) {
      toast.error("행동 제안을 먼저 선택해주세요.");
      return;
    }

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

    if (savingBehavior) return;

    const errorTags = selectedCognitiveErrors
      .map((error) => error.title)
      .filter(Boolean);

    const now = new Date();
    const nowIso = now.toISOString();
    const title = formatAutoTitle(now);

    if (user) {
      try {
        setSavingBehavior(true);
        const activeNote = await resolveServerNote(triggerText, title);
        const numericId = Number(activeNote.id);
        const resolvedId = Number.isNaN(numericId)
          ? activeNote.id
          : numericId;

        const behaviorKey = `${activeNote.id}:${selectedBehavior.behaviorId}:${selectedBehavior.behaviorText}`;
        if (savedBehaviorKeys.has(behaviorKey)) {
          toast.info("이미 저장된 행동 제안입니다.");
          return;
        }
        const behaviorRes = await createBehaviorDetailAPI({
          noteId: resolvedId,
          behaviorLabel: selectedBehavior.behaviorLabel,
          behaviorDescription: selectedBehavior.behaviorText,
          errorTags,
        });
        if (!behaviorRes.ok) {
          throw new Error(
            behaviorRes.payload?.error || "행동 제안을 저장하지 못했습니다."
          );
        }
        persistSavedBehaviorKey(behaviorKey);

        toast.success("행동 제안이 저장되었습니다.");
      } catch (e) {
        console.error("행동 제안 저장 실패:", e);
        toast.error("행동 제안을 저장하지 못했습니다.");
      } finally {
        setSavingBehavior(false);
      }
      return;
    }

    try {
      setSavingBehavior(true);
      const patterns = loadLocalPatterns();
      const note = resolveLocalNote(patterns, triggerText, title, nowIso);

      const behaviorKey = `${note.id}:${selectedBehavior.behaviorId}:${selectedBehavior.behaviorText}`;
      if (savedBehaviorKeys.has(behaviorKey)) {
        toast.info("이미 저장된 행동 제안입니다.");
        return;
      }
      const newBehavior = {
        id: Date.now().toString(),
        noteId: note.id,
        behaviorLabel: selectedBehavior.behaviorLabel,
        behaviorDescription: selectedBehavior.behaviorText,
        errorTags,
        createdAt: nowIso,
      };

      const nextNote: Pattern = {
        ...note,
        behaviorDetails: [newBehavior, ...(note.behaviorDetails ?? [])],
        errorDetails: note.errorDetails ?? [],
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
      persistSavedBehaviorKey(behaviorKey);
      toast.success("행동 제안이 저장되었습니다.");
    } catch (e) {
      console.error("행동 제안 저장 실패:", e);
      toast.error("행동 제안을 저장하지 못했습니다.");
    } finally {
      setSavingBehavior(false);
    }
  }, [
    resolveLocalNote,
    resolveServerNote,
    savingBehavior,
    selectedBehavior,
    persistActiveNote,
    persistSavedBehaviorKey,
    savedBehaviorKeys,
    user,
    userInput,
  ]);

  const isAlternativeSaved = useCallback(
    (text: string) => {
      if (!activeNoteIdState) return false;
      const altText = text.trim();
      if (!altText) return false;
      return savedAlternativeKeys.has(`${activeNoteIdState}:${altText}`);
    },
    [activeNoteIdState, savedAlternativeKeys]
  );

  const isBehaviorSaved = useCallback(() => {
    if (!activeNoteIdState || !selectedBehavior) return false;
    const behaviorKey = `${activeNoteIdState}:${selectedBehavior.behaviorId}:${selectedBehavior.behaviorText}`;
    return savedBehaviorKeys.has(behaviorKey);
  }, [activeNoteIdState, savedBehaviorKeys, selectedBehavior]);

  return {
    handleSaveAlternative,
    savingAlternative,
    handleSaveBehavior,
    savingBehavior,
    isAlternativeSaved,
    isBehaviorSaved,
  };
}
