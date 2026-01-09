import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors, json, readJson, requireAppKey } from "./_utils";
import { getAuthUser, supabaseServiceClient } from "./_supabaseAuth";

const TABLE = "emotion_error_details";
const NOTES_TABLE = "emotion_notes";

function mapError(row: any) {
  return {
    id: String(row.id),
    noteId: String(row.note_id),
    errorLabel: row.error_label ?? "",
    errorDescription: row.error_description ?? "",
    createdAt: row.created_at ?? "",
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (handleCors(req, res)) return;
    if (!requireAppKey(req)) return json(res, 401, { error: "Unauthorized" });
    const user = await getAuthUser(req);
    if (!user) return json(res, 401, { error: "Unauthorized" });

    const supabase = supabaseServiceClient();

    if (req.method === "POST") {
      const body = await readJson(req);
      const noteIdRaw = body?.noteId;
      const errors: Array<{ errorLabel?: string; errorDescription?: string }> =
        Array.isArray(body?.errors) ? body.errors : [];

      if (!noteIdRaw) return json(res, 400, { error: "noteId가 필요합니다." });
      if (errors.length === 0)
        return json(res, 400, { error: "errors가 필요합니다." });

      const numericNoteId = Number(noteIdRaw);
      const noteId = Number.isNaN(numericNoteId) ? noteIdRaw : numericNoteId;

      const { data: noteRow, error: noteError } = await supabase
        .from(NOTES_TABLE)
        .select("id")
        .eq("id", noteId)
        .eq("user_id", user.id)
        .single();

      if (noteError || !noteRow)
        return json(res, 404, { error: "노트를 찾을 수 없습니다." });

      const rows = errors
        .map((item) => ({
          error_label: String(item?.errorLabel ?? "").trim(),
          error_description: String(item?.errorDescription ?? "").trim(),
        }))
        .filter((item) => item.error_label || item.error_description)
        .map((item) => ({
          user_id: user.id,
          note_id: noteId,
          error_label: item.error_label,
          error_description: item.error_description,
        }));

      if (rows.length === 0)
        return json(res, 400, { error: "errors가 비어 있습니다." });

      const { data, error } = await supabase
        .from(TABLE)
        .insert(rows)
        .select("id, note_id, error_label, error_description, created_at");

      if (error) throw new Error(error.message);
      return json(res, 200, { errors: (data ?? []).map(mapError) });
    }

    if (req.method === "PATCH") {
      const body = await readJson(req);
      const id = body?.id;
      if (!id) return json(res, 400, { error: "id가 필요합니다." });

      const update = {
        error_label:
          body?.errorLabel != null ? String(body.errorLabel) : undefined,
        error_description:
          body?.errorDescription != null
            ? String(body.errorDescription)
            : undefined,
      };
      if (
        update.error_label === undefined &&
        update.error_description === undefined
      ) {
        return json(res, 400, { error: "업데이트할 값이 없습니다." });
      }

      const numericId = Number(id);
      const { data: existing, error: fetchError } = await supabase
        .from(TABLE)
        .select("id, emotion_notes!inner(user_id)")
        .eq("id", Number.isNaN(numericId) ? id : numericId)
        .single();

      if (fetchError || !existing)
        return json(res, 404, { error: "인지오류를 찾을 수 없습니다." });
      const owner = Array.isArray(existing.emotion_notes)
        ? existing.emotion_notes[0]?.user_id
        : (existing.emotion_notes as { user_id?: string } | undefined)?.user_id;
      if (owner !== user.id) return json(res, 403, { error: "권한이 없습니다." });

      const { data, error } = await supabase
        .from(TABLE)
        .update(update)
        .eq("id", Number.isNaN(numericId) ? id : numericId)
        .select("id, note_id, error_label, error_description, created_at")
        .single();

      if (error) throw new Error(error.message);
      return json(res, 200, { errorDetail: mapError(data) });
    }

    if (req.method === "DELETE") {
      const id = req.query.id as string | undefined;
      if (!id) return json(res, 400, { error: "id가 필요합니다." });

      const numericId = Number(id);
      const { data: existing, error: fetchError } = await supabase
        .from(TABLE)
        .select("id, emotion_notes!inner(user_id)")
        .eq("id", Number.isNaN(numericId) ? id : numericId)
        .single();

      if (fetchError || !existing)
        return json(res, 404, { error: "인지오류를 찾을 수 없습니다." });

      const owner = Array.isArray(existing.emotion_notes)
        ? existing.emotion_notes[0]?.user_id
        : (existing.emotion_notes as { user_id?: string } | undefined)?.user_id;
      if (owner !== user.id) return json(res, 403, { error: "권한이 없습니다." });

      const { error } = await supabase
        .from(TABLE)
        .delete()
        .eq("id", Number.isNaN(numericId) ? id : numericId);

      if (error) throw new Error(error.message);
      return json(res, 200, { success: true });
    }

    return json(res, 405, { error: "Method Not Allowed" });
  } catch (e: any) {
    console.error("[/api/emotion-error-details] error:", e);
    return json(res, 500, { error: e?.message || "Internal Server Error" });
  }
}
