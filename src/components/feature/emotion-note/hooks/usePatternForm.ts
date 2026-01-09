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
  const [errorLabel, setErrorLabel] = useState("");
  const [errorDescription, setErrorDescription] = useState("");
  const [behaviorLabel, setBehaviorLabel] = useState("");
  const [behaviorDescription, setBehaviorDescription] = useState("");
  const [behaviorErrorTags, setBehaviorErrorTags] = useState<string[]>([]);
  const titleRef = useRef<HTMLInputElement | null>(null);
  const [showDetailEditor, setShowDetailEditor] = useState(false);
  const [showAlternativeEditor, setShowAlternativeEditor] = useState(false);
  const [showErrorEditor, setShowErrorEditor] = useState(false);
  const [showBehaviorEditor, setShowBehaviorEditor] = useState(false);

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
    if (showErrorEditor) {
      setErrorLabel("");
      setErrorDescription("");
    }
  }, [showErrorEditor, editingId]);

  useEffect(() => {
    if (showBehaviorEditor) {
      setBehaviorLabel("");
      setBehaviorDescription("");
      setBehaviorErrorTags([]);
    }
  }, [showBehaviorEditor, editingId]);

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
    setErrorLabel("");
    setErrorDescription("");
    setBehaviorLabel("");
    setBehaviorDescription("");
    setBehaviorErrorTags([]);
    setShowDetailEditor(false);
    setShowAlternativeEditor(false);
    setShowErrorEditor(false);
    setShowBehaviorEditor(false);
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
    setErrorLabel("");
    setErrorDescription("");
    setBehaviorLabel("");
    setBehaviorDescription("");
    setBehaviorErrorTags([]);
    setShowDetailEditor(false);
    setShowAlternativeEditor(false);
    setShowErrorEditor(false);
    setShowBehaviorEditor(false);
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
    setErrorLabel("");
    setErrorDescription("");
    setBehaviorLabel("");
    setBehaviorDescription("");
    setBehaviorErrorTags([]);
    setShowDetailEditor(false);
    setShowAlternativeEditor(false);
    setShowErrorEditor(false);
    setShowBehaviorEditor(false);
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
    errorLabel,
    setErrorLabel,
    errorDescription,
    setErrorDescription,
    behaviorLabel,
    setBehaviorLabel,
    behaviorDescription,
    setBehaviorDescription,
    behaviorErrorTags,
    setBehaviorErrorTags,
    titleRef,
    showDetailEditor,
    setShowDetailEditor,
    showAlternativeEditor,
    setShowAlternativeEditor,
    showErrorEditor,
    setShowErrorEditor,
    showBehaviorEditor,
    setShowBehaviorEditor,
    startCreate,
    startEdit,
    resetForm,
  };
}
