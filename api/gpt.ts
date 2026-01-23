// api/gpt.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors, json, readJson, requireAppKey } from "./_utils";

function extractTextFromResponsesPayload(payload: any): string | null {
  try {
    const output = payload?.output;
    if (!Array.isArray(output)) return null;
    return output
      .flatMap((o: any) => o?.content ?? [])
      .map((c: any) => c?.text)
      .filter((t: any) => typeof t === "string")
      .join("\n")
      .trim();
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== "POST") return json(res, 405, { error: "Method Not Allowed" });
  if (!requireAppKey(req)) return json(res, 401, { error: "Unauthorized" });

  const body = await readJson(req);
  const prompt = body?.prompt;
  const systemPrompt = body?.systemPrompt;
  const requestedModel = typeof body?.model === "string" ? body.model.trim() : "";

  if (!prompt || typeof prompt !== "string") return json(res, 400, { error: "prompt is required" });
  if (prompt.length > 4000) return json(res, 400, { error: "prompt too long" });

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) return json(res, 500, { error: "OPENAI_API_KEY not found" });

  const input = systemPrompt
    ? [{ role: "system", content: String(systemPrompt) }, { role: "user", content: prompt }]
    : [{ role: "user", content: prompt }];

  const allowedModels = new Set(["gpt-4.1-mini", "gpt-4o-mini", "gpt-5-nano"]);
  const model = allowedModels.has(requestedModel) ? requestedModel : "gpt-4.1-mini";

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      input,
      temperature: 0.3,
      max_output_tokens: 1200,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return json(res, response.status, {
      error: `AI request failed (status: ${response.status})`,
      details: data,
    });
  }

  const text =
    typeof data?.output_text === "string" ? data.output_text : extractTextFromResponsesPayload(data) ?? "";

  return json(res, 200, { ...data, _text: text });
}
