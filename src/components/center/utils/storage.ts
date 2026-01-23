import type {
  EmotionNote,
  EmotionNoteDetailWithNote,
} from "../types";

// const EMOTION_NOTES_KEY = "cbt_patterns";

// const randomSuffix = () => Math.random().toString(36).slice(2);

// const mapLocalDetail = (detail: any, noteId: string): EmotionNoteDetail => ({
//   id: detail.id?.toString() ?? `${noteId}-${randomSuffix()}`,
//   noteId,
//   automaticThought:
//     detail.automaticThought ?? detail.automatic_thought ?? "",
//   emotion: detail.emotion ?? "",
//   alternative: detail.alternative ?? "",
//   createdAt:
//     detail.createdAt ??
//     detail.created_at ??
//     detail.timestamp ??
//     new Date().toISOString(),
// });

// export const mapLocalNote = (item: any): EmotionNote => {
//   const noteId = item.id?.toString() ?? `${Date.now()}`;
//   const hasFlatDetail =
//     item.automaticThought ||
//     item.automatic_thought ||
//     item.emotion ||
//     item.alternative;

//   const detailsArray = Array.isArray(item.details)
//     ? item.details.map((d: any) => mapLocalDetail(d, noteId))
//     : hasFlatDetail
//       ? [
//           mapLocalDetail(
//             {
//               id: item.detailId ?? `${noteId}-detail`,
//               automaticThought:
//                 item.automaticThought ?? item.automatic_thought ?? "",
//               emotion: item.emotion ?? "",
//               alternative: item.alternative ?? "",
//               createdAt:
//                 item.detailCreatedAt ??
//                 item.createdAt ??
//                 item.created_at ??
//                 item.timestamp,
//             },
//             noteId
//           ),
//         ]
//       : [];

//   return {
//     id: noteId,
//     title: item.title ?? "",
//     trigger: item.trigger ?? item.trigger_text ?? "",
//     behavior: item.behavior ?? "",
//     frequency: Number(item.frequency) || 1,
//     createdAt: item.timestamp ?? item.created_at ?? new Date().toISOString(),
//     timestamp: item.timestamp ?? item.created_at ?? new Date().toISOString(),
//     details: detailsArray,
//   };
// };

// export const getLocalNotes = (): EmotionNote[] => {
//   try {
//     const stored = localStorage.getItem(EMOTION_NOTES_KEY);
//     if (!stored) return [];
//     const parsed = JSON.parse(stored);
//     if (!Array.isArray(parsed)) return [];
//     return parsed
//       .map(mapLocalNote)
//       .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
//   } catch (e) {
//     console.error("감정 노트 로드 실패:", e);
//     return [];
//   }
// };

// export const saveLocalNotes = (items: EmotionNote[]) => {
//   localStorage.setItem(EMOTION_NOTES_KEY, JSON.stringify(items));
// };

export const getLocalNotes = (): EmotionNote[] => [];

export const saveLocalNotes = (_items: EmotionNote[]) => {};

export const flattenLocalDetails = (
  _notes: EmotionNote[]
): EmotionNoteDetailWithNote[] => [];
