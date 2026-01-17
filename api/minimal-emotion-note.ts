import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors, json, readJson, requireAppKey } from "./_utils";
import { getAuthUser, supabaseServiceClient } from "./_supabaseAuth";

const NOTES_TABLE = "emotion_notes";
const DETAILS_TABLE = "emotion_note_details";
const ERRORS_TABLE = "emotion_error_details";
const ALTERNATIVES_TABLE = "emotion_alternative_details";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (handleCors(req, res)) return;
    if (!requireAppKey(req)) return json(res, 401, { error: "Unauthorized" });
    const user = await getAuthUser(req);
    if (!user) return json(res, 401, { error: "Unauthorized" });

    if (req.method !== "POST") {
      return json(res, 405, { error: "Method Not Allowed" });
    }

    const body = await readJson(req);
    const title = String(body?.title ?? "").trim();
    const triggerText = String(body?.triggerText ?? "").trim();
    const emotion = String(body?.emotion ?? "").trim();
    const automaticThought = String(body?.automaticThought ?? "").trim();
    const alternativeThought = String(body?.alternativeThought ?? "").trim();
    const errorTitle = String(body?.cognitiveError?.title ?? "").trim();
    const errorDescription = String(body?.cognitiveError?.detail ?? "").trim();

    if (!title || !triggerText || !emotion || !automaticThought || !alternativeThought) {
      return json(res, 400, { error: "필수 입력값이 누락되었습니다." });
    }

    const supabase = supabaseServiceClient();

    const { data: note, error: noteError } = await supabase
      .from(NOTES_TABLE)
      .insert({
        user_id: user.id,
        title,
        trigger_text: triggerText,
        behavior: "",
      })
      .select("id")
      .single();

    if (noteError || !note) {
      throw new Error(noteError?.message || "note_create_failed");
    }

    const noteId = note.id;

    const { error: detailError } = await supabase
      .from(DETAILS_TABLE)
      .insert({
        user_id: user.id,
        note_id: noteId,
        automatic_thought: automaticThought,
        emotion,
      });

    if (detailError) {
      throw new Error(detailError.message || "detail_create_failed");
    }

    if (errorTitle) {
      const { error: errorDetail } = await supabase
        .from(ERRORS_TABLE)
        .insert({
          user_id: user.id,
          note_id: noteId,
          error_label: errorTitle,
          error_description: errorDescription,
        });
      if (errorDetail) {
        throw new Error(errorDetail.message || "error_create_failed");
      }
    }

    const { error: alternativeError } = await supabase
      .from(ALTERNATIVES_TABLE)
      .insert({
        user_id: user.id,
        note_id: noteId,
        alternative: alternativeThought,
      });

    if (alternativeError) {
      throw new Error(alternativeError.message || "alternative_create_failed");
    }

    return json(res, 200, { success: true, noteId: String(noteId) });
  } catch (e: any) {
    console.error("[/api/minimal-emotion-note] error:", e);
    return json(res, 500, { error: e?.message || "Internal Server Error" });
  }
}
