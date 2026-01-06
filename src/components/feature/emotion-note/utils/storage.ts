import type { Pattern, PatternAlternative, PatternDetail } from "../types";

const LOCAL_KEY = "cbt_patterns";

const mapDetail = (row: any): PatternDetail => ({
  id: String(row.id ?? `${Date.now()}`),
  automaticThought: row.automaticThought ?? row.automatic_thought ?? "",
  emotion: row.emotion ?? "",
  createdAt: row.createdAt ?? row.created_at ?? row.timestamp ?? "",
});

const mapAlternative = (row: any): PatternAlternative => ({
  id: String(row.id ?? `${Date.now()}`),
  noteId: String(row.noteId ?? row.note_id ?? ""),
  alternative: row.alternative ?? row.alternativeThought ?? "",
  createdAt: row.createdAt ?? row.created_at ?? row.timestamp ?? "",
});

export const mapLocalPattern = (item: any): Pattern => {
  const detailsRaw = Array.isArray(item.details) ? item.details : [];
  const legacyDetail =
    detailsRaw.length === 0 &&
    (item.automaticThought || item.automatic_thought || item.alternative)
      ? [
          {
            id: item.detailId ?? `${item.id}-detail`,
            automaticThought:
              item.automaticThought ?? item.automatic_thought ?? "",
            emotion: item.emotion ?? "",
            alternative: item.alternative ?? "",
            createdAt:
              item.detailCreatedAt ??
              item.timestamp ??
              item.created_at ??
              "",
          },
        ]
      : [];

  const details = (detailsRaw.length ? detailsRaw : legacyDetail)
    .map(mapDetail)
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

  const alternativesRaw = Array.isArray(item.alternatives)
    ? item.alternatives
    : [];
  const alternativesFromDetails = (detailsRaw.length ? detailsRaw : legacyDetail)
    .map((d: any) => d.alternative ?? d.alternativeThought ?? "")
    .filter((alt: string | null | undefined) => !!alt?.trim())
    .map((alt: string) =>
      mapAlternative({
        alternative: alt,
        noteId: item.id,
        created_at: item.timestamp ?? item.created_at ?? "",
      })
    );

  const alternatives = [...alternativesRaw.map(mapAlternative), ...alternativesFromDetails].sort(
    (a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
  );

  return {
    id: String(item.id),
    title: item.title ?? "",
    trigger: item.trigger ?? item.trigger_text ?? "",
    behavior: item.behavior ?? "",
    frequency: Number(item.frequency) || 1,
    timestamp: item.timestamp ?? item.created_at ?? "",
    details,
    alternatives,
  };
};

export const loadLocalPatterns = (): Pattern[] => {
  try {
    const saved = localStorage.getItem(LOCAL_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(mapLocalPattern)
      .sort((a, b) => (b.timestamp ?? "").localeCompare(a.timestamp ?? ""));
  } catch (e) {
    console.error("패턴 로드 실패:", e);
    return [];
  }
};

export const saveLocalPatterns = (patterns: Pattern[]) => {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(patterns));
};
