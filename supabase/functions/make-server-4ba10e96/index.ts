// supabase/functions/make-server-4ba10e96/index.ts
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.ts";

// ✅ Supabase가 전달하는 함수 이름
const FUNCTION_NAME =
  Deno.env.get("SUPABASE_FUNCTION_NAME") ?? "make-server-4ba10e96";

// ✅ basePath를 명시적으로 설정
const app = new Hono().basePath(`/${FUNCTION_NAME}`);

// middlewares
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

// ---------- routes ----------

app.get("/health", (c) => c.json({ status: "ok" }));

app.post("/gpt", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const prompt = body?.prompt;
    const systemPrompt = body?.systemPrompt;

    if (!prompt || typeof prompt !== "string") {
      return c.json({ error: "prompt is required" }, 400);
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return c.json(
        { error: "Server configuration error: OPENAI_API_KEY not found" },
        500
      );
    }

    const input = systemPrompt
      ? [
          { role: "system", content: String(systemPrompt) },
          { role: "user", content: prompt },
        ]
      : [{ role: "user", content: prompt }];

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input,
        temperature: 0.7,
        max_output_tokens: 1200,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return c.json(
        {
          error: `AI request failed (status: ${response.status})`,
          details: data,
        },
        response.status
      );
    }

    const text =
      typeof data?.output_text === "string"
        ? data.output_text
        : extractTextFromResponsesPayload(data) ?? "";

    return c.json({ ...data, _text: text });
  } catch (err: any) {
    return c.json(
      { error: "Unexpected error", details: err?.message ?? String(err) },
      500
    );
  }
});

app.get("/comments", async () => {
  const comments = await kv.getByPrefix("comment:");
  return Response.json({
    comments: comments.sort((a: any, b: any) => b.timestamp - a.timestamp),
  });
});

app.post("/comments", async (c) => {
  const body = await c.req.json();
  const rating = Number(body?.rating);
  const comment = String(body?.comment ?? "").trim();
  const nickname = String(body?.nickname ?? "익명").trim();

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return c.json({ error: "별점은 1-5 사이여야 합니다." }, 400);
  }
  if (!comment) {
    return c.json({ error: "댓글 내용을 입력해주세요." }, 400);
  }

  const id = `comment:${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

  const data = {
    id,
    rating,
    comment,
    nickname,
    timestamp: Date.now(),
  };

  await kv.set(id, data);
  return c.json({ success: true, comment: data });
});

// ✅ Supabase Edge Functions entrypoint
export default app;

// ---------- helpers ----------

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
