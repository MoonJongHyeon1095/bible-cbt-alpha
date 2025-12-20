// api/gemini.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { json, readJson, requireAppKey } from "./_utils";

function extractTextFromGeminiPayload(payload: any): string {
  const t = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  return typeof t === "string" ? t.trim() : "";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return json(res, 405, { error: "Method Not Allowed" });
  if (!requireAppKey(req)) return json(res, 401, { error: "Unauthorized" });

  const body = await readJson(req);
  const prompt = body?.prompt;
  const systemPrompt = body?.systemPrompt;

  if (!prompt || typeof prompt !== "string") return json(res, 400, { error: "prompt is required" });
  if (prompt.length > 8000) return json(res, 400, { error: "prompt too long" });

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Vercel env
  if (!GEMINI_API_KEY) return json(res, 500, { error: "GEMINI_API_KEY not found" });

  // ✅ 모델/엔드포인트는 네가 쓰는 Gemini 모델에 맞게 조절
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  // systemPrompt를 "role: system" 같은 형태로 직접 지원하지 않는 경우가 많아서
  // 보통은 contents에 섞거나, 별도 instruction 필드가 있는 최신 스펙을 따름.
  // 여기서는 가장 단순하게 합쳐서 보냄.
  const merged =
    systemPrompt ? `SYSTEM:\n${String(systemPrompt)}\n\nUSER:\n${prompt}` : prompt;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: merged }] }],
      // generationConfig: { temperature: 0.7, maxOutputTokens: 1200 }, // 필요시
    }),
  });

  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    // ✅ Retry-After 헤더가 있으면 seconds로 내려줌
    const retryAfter = resp.headers.get("retry-after");
    const retryAfterSeconds = retryAfter ? Number(retryAfter) : undefined;

    return json(res, resp.status, {
      error: `Gemini request failed (status: ${resp.status})`,
      retryAfterSeconds: Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : undefined,
      details: data,
    });
  }

  const text = extractTextFromGeminiPayload(data);
  return json(res, 200, { ...data, _text: text });
}
