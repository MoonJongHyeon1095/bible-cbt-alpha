import { COGNITIVE_ERRORS } from "../constants/errors";
import type { SelectedCognitiveError } from "../types/sessionHistory";

const getMetaByTitle = (title: string) =>
  COGNITIVE_ERRORS.find((error) => error.title === title);

const parseStringItem = (
  raw: string
): SelectedCognitiveError | null => {
  const value = raw.trim();
  if (!value) return null;

  if (value.startsWith("{")) {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed.title === "string") {
        const meta = getMetaByTitle(parsed.title);
        return {
          id: meta?.id,
          index: meta?.index,
          title: parsed.title,
          detail:
            typeof parsed.detail === "string" && parsed.detail.trim()
              ? parsed.detail.trim()
              : undefined,
        };
      }
    } catch {
      // fall through to plain title handling
    }
  }

  const meta = getMetaByTitle(value);
  return {
    id: meta?.id,
    index: meta?.index,
    title: value,
  };
};

export const normalizeSelectedCognitiveErrors = (
  value: any
): SelectedCognitiveError[] => {
  if (!Array.isArray(value)) return [];
  const out: SelectedCognitiveError[] = [];

  value.forEach((item) => {
    if (typeof item === "string") {
      const parsed = parseStringItem(item);
      if (parsed) out.push(parsed);
      return;
    }

    if (item && typeof item.title === "string") {
      const meta = getMetaByTitle(item.title);
      out.push({
        id: item.id ?? meta?.id,
        index: item.index ?? meta?.index,
        title: item.title,
        detail:
          typeof item.detail === "string" && item.detail.trim()
            ? item.detail.trim()
            : undefined,
      });
    }
  });

  return out;
};
