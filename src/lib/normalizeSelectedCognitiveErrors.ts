import type { SelectedCognitiveError } from "../types/sessionHistory";

const parseStringItem = (
  raw: string
): SelectedCognitiveError | null => {
  const value = raw.trim();
  if (!value) return null;

  if (value.startsWith("{")) {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed.title === "string") {
        return {
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

  return { title: value };
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
      out.push({
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
