

// api/comments.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as kv from "./_kv";
import { json, readJson, requireAppKey } from "./_utils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!requireAppKey(req)) return json(res, 401, { error: "Unauthorized" });

    if (req.method === "GET") {
      const comments = await kv.getByPrefix("comment:");
      comments.sort((a: any, b: any) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
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

      const id = `comment:${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      const data = { id, rating, comment, nickname, timestamp: Date.now() };

      await kv.set(id, data);
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
