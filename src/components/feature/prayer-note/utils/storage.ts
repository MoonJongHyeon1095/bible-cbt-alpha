// import type { PrayerNote, PrayerNoteResponse } from "../types/prayerNotes.types";

// const STORAGE_KEY = "prayer_notes";

// const normalizeLocalNotes = (rawNotes: unknown[]): PrayerNote[] => {
//   return rawNotes.map((note) => {
//     const rawNote = note as {
//       id?: string;
//       title?: string;
//       content?: string;
//       tags?: string[];
//       emotionNoteId?: string | number | null;
//       book?: string;
//       chapter?: number | string | null;
//       startVerse?: number | string | null;
//       endVerse?: number | string | null;
//       timestamp?: string;
//       responses?: PrayerNoteResponse[];
//       reflections?: PrayerNoteResponse[];
//     };
//     const safeTimestamp =
//       typeof rawNote.timestamp === "string" && rawNote.timestamp
//         ? rawNote.timestamp
//         : new Date().toISOString();
//     const existingResponses = Array.isArray(rawNote.responses)
//       ? rawNote.responses
//       : Array.isArray(rawNote.reflections)
//       ? rawNote.reflections
//       : [];
//     const normalizedResponses = existingResponses.map((response) => ({
//       id: String(response.id ?? Date.now().toString()),
//       content: response.content ?? "",
//       timestamp: response.timestamp ?? safeTimestamp,
//     }));

//     const parsedChapter =
//       typeof rawNote.chapter === "number"
//         ? rawNote.chapter
//         : typeof rawNote.chapter === "string"
//         ? Number.parseInt(rawNote.chapter, 10)
//         : null;
//     const rawStartVerse =
//       typeof rawNote.startVerse === "number"
//         ? rawNote.startVerse
//         : typeof rawNote.startVerse === "string"
//         ? Number.parseInt(rawNote.startVerse, 10)
//         : null;
//     const rawEndVerse =
//       typeof rawNote.endVerse === "number"
//         ? rawNote.endVerse
//         : typeof rawNote.endVerse === "string"
//         ? Number.parseInt(rawNote.endVerse, 10)
//         : null;
//     const resolvedStartVerse =
//       Number.isFinite(rawStartVerse ?? NaN) && rawStartVerse !== null
//         ? rawStartVerse
//         : null;
//     const resolvedEndVerse =
//       Number.isFinite(rawEndVerse ?? NaN) && rawEndVerse !== null
//         ? rawEndVerse
//         : resolvedStartVerse ?? null;

//     return {
//       id: rawNote.id ? String(rawNote.id) : Date.now().toString(),
//       title: rawNote.title ?? "",
//       content: rawNote.content ?? "",
//       tags: Array.isArray(rawNote.tags) ? rawNote.tags : [],
//       emotionNoteId:
//         rawNote.emotionNoteId != null
//           ? String(rawNote.emotionNoteId)
//           : null,
//       book: rawNote.book?.trim() || "",
//       chapter:
//         Number.isFinite(parsedChapter ?? NaN) && parsedChapter !== null
//           ? parsedChapter
//           : null,
//       startVerse: resolvedStartVerse,
//       endVerse: resolvedEndVerse,
//       timestamp: safeTimestamp,
//       responses: normalizedResponses,
//     };
//   });
// };

// export const loadLocalPrayerNotes = (): PrayerNote[] => {
//   try {
//     const saved = localStorage.getItem(STORAGE_KEY);
//     const parsed = saved ? JSON.parse(saved) : [];
//     const normalized = Array.isArray(parsed) ? normalizeLocalNotes(parsed) : [];
//     if (saved) {
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
//     }
//     return normalized;
//   } catch (error) {
//     console.error("기도 노트 로드 실패:", error);
//     return [];
//   }
// };

// export const saveLocalPrayerNotes = (notes: PrayerNote[]) => {
//   localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
// };
