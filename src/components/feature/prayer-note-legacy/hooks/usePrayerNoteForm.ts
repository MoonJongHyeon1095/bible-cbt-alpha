import { useEffect, useMemo, useRef, useState } from "react";
import { EMOTIONS } from "../../../../constants/emotions";
import type { PrayerNote } from "../types/types";
import type { PrayerNoteMutateResult } from "./usePrayerNotesData";

type CreateNote = (input: {
  title: string;
  content: string;
  tags: string[];
}) => Promise<PrayerNoteMutateResult>;

type UpdateNote = (input: {
  id: string;
  title: string;
  content: string;
  tags: string[];
}) => Promise<PrayerNoteMutateResult>;

type UsePrayerNoteFormOptions = {
  createNote: CreateNote;
  updateNote: UpdateNote;
};

export function usePrayerNoteForm({
  createNote,
  updateNote,
}: UsePrayerNoteFormOptions) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const titleRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isCreating && editingId && titleRef.current) {
      titleRef.current.focus();
    }
  }, [isCreating, editingId]);

  const emotionTags = useMemo(
    () => EMOTIONS.map((emotion) => emotion.label),
    []
  );

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setTitle("");
    setContent("");
    setTags([]);
  };

  const startCreate = () => {
    setIsCreating(true);
  };

  const startEdit = (note: PrayerNote) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags);
    setIsCreating(true);
  };

  const saveForm = async () => {
    if (editingId) {
      const result = await updateNote({
        id: editingId,
        title,
        content,
        tags,
      });
      if (result.shouldReset) {
        resetForm();
      }
      return;
    }

    const result = await createNote({ title, content, tags });
    if (result.shouldReset) {
      resetForm();
    }
  };

  return {
    isCreating,
    isEditing: Boolean(editingId),
    editingId,
    title,
    content,
    tags,
    titleRef,
    emotionTags,
    setTitle,
    setContent,
    toggleTag,
    resetForm,
    startCreate,
    startEdit,
    saveForm,
  };
}
