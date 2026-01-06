// api/comments.ts
import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors, json, readJson, requireAppKey } from "./_utils";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const TABLE = "comments";

function supabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (handleCors(req, res)) return;
    if (!requireAppKey(req)) return json(res, 401, { error: "Unauthorized" });

    const supabase = supabaseClient();

    if (req.method === "GET") {
      const { data, error } = await supabase
        .from(TABLE)
        .select("id, rating, comment, nickname, timestamp")
        .order("timestamp", { ascending: false });

      if (error) throw new Error(error.message);

      const comments = (data ?? []).map((c) => ({
        id: String(c.id),
        rating: Number(c.rating) || 0,
        comment: String(c.comment ?? ""),
        nickname: String(c.nickname ?? "익명"),
        timestamp: Number(c.timestamp ?? 0),
      }));

      return json(res, 200, { comments });
    }

    if (req.method === "POST") {
      const body = await readJson(req);
      const rating = Number(body?.rating);
      const comment = String(body?.comment ?? "").trim();
      const nickname = String(body?.nickname ?? "익명").trim();

      if (!Number.isFinite(rating) || rating < 1 || rating > 5)
        return json(res, 400, { error: "별점은 1-5 사이여야 합니다." });
      if (!comment) return json(res, 400, { error: "댓글 내용을 입력해주세요." });
      if (comment.length > 1000) return json(res, 400, { error: "댓글이 너무 깁니다." });
      if (nickname.length > 30) return json(res, 400, { error: "닉네임이 너무 깁니다." });

      const now = Date.now();
      const id = `comment:${now}_${Math.random().toString(36).slice(2, 11)}`;
      const data = { id, rating, comment, nickname, timestamp: now };

      const { error } = await supabase.from(TABLE).insert(data);
      if (error) throw new Error(error.message);

      return json(res, 200, { success: true, comment: data });
    }

    return json(res, 405, { error: "Method Not Allowed" });
  } catch (e: any) {
    console.error("[/api/comments] error:", e);
    return json(res, 500, {
      error: e?.message || "Internal Server Error",
      // 디버그용: 로컬에서만 확인하고 싶으면 details 추가
      details: String(e?.stack || ""),
    });
  }
}
