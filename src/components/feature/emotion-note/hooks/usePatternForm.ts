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

  useEffect(() => {
    if (isCreating && titleRef.current) {
      titleRef.current.focus();
    }
  }, [isCreating]);

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
  };

  const loadPatternForEdit = (pattern: Pattern) => {
    setEditingId(pattern.id);
    setTitle(pattern.title);
    setTrigger(pattern.trigger);
    setBehavior(pattern.behavior);
    setAutomaticThought("");
    setEmotion("");
    setAlternativeText("");
    setErrorLabel("");
    setErrorDescription("");
    setBehaviorLabel("");
    setBehaviorDescription("");
    setBehaviorErrorTags([]);
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
  };

  const clearEditing = () => {
    setEditingId(null);
    setTitle("");
    setTrigger("");
    setBehavior("");
    setAutomaticThought("");
    setEmotion("");
    setAlternativeText("");
    setErrorLabel("");
    setErrorDescription("");
    setBehaviorLabel("");
    setBehaviorDescription("");
    setBehaviorErrorTags([]);
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
    startCreate,
    loadPatternForEdit,
    resetForm,
    clearEditing,
  };
}
