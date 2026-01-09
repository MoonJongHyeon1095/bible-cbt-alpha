import { useEffect, useRef, useState } from "react";
import type { Pattern } from "../types";

export function usePatternForm() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [trigger, setTrigger] = useState("");
  const [automaticThought, setAutomaticThought] = useState("");
  const [emotion, setEmotion] = useState("");
  const [behavior, setBehavior] = useState("");
  const [alternativeText, setAlternativeText] = useState("");
  const titleRef = useRef<HTMLInputElement | null>(null);
  const [showDetailEditor, setShowDetailEditor] = useState(false);
  const [showAlternativeEditor, setShowAlternativeEditor] = useState(false);

  useEffect(() => {
    if (showDetailEditor) {
      setAutomaticThought("");
      setEmotion("");
    }
  }, [showDetailEditor, editingId]);

  useEffect(() => {
    if (showAlternativeEditor) {
      setAlternativeText("");
    }
  }, [showAlternativeEditor, editingId]);

  useEffect(() => {
    if (isCreating && editingId && titleRef.current) {
      titleRef.current.focus();
    }
  }, [isCreating, editingId]);

  const startCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setTitle("");
    setTrigger("");
    setAutomaticThought("");
    setEmotion("");
    setBehavior("");
    setAlternativeText("");
    setShowDetailEditor(false);
    setShowAlternativeEditor(false);
  };

  const startEdit = (pattern: Pattern) => {
    setEditingId(pattern.id);
    setTitle(pattern.title);
    setTrigger(pattern.trigger);
    setAutomaticThought("");
    setEmotion("");
    setBehavior(pattern.behavior);
    setIsCreating(true);
    setAlternativeText("");
    setShowDetailEditor(false);
    setShowAlternativeEditor(false);
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setTitle("");
    setTrigger("");
    setAutomaticThought("");
    setEmotion("");
    setBehavior("");
    setAlternativeText("");
    setShowDetailEditor(false);
    setShowAlternativeEditor(false);
  };

  return {
    isCreating,
    setIsCreating,
    editingId,
    title,
    setTitle,
    trigger,
    setTrigger,
    automaticThought,
    setAutomaticThought,
    emotion,
    setEmotion,
    behavior,
    setBehavior,
    alternativeText,
    setAlternativeText,
    titleRef,
    showDetailEditor,
    setShowDetailEditor,
    showAlternativeEditor,
    setShowAlternativeEditor,
    startCreate,
    startEdit,
    resetForm,
  };
}
