import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors, json, readJson, requireAppKey } from "./_utils";
import { getAuthUser, supabaseServiceClient } from "./_supabaseAuth";

const DETAILS_TABLE = "emotion_note_details";
const NOTES_TABLE = "emotion_notes";

function mapDetail(row: any) {
  const emotionNotes = Array.isArray(row.emotion_notes)
    ? row.emotion_notes[0]
    : row.emotion_notes;
  return {
    id: String(row.id),
    noteId: String(row.note_id),
    automaticThought: row.automatic_thought ?? "",
    emotion: row.emotion ?? "",
    alternative: "",
    createdAt: row.created_at ?? "",
    noteTitle: emotionNotes?.title ?? "",
    noteTrigger: emotionNotes?.trigger_text ?? "",
  };
}

function getOwnerUserId(row: any) {
  const emotionNotes = Array.isArray(row?.emotion_notes)
    ? row.emotion_notes[0]
    : row?.emotion_notes;
  return emotionNotes?.user_id;
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
  const detailQuery = supabase
    .from(DETAILS_TABLE)
    .select(
      "id, note_id, automatic_thought, emotion, created_at, emotion_notes (title, trigger_text, user_id)"
    )
        .order("created_at", { ascending: false });

      if (noteId) {
        const numericId = Number(noteId);
        detailQuery.eq("note_id", Number.isNaN(numericId) ? noteId : numericId);
      }

      const { data, error } = await detailQuery;
      if (error) throw new Error(error.message);

      const filtered = (data ?? []).filter(
        (d) => getOwnerUserId(d) === user.id
      );

      return json(res, 200, { details: filtered.map(mapDetail) });
    }

    if (req.method === "POST") {
      const body = await readJson(req);
      const noteIdRaw = body?.noteId;
      const automaticThought = String(body?.automaticThought ?? "").trim();
      const emotion = String(body?.emotion ?? "").trim();

      if (!noteIdRaw) return json(res, 400, { error: "noteId가 필요합니다." });
      const numericNoteId = Number(noteIdRaw);
      const noteId = Number.isNaN(numericNoteId) ? noteIdRaw : numericNoteId;

      // 소유권 검증
      const { data: noteRow, error: noteError } = await supabase
        .from(NOTES_TABLE)
        .select("id")
        .eq("id", noteId)
        .eq("user_id", user.id)
        .single();

      if (noteError || !noteRow)
        return json(res, 404, { error: "노트를 찾을 수 없습니다." });

      const { data, error } = await supabase
        .from(DETAILS_TABLE)
        .insert({
          user_id: user.id,
          note_id: noteId,
          automatic_thought: automaticThought,
          emotion,
        })
        .select(
          "id, note_id, automatic_thought, emotion, created_at, emotion_notes (title, trigger_text)"
        )
        .single();

      if (error) throw new Error(error.message);
      return json(res, 200, { detail: mapDetail(data) });
    }

    if (req.method === "PATCH") {
      const body = await readJson(req);
      const id = body?.id;
      if (!id) return json(res, 400, { error: "id가 필요합니다." });

      const numericId = Number(id);
      const update = selectDefined({
        automatic_thought:
          body?.automaticThought != null
            ? String(body.automaticThought)
            : undefined,
        emotion: body?.emotion != null ? String(body.emotion) : undefined,
      });

      if (Object.keys(update).length === 0) {
        return json(res, 400, { error: "업데이트할 값이 없습니다." });
      }

      const { data: existing, error: fetchError } = await supabase
        .from(DETAILS_TABLE)
        .select(
          "id, note_id, emotion_notes!inner(user_id, title, trigger_text)"
        )
        .eq("id", Number.isNaN(numericId) ? id : numericId)
        .single();

      if (fetchError || !existing)
        return json(res, 404, { error: "detail을 찾을 수 없습니다." });
      if (getOwnerUserId(existing) !== user.id)
        return json(res, 403, { error: "권한이 없습니다." });

      const { data, error } = await supabase
        .from(DETAILS_TABLE)
        .update(update)
        .eq("id", Number.isNaN(numericId) ? id : numericId)
        .select(
          "id, note_id, automatic_thought, emotion, created_at, emotion_notes (title, trigger_text)"
        )
        .single();

      if (error) throw new Error(error.message);
      return json(res, 200, { detail: mapDetail(data) });
    }

    if (req.method === "DELETE") {
      const id = req.query.id as string | undefined;
      if (!id) return json(res, 400, { error: "id가 필요합니다." });

      const numericId = Number(id);

      const { data: existing, error: fetchError } = await supabase
        .from(DETAILS_TABLE)
        .select("id, note_id, emotion_notes!inner(user_id)")
        .eq("id", Number.isNaN(numericId) ? id : numericId)
        .single();

      if (fetchError || !existing) {
        return json(res, 404, { error: "detail을 찾을 수 없습니다." });
      }

      if (getOwnerUserId(existing) !== user.id) {
        return json(res, 403, { error: "권한이 없습니다." });
      }

      const { error } = await supabase
        .from(DETAILS_TABLE)
        .delete()
        .eq("id", Number.isNaN(numericId) ? id : numericId);

      if (error) throw new Error(error.message);
      return json(res, 200, { success: true });
    }

    return json(res, 405, { error: "Method Not Allowed" });
  } catch (e: any) {
    console.error("[/api/emotion-note-details] error:", e);
    return json(res, 500, { error: e?.message || "Internal Server Error" });
  }
}

function selectDefined(obj: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  );
}
