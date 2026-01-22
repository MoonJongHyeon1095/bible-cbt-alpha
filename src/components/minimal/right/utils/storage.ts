import { formatAutoTitle } from "../../../../utils/formatAutoTitle";
import type { SelectedCognitiveError } from "../../../../types/sessionHistory";
import type {
  Pattern,
  PatternAlternative,
  PatternDetail,
  PatternErrorDetail,
} from "../../../feature/emotion-note/types";
import {
  loadLocalPatterns,
  saveLocalPatterns,
} from "../../../feature/emotion-note/utils/storage";

type MinimalSavePayload = {
  triggerText: string;
  emotion: string;
  automaticThought: string;
  alternativeThought: string;
  cognitiveError?: SelectedCognitiveError | null;
};

export function saveMinimalPatternLocal(payload: MinimalSavePayload) {
  const now = new Date();
  const nowIso = now.toISOString();
  const noteId = Date.now().toString();
  const triggerText = payload.triggerText.trim();
  const automaticThought = payload.automaticThought.trim();
  const emotion = payload.emotion.trim();
  const alternativeThought = payload.alternativeThought.trim();
  const errorTitle = payload.cognitiveError?.title?.trim() ?? "";
  const errorDescription = payload.cognitiveError?.detail?.trim() ?? "";

  const detail: PatternDetail = {
    id: `${noteId}-detail`,
    noteId,
    automaticThought,
    emotion,
    createdAt: nowIso,
  };

  const alternatives: PatternAlternative[] = alternativeThought
    ? [
        {
          id: `${noteId}-alternative`,
          noteId,
          alternative: alternativeThought,
          createdAt: nowIso,
        },
      ]
    : [];

  const errorDetails: PatternErrorDetail[] = errorTitle
    ? [
        {
          id: `${noteId}-error`,
          noteId,
          errorLabel: errorTitle,
          errorDescription,
          createdAt: nowIso,
        },
      ]
    : [];

  const newPattern: Pattern = {
    id: noteId,
    title: formatAutoTitle(now),
    trigger: triggerText,
    behavior: "",
    frequency: 1,
    timestamp: nowIso,
    details: [detail],
    alternatives,
    errorDetails,
    behaviorDetails: [],
  };

  const existing = loadLocalPatterns();
  saveLocalPatterns([newPattern, ...existing]);
  return newPattern;
}
