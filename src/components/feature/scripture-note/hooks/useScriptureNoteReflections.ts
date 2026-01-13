import type { User } from "@supabase/supabase-js";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { toast } from "sonner";
import type { ScriptureNote, ScriptureNoteReflection } from "../types/scriptureNotes.types";
import {
  createScriptureNoteReflection,
  deleteScriptureNoteReflection,
  updateScriptureNoteReflection,
} from "../utils/api";

interface UseScriptureNoteReflectionsParams {
  user: User | null;
  notes: ScriptureNote[];
  setNotes: Dispatch<SetStateAction<ScriptureNote[]>>;
  saveNotesLocally: (notes: ScriptureNote[]) => void;
}

export function useScriptureNoteReflections({
  user,
  notes,
  setNotes,
  saveNotesLocally,
}: UseScriptureNoteReflectionsParams) {
  const [reflectionDrafts, setReflectionDrafts] = useState<
    Record<string, string>
  >({});
  const [editingReflectionNoteId, setEditingReflectionNoteId] = useState<
    string | null
  >(null);
  const [editingReflectionId, setEditingReflectionId] = useState<string | null>(
    null
  );
  const [editingReflectionContent, setEditingReflectionContent] = useState("");
  const [expandedReflections, setExpandedReflections] = useState<
    Record<string, boolean>
  >({});

  const resetReflectionEdit = () => {
    setEditingReflectionNoteId(null);
    setEditingReflectionId(null);
    setEditingReflectionContent("");
  };

  const handleCreateReflection = async (noteId: string) => {
    const content = (reflectionDrafts[noteId] ?? "").trim();
    if (!content) {
      toast.error("묵상을 입력해주세요.");
      return;
    }

    if (user) {
      try {
        const noteIdValue = Number(noteId);
        if (!Number.isFinite(noteIdValue)) {
          toast.error("묵상을 저장할 수 없습니다.");
          return;
        }

        const newReflection = await createScriptureNoteReflection(
          user.id,
          noteIdValue,
          content
        );
        setNotes((prev) =>
          prev.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  reflections: [newReflection, ...note.reflections],
                }
              : note
          )
        );
      } catch (error) {
        console.error("묵상 저장 실패:", error);
        toast.error("묵상을 저장하지 못했습니다.");
        return;
      }
    } else {
      const newReflection: ScriptureNoteReflection = {
        id: Date.now().toString(),
        content,
        timestamp: new Date().toISOString(),
      };
      const updated = notes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              reflections: [newReflection, ...note.reflections],
            }
          : note
      );
      saveNotesLocally(updated);
    }

    setReflectionDrafts((prev) => ({ ...prev, [noteId]: "" }));
  };

  const handleUpdateReflection = async (
    noteId: string,
    reflectionId: string
  ) => {
    const content = editingReflectionContent.trim();
    if (!content) {
      toast.error("묵상을 입력해주세요.");
      return;
    }

    if (user) {
      try {
        const updatedReflection = await updateScriptureNoteReflection(
          user.id,
          reflectionId,
          content
        );
        setNotes((prev) =>
          prev.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  reflections: note.reflections.map((reflection) =>
                    reflection.id === reflectionId
                      ? {
                          ...reflection,
                          content: updatedReflection.content,
                          timestamp:
                            updatedReflection.timestamp ?? reflection.timestamp,
                        }
                      : reflection
                  ),
                }
              : note
          )
        );
      } catch (error) {
        console.error("묵상 수정 실패:", error);
        toast.error("묵상을 수정하지 못했습니다.");
        return;
      }
    } else {
      const updated = notes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              reflections: note.reflections.map((reflection) =>
                reflection.id === reflectionId
                  ? { ...reflection, content }
                  : reflection
              ),
            }
          : note
      );
      saveNotesLocally(updated);
    }

    resetReflectionEdit();
  };

  const handleDeleteReflection = async (
    noteId: string,
    reflectionId: string
  ) => {
    if (user) {
      try {
        await deleteScriptureNoteReflection(user.id, reflectionId);
      } catch (error) {
        console.error("묵상 삭제 실패:", error);
        toast.error("묵상을 삭제하지 못했습니다.");
        return;
      }
    }

    const updated = notes.map((note) =>
      note.id === noteId
        ? {
            ...note,
            reflections: note.reflections.filter(
              (reflection) => reflection.id !== reflectionId
            ),
          }
        : note
    );

    if (user) {
      setNotes(updated);
    } else {
      saveNotesLocally(updated);
    }

    if (editingReflectionId === reflectionId) {
      resetReflectionEdit();
    }
    toast.success("묵상을 삭제했습니다.");
  };

  const startEditReflection = (
    noteId: string,
    reflection: ScriptureNoteReflection
  ) => {
    setEditingReflectionNoteId(noteId);
    setEditingReflectionId(reflection.id);
    setEditingReflectionContent(reflection.content);
  };

  const toggleExpandedReflection = (key: string) => {
    setExpandedReflections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const updateReflectionDraft = (noteId: string, value: string) => {
    setReflectionDrafts((prev) => ({ ...prev, [noteId]: value }));
  };

  return {
    reflectionDrafts,
    editingReflectionNoteId,
    editingReflectionId,
    editingReflectionContent,
    expandedReflections,
    setEditingReflectionContent,
    startEditReflection,
    resetReflectionEdit,
    handleCreateReflection,
    handleUpdateReflection,
    handleDeleteReflection,
    toggleExpandedReflection,
    updateReflectionDraft,
  };
}
