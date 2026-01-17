import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors, json, readJson, requireAppKey } from "./_utils";
import { getAuthUser, supabaseServiceClient } from "./_supabaseAuth";

const NOTES_TABLE = "emotion_notes";
const DETAILS_TABLE = "emotion_note_details";
const ERRORS_TABLE = "emotion_error_details";
const ALTERNATIVES_TABLE = "emotion_alternative_details";
const BEHAVIORS_TABLE = "emotion_behavior_details";

type IncomingError = {
  errorLabel: string;
  errorDescription?: string;
};

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
    const noteIdRaw = body?.noteId;
    const title = String(body?.title ?? "").trim();
    const triggerText = String(body?.triggerText ?? "").trim();
    const emotion = String(body?.emotion ?? "").trim();
    const automaticThought = String(body?.automaticThought ?? "").trim();
    const alternativeThought = String(body?.alternativeThought ?? "").trim();
    const behaviorLabel = String(body?.behavior?.behaviorLabel ?? "").trim();
    const behaviorDescription = String(body?.behavior?.behaviorText ?? "").trim();
    const errors = Array.isArray(body?.errors)
      ? (body.errors as IncomingError[])
      : [];

    if (!triggerText || !emotion || !automaticThought || !alternativeThought) {
      return json(res, 400, { error: "필수 입력값이 누락되었습니다." });
    }

    const supabase = supabaseServiceClient();
    let noteId: string | number | null = null;

    if (noteIdRaw != null && noteIdRaw !== "") {
      const numericId = Number(noteIdRaw);
      const resolvedId = Number.isNaN(numericId) ? noteIdRaw : numericId;
      const { data: existing } = await supabase
        .from(NOTES_TABLE)
        .select("id")
        .eq("id", resolvedId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (existing?.id) {
        noteId = existing.id;
      }
    }

    if (!noteId) {
      const { data: created, error: noteError } = await supabase
        .from(NOTES_TABLE)
        .insert({
          user_id: user.id,
          title,
          trigger_text: triggerText,
          behavior: "",
        })
        .select("id")
        .single();
      if (noteError || !created) {
        throw new Error(noteError?.message || "note_create_failed");
      }
      noteId = created.id;
    }

    const { error: detailError } = await supabase
      .from(DETAILS_TABLE)
      .insert({
        user_id: user.id,
        note_id: noteId,
        automatic_thought: automaticThought,
        emotion,
      });
    if (detailError) throw new Error(detailError.message || "detail_failed");

    if (errors.length > 0) {
      const rows = errors.map((item) => ({
        user_id: user.id,
        note_id: noteId,
        error_label: String(item.errorLabel ?? "").trim(),
        error_description: String(item.errorDescription ?? "").trim(),
      }));
      const { error: errorInsert } = await supabase
        .from(ERRORS_TABLE)
        .insert(rows);
      if (errorInsert) {
        throw new Error(errorInsert.message || "error_failed");
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
      throw new Error(alternativeError.message || "alternative_failed");
    }

    if (behaviorLabel || behaviorDescription) {
      const { error: behaviorError } = await supabase
        .from(BEHAVIORS_TABLE)
        .insert({
          user_id: user.id,
          note_id: noteId,
          behavior_label: behaviorLabel,
          behavior_description: behaviorDescription,
        });
      if (behaviorError) {
        throw new Error(behaviorError.message || "behavior_failed");
      }
    }

    return json(res, 200, { success: true, noteId: String(noteId) });
  } catch (e: any) {
    console.error("[/api/cbt-session-complete] error:", e);
    return json(res, 500, { error: e?.message || "Internal Server Error" });
  }
}
