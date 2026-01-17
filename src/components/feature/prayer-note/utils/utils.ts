import type { PrayerNote, PrayerNoteResponse } from "../types/types";

export const formatResponseTitle = (content: string) => {
  const trimmed = content.trim();
  if (trimmed.length <= 20) return trimmed;
  return `${trimmed.slice(0, 20)}…`;
};

export const formatNoteTitle = (content: string) => content.trim();

export const formatNoteSubtitle = (content: string) => content.trim();

export const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const normalizeLocalNotes = (rawNotes: unknown[]): PrayerNote[] => {
  return rawNotes.map((note) => {
    const rawNote = note as {
      id?: string;
      title?: string;
      content?: string;
      tags?: string[];
      timestamp?: string;
      responses?: PrayerNoteResponse[];
    };
    const safeTimestamp =
      typeof rawNote.timestamp === "string" && rawNote.timestamp
        ? rawNote.timestamp
        : new Date().toISOString();
    const responses = Array.isArray(rawNote.responses)
      ? rawNote.responses.map((response) => ({
          id: String(response.id ?? Date.now().toString()),
          content: response.content ?? "",
          timestamp: response.timestamp ?? safeTimestamp,
        }))
      : [];

    return {
      id: rawNote.id ? String(rawNote.id) : Date.now().toString(),
      title: rawNote.title ?? "",
      content: rawNote.content ?? "",
      tags: Array.isArray(rawNote.tags) ? rawNote.tags : [],
      timestamp: safeTimestamp,
      responses,
    };
  });
};
