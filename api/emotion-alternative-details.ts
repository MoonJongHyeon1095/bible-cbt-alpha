import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors, json, readJson, requireAppKey } from "./_utils";
import { getAuthUser, supabaseServiceClient } from "./_supabaseAuth";

const TABLE = "emotion_alternative_details";
const NOTES_TABLE = "emotion_notes";

function mapAlternative(row: any) {
  const emotionNotes = Array.isArray(row.emotion_notes)
    ? row.emotion_notes[0]
    : row.emotion_notes;
  return {
    id: String(row.id),
    noteId: String(row.note_id),
    alternative: row.alternative ?? "",
    createdAt: row.created_at ?? "",
    noteTitle: emotionNotes?.title ?? "",
    noteTrigger: emotionNotes?.trigger_text ?? "",
  };
}

function getOwnerUserId(row: any) {
  const emotionNotes = Array.isArray(row?.emotion_notes)
    ? row.emotion_notes[0]
    : row?.emotion_notes;
  return (emotionNotes as { user_id?: string } | undefined)?.user_id;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (handleCors(req, res)) return;
    if (!requireAppKey(req)) return json(res, 401, { error: "Unauthorized" });
    const user = await getAuthUser(req);
    if (!user) return json(res, 401, { error: "Unauthorized" });

    const supabase = supabaseServiceClient();

    if (req.method === "GET") {
      const noteId = req.query.noteId as string | undefined;

      const query = supabase
        .from(TABLE)
        .select(
          "id, note_id, alternative, created_at, emotion_notes (title, trigger_text, user_id)"
        )
        .order("created_at", { ascending: false });

      if (noteId) {
        const numericId = Number(noteId);
        query.eq("note_id", Number.isNaN(numericId) ? noteId : numericId);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      const filtered = (data ?? []).filter(
        (row) => getOwnerUserId(row) === user.id
      );

      return json(res, 200, { alternatives: filtered.map(mapAlternative) });
    }

    if (req.method === "POST") {
      const body = await readJson(req);
      const noteIdRaw = body?.noteId;
      const alternative = String(body?.alternative ?? "").trim();

      if (!noteIdRaw) return json(res, 400, { error: "noteId가 필요합니다." });
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
          alternative,
        })
        .select(
          "id, note_id, alternative, created_at, emotion_notes (title, trigger_text)"
        )
        .single();

      if (error) throw new Error(error.message);
      return json(res, 200, { alternative: mapAlternative(data) });
    }

    if (req.method === "PATCH") {
      const body = await readJson(req);
      const id = body?.id;
      if (!id) return json(res, 400, { error: "id가 필요합니다." });

      const update = {
        alternative:
          body?.alternative != null ? String(body.alternative) : undefined,
      };
      if (update.alternative === undefined) {
        return json(res, 400, { error: "업데이트할 값이 없습니다." });
      }

      const numericId = Number(id);
      const { data: existing, error: fetchError } = await supabase
        .from(TABLE)
        .select(
          "id, note_id, alternative, created_at, emotion_notes!inner(user_id, title, trigger_text)"
        )
        .eq("id", Number.isNaN(numericId) ? id : numericId)
        .single();

      if (fetchError || !existing)
        return json(res, 404, { error: "대안사고를 찾을 수 없습니다." });
      const owner = getOwnerUserId(existing);
      if (owner !== user.id) return json(res, 403, { error: "권한이 없습니다." });

      const { data, error } = await supabase
        .from(TABLE)
        .update(update)
        .eq("id", Number.isNaN(numericId) ? id : numericId)
        .select(
          "id, note_id, alternative, created_at, emotion_notes (title, trigger_text)"
        )
        .single();

      if (error) throw new Error(error.message);
      return json(res, 200, { alternative: mapAlternative(data) });
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
        return json(res, 404, { error: "대안사고를 찾을 수 없습니다." });

      const owner = getOwnerUserId(existing);
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
    console.error("[/api/emotion-alternative-details] error:", e);
    return json(res, 500, { error: e?.message || "Internal Server Error" });
  }
}
