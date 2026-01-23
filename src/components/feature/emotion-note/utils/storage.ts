import type { Pattern } from "../types";

// const LOCAL_KEY = "cbt_patterns";

// const mapDetail = (row: any): PatternDetail => ({
//   id: String(row.id ?? `${Date.now()}`),
//   automaticThought: row.automaticThought ?? row.automatic_thought ?? "",
//   emotion: row.emotion ?? "",
//   createdAt: row.createdAt ?? row.created_at ?? row.timestamp ?? "",
// });

// const mapAlternative = (row: any): PatternAlternative => ({
//   id: String(row.id ?? `${Date.now()}`),
//   noteId: String(row.noteId ?? row.note_id ?? ""),
//   alternative: row.alternative ?? row.alternativeThought ?? "",
//   createdAt: row.createdAt ?? row.created_at ?? row.timestamp ?? "",
// });

// const mapBehaviorDetail = (row: any): PatternBehaviorDetail => ({
//   id: String(row.id ?? `${Date.now()}`),
//   noteId: String(row.noteId ?? row.note_id ?? ""),
//   behaviorLabel: row.behaviorLabel ?? row.behavior_label ?? "",
//   behaviorDescription: row.behaviorDescription ?? row.behavior_description ?? "",
//   errorTags: Array.isArray(row.errorTags ?? row.error_tags)
//     ? (row.errorTags ?? row.error_tags)
//     : [],
//   createdAt: row.createdAt ?? row.created_at ?? row.timestamp ?? "",
// });

// const mapErrorDetail = (row: any): PatternErrorDetail => ({
//   id: String(row.id ?? `${Date.now()}`),
//   noteId: String(row.noteId ?? row.note_id ?? ""),
//   errorLabel: row.errorLabel ?? row.error_label ?? "",
//   errorDescription: row.errorDescription ?? row.error_description ?? "",
//   createdAt: row.createdAt ?? row.created_at ?? row.timestamp ?? "",
// });

// export const mapLocalPattern = (item: any): Pattern => {
//   const detailsRaw = Array.isArray(item.details) ? item.details : [];
//   const legacyDetail =
//     detailsRaw.length === 0 &&
//     (item.automaticThought || item.automatic_thought || item.alternative)
//       ? [
//           {
//             id: item.detailId ?? `${item.id}-detail`,
//             automaticThought:
//               item.automaticThought ?? item.automatic_thought ?? "",
//             emotion: item.emotion ?? "",
//             alternative: item.alternative ?? "",
//             createdAt:
//               item.detailCreatedAt ??
//               item.timestamp ??
//               item.created_at ??
//               "",
//           },
//         ]
//       : [];

//   const details = (detailsRaw.length ? detailsRaw : legacyDetail)
//     .map(mapDetail)
//     .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

//   const alternativesRaw = Array.isArray(item.alternatives)
//     ? item.alternatives
//     : [];
//   const alternativesFromDetails = (detailsRaw.length ? detailsRaw : legacyDetail)
//     .map((d: any) => d.alternative ?? d.alternativeThought ?? "")
//     .filter((alt: string | null | undefined) => !!alt?.trim())
//     .map((alt: string) =>
//       mapAlternative({
//         alternative: alt,
//         noteId: item.id,
//         created_at: item.timestamp ?? item.created_at ?? "",
//       })
//     );

//   const alternatives = [
//     ...alternativesRaw.map(mapAlternative),
//     ...alternativesFromDetails,
//   ].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

//   const behaviorDetailsRaw = Array.isArray(item.behaviorDetails)
//     ? item.behaviorDetails
//     : [];
//   const behaviorDetails = behaviorDetailsRaw
//     .map(mapBehaviorDetail)
//     .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

//   const errorDetailsRaw = Array.isArray(item.errorDetails)
//     ? item.errorDetails
//     : [];
//   const errorDetails = errorDetailsRaw
//     .map(mapErrorDetail)
//     .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

//   return {
//     id: String(item.id),
//     title: item.title ?? "",
//     trigger: item.trigger ?? item.trigger_text ?? "",
//     behavior: item.behavior ?? "",
//     frequency: Number(item.frequency) || 1,
//     timestamp: item.timestamp ?? item.created_at ?? "",
//     details,
//     alternatives,
//     behaviorDetails,
//     errorDetails,
//   };
// };

export const loadLocalPatterns = (): Pattern[] => [];

export const saveLocalPatterns = (_patterns: Pattern[]) => {};
