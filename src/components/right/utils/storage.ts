import { formatAutoTitle } from "../../../utils/formatAutoTitle";
import type { SelectedCognitiveError } from "../../../types/sessionHistory";
import type {
  Pattern,
  PatternAlternative,
  PatternBehaviorDetail,
  PatternDetail,
  PatternErrorDetail,
} from "../../feature/emotion-note/types";
import {
  loadLocalPatterns,
  saveLocalPatterns,
} from "../../feature/emotion-note/utils/storage";

type SaveSessionPayload = {
  noteId?: string | null;
  title?: string;
  triggerText: string;
  emotion: string;
  automaticThought: string;
  alternativeThought: string;
  errors: SelectedCognitiveError[];
  behavior?: { behaviorLabel: string; behaviorText: string } | null;
};

const randomSuffix = () => Math.random().toString(36).slice(2, 8);

export function saveSessionPatternLocal(payload: SaveSessionPayload) {
  const now = new Date();
  const nowIso = now.toISOString();
  const patterns = loadLocalPatterns();
  const noteId = payload.noteId ?? Date.now().toString();
  const existingIndex = patterns.findIndex((pattern) => pattern.id === noteId);
  const base: Pattern =
    existingIndex >= 0
      ? patterns[existingIndex]
      : {
          id: noteId,
          title: payload.title?.trim() || formatAutoTitle(now),
          trigger: payload.triggerText.trim(),
          behavior: "",
          frequency: 1,
          timestamp: nowIso,
          details: [],
          alternatives: [],
          errorDetails: [],
          behaviorDetails: [],
        };

  const detail: PatternDetail = {
    id: `${noteId}-detail-${randomSuffix()}`,
    noteId,
    automaticThought: payload.automaticThought.trim(),
    emotion: payload.emotion.trim(),
    createdAt: nowIso,
  };

  const alternative: PatternAlternative = {
    id: `${noteId}-alternative-${randomSuffix()}`,
    noteId,
    alternative: payload.alternativeThought.trim(),
    createdAt: nowIso,
  };

  const errorDetails: PatternErrorDetail[] = payload.errors.map((error) => ({
    id: `${noteId}-error-${randomSuffix()}`,
    noteId,
    errorLabel: error.title?.trim() || "",
    errorDescription: error.detail?.trim() || "",
    createdAt: nowIso,
  }));

  const behaviorDetails: PatternBehaviorDetail[] =
    payload.behavior?.behaviorLabel || payload.behavior?.behaviorText
      ? [
          {
            id: `${noteId}-behavior-${randomSuffix()}`,
            noteId,
            behaviorLabel: payload.behavior?.behaviorLabel?.trim() || "",
            behaviorDescription: payload.behavior?.behaviorText?.trim() || "",
            errorTags: errorDetails.map((detail) => detail.errorLabel),
            createdAt: nowIso,
          },
        ]
      : [];

  const updated: Pattern = {
    ...base,
    trigger: payload.triggerText.trim() || base.trigger,
    title: base.title || payload.title?.trim() || formatAutoTitle(now),
    frequency: Math.max(1, Number(base.frequency || 1) + 1),
    timestamp: nowIso,
    details: [...(base.details ?? []), detail],
    alternatives: [...(base.alternatives ?? []), alternative],
    errorDetails: [...(base.errorDetails ?? []), ...errorDetails],
    behaviorDetails: [
      ...(base.behaviorDetails ?? []),
      ...behaviorDetails,
    ],
  };

  const nextPatterns =
    existingIndex >= 0
      ? patterns.map((pattern, index) =>
          index === existingIndex ? updated : pattern
        )
      : [updated, ...patterns];

  saveLocalPatterns(nextPatterns);
  return updated;
}
