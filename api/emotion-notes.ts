import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors, json, readJson, requireAppKey } from "./_utils";
import { getAuthUser, supabaseServiceClient } from "./_supabaseAuth";

const TABLE = "emotion_notes";

function mapNote(row: any) {
  const detailsRaw = row.emotion_note_details ?? [];
  const alternativesRaw = row.emotion_alternative_details ?? [];
  const details = Array.isArray(detailsRaw)
    ? detailsRaw.map((d: any) => ({
        id: String(d.id),
        noteId: String(d.note_id ?? row.id),
        automaticThought: d.automatic_thought ?? "",
        emotion: d.emotion ?? "",
        createdAt: d.created_at ?? "",
      }))
    : [];
  const alternatives = Array.isArray(alternativesRaw)
    ? alternativesRaw.map((a: any) => ({
        id: String(a.id),
        noteId: String(a.note_id ?? row.id),
        alternative: a.alternative ?? "",
        createdAt: a.created_at ?? "",
      }))
    : [];

  return {
    id: String(row.id),
    title: row.title ?? "",
    trigger: row.trigger_text ?? "",
    behavior: row.behavior ?? "",
    frequency: Number(row.frequency) || 1,
    createdAt: row.created_at ?? "",
    details,
    alternatives,
  };
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
      const includeDetails = (req.query.includeDetails as string | undefined) === "true";

      const selectColumns = includeDetails
        ? "id, title, trigger_text, behavior, frequency, created_at, emotion_note_details (id, note_id, automatic_thought, emotion, created_at), emotion_alternative_details (id, note_id, alternative, created_at)"
        : "id, title, trigger_text, behavior, frequency, created_at";

      const selectQuery = supabase
        .from(TABLE)
        .select(selectColumns)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (noteId) {
        const numericId = Number(noteId);
        selectQuery.eq("id", Number.isNaN(numericId) ? noteId : numericId);
      }

      const { data, error } = await selectQuery;
      if (error) throw new Error(error.message);

      return json(res, 200, { notes: (data ?? []).map(mapNote) });
    }

    if (req.method === "POST") {
      const body = await readJson(req);
      const title = String(body?.title ?? "").trim();
      const trigger = String(body?.trigger ?? "").trim();
      const behavior = String(body?.behavior ?? "").trim();

      if (!title || !trigger) {
        return json(res, 400, { error: "title과 trigger가 필요합니다." });
      }

      const { data, error } = await supabase
        .from(TABLE)
        .insert({
          user_id: user.id,
          title,
          trigger_text: trigger,
          behavior,
        })
        .select(
          "id, title, trigger_text, behavior, frequency, created_at, emotion_note_details (id, note_id, automatic_thought, emotion, created_at), emotion_alternative_details (id, note_id, alternative, created_at)"
        )
        .single();

      if (error) throw new Error(error.message);
      return json(res, 200, { note: mapNote(data) });
    }

    if (req.method === "PATCH") {
      const body = await readJson(req);
      const id = body?.id;
      const title = body?.title;
      const trigger = body?.trigger;
      const behavior = body?.behavior;
      const frequency = body?.frequency;

      if (!id) return json(res, 400, { error: "id가 필요합니다." });

      const numericId = Number(id);
      const update = selectDefined({
        title: title != null ? String(title) : undefined,
        trigger_text: trigger != null ? String(trigger) : undefined,
        behavior: behavior != null ? String(behavior) : undefined,
        frequency:
          frequency != null && Number.isFinite(Number(frequency))
            ? Number(frequency)
            : undefined,
      });

      if (Object.keys(update).length === 0) {
        return json(res, 400, { error: "업데이트할 값이 없습니다." });
      }

      const { data, error } = await supabase
        .from(TABLE)
        .update(update)
        .eq("user_id", user.id)
        .eq("id", Number.isNaN(numericId) ? id : numericId)
        .select(
          "id, title, trigger_text, behavior, frequency, created_at, emotion_note_details (id, note_id, automatic_thought, emotion, created_at), emotion_alternative_details (id, note_id, alternative, created_at)"
        )
        .single();

      if (error) throw new Error(error.message);
      return json(res, 200, { note: mapNote(data) });
    }

    if (req.method === "DELETE") {
      const noteId = req.query.id as string | undefined;
      if (!noteId) return json(res, 400, { error: "id가 필요합니다." });

      const numericId = Number(noteId);
      const { error } = await supabase
        .from(TABLE)
        .delete()
        .eq("user_id", user.id)
        .eq("id", Number.isNaN(numericId) ? noteId : numericId);

      if (error) throw new Error(error.message);
      return json(res, 200, { success: true });
    }

    return json(res, 405, { error: "Method Not Allowed" });
  } catch (e: any) {
    console.error("[/api/emotion-notes] error:", e);
    return json(res, 500, { error: e?.message || "Internal Server Error" });
  }
}

function selectDefined(obj: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  );
}
