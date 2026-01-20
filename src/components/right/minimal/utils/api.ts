import type { SelectedCognitiveError } from "../../../../types/sessionHistory";
import { formatAutoTitle } from "../../../../utils/formatAutoTitle";
import { authFetch } from "../../../feature/emotion-note/utils/api";

type MinimalSavePayload = {
  triggerText: string;
  emotion: string;
  automaticThought: string;
  alternativeThought: string;
  cognitiveError?: SelectedCognitiveError | null;
};

export async function saveMinimalPatternAPI(payload: MinimalSavePayload) {
  const triggerText = payload.triggerText.trim();
  const automaticThought = payload.automaticThought.trim();
  const emotion = payload.emotion.trim();
  const alternativeThought = payload.alternativeThought.trim();
  const errorTitle = payload.cognitiveError?.title?.trim() ?? "";
  const errorDescription = payload.cognitiveError?.detail?.trim() ?? "";

  const res = await authFetch("/api/minimal-emotion-note", {
    method: "POST",
    body: JSON.stringify({
      title: formatAutoTitle(new Date()),
      triggerText,
      emotion,
      automaticThought,
      alternativeThought,
      cognitiveError: errorTitle
        ? { title: errorTitle, detail: errorDescription }
        : null,
    }),
  });
  const response = await res.json().catch(() => ({}));
  return { ok: res.ok, payload: response };
}
