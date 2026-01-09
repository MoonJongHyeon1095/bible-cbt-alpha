import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors, json, readJson, requireAppKey } from "./_utils";
import { getAuthUser, supabaseServiceClient } from "./_supabaseAuth";

const TABLE = "emotion_behavior_details";
const NOTES_TABLE = "emotion_notes";

function mapBehavior(row: any) {
  return {
    id: String(row.id),
    noteId: String(row.note_id),
    behaviorLabel: row.behavior_label ?? "",
    behaviorDescription: row.behavior_description ?? "",
    errorTags: row.error_tags ?? [],
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
      const behaviorLabel = String(body?.behaviorLabel ?? "").trim();
      const behaviorDescription = String(body?.behaviorDescription ?? "").trim();
      const errorTagsRaw = Array.isArray(body?.errorTags)
        ? body.errorTags
        : [];
      const errorTags = errorTagsRaw
        .map((tag: unknown) => String(tag ?? "").trim())
        .filter(Boolean);

      if (!noteIdRaw) return json(res, 400, { error: "noteId가 필요합니다." });
      if (!behaviorLabel)
        return json(res, 400, { error: "behaviorLabel이 필요합니다." });
      if (!behaviorDescription)
        return json(res, 400, { error: "behaviorDescription이 필요합니다." });

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

      const { data, error } = await supabase
        .from(TABLE)
        .insert({
          user_id: user.id,
          note_id: noteId,
          behavior_label: behaviorLabel,
          behavior_description: behaviorDescription,
          error_tags: errorTags,
        })
        .select(
          "id, note_id, behavior_label, behavior_description, error_tags, created_at"
        )
        .single();

      if (error) throw new Error(error.message);
      return json(res, 200, { behavior: mapBehavior(data) });
    }

    if (req.method === "PATCH") {
      const body = await readJson(req);
      const id = body?.id;
      if (!id) return json(res, 400, { error: "id가 필요합니다." });

      const errorTagsRaw = Array.isArray(body?.errorTags)
        ? body.errorTags
        : undefined;
      const update = {
        behavior_label:
          body?.behaviorLabel != null ? String(body.behaviorLabel) : undefined,
        behavior_description:
          body?.behaviorDescription != null
            ? String(body.behaviorDescription)
            : undefined,
        error_tags: errorTagsRaw
          ? errorTagsRaw
              .map((tag: unknown) => String(tag ?? "").trim())
              .filter(Boolean)
          : undefined,
      };
      if (
        update.behavior_label === undefined &&
        update.behavior_description === undefined &&
        update.error_tags === undefined
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
        return json(res, 404, { error: "행동을 찾을 수 없습니다." });
      const owner =
        Array.isArray(existing.emotion_notes) && existing.emotion_notes.length
          ? existing.emotion_notes[0]?.user_id
          : existing.emotion_notes?.user_id;
      if (owner !== user.id) return json(res, 403, { error: "권한이 없습니다." });

      const { data, error } = await supabase
        .from(TABLE)
        .update(update)
        .eq("id", Number.isNaN(numericId) ? id : numericId)
        .select(
          "id, note_id, behavior_label, behavior_description, error_tags, created_at"
        )
        .single();

      if (error) throw new Error(error.message);
      return json(res, 200, { behavior: mapBehavior(data) });
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
        return json(res, 404, { error: "행동을 찾을 수 없습니다." });

      const owner =
        Array.isArray(existing.emotion_notes) && existing.emotion_notes.length
          ? existing.emotion_notes[0]?.user_id
          : existing.emotion_notes?.user_id;
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
    console.error("[/api/emotion-behavior-details] error:", e);
    return json(res, 500, { error: e?.message || "Internal Server Error" });
  }
}
