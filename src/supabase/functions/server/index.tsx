// src/supabase/functions/server/index.tsx
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use("*", logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

// Health check endpoint
app.get("/make-server-4ba10e96/health", (c) => {
  return c.json({ status: "ok" });
});

// Gemini API 프록시 엔드포인트
app.post("/make-server-4ba10e96/gemini", async (c) => {
  try {
    const { prompt, systemPrompt } = await c.req.json();

    if (!prompt) {
      return c.json({ error: "prompt is required" }, 400);
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.");
      return c.json(
        { error: "Server configuration error: API key not found" },
        500
      );
    }

    // 재시도 로직: 최대 3번 시도
    const maxRetries = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Gemini API 호출 시도 ${attempt}/${maxRetries}`);

        // 첫 번째 시도가 아니면 대기 (지수 백오프, 더 긴 대기 시간)
        if (attempt > 1) {
          const waitTime = Math.min(5000 * Math.pow(2, attempt - 2), 60000); // 5초, 10초, 20초 (최대 60초)
          console.log(`${waitTime}ms 대기 후 재시도...`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }

        // 시스템 프롬프트가 있으면 systemInstruction으로 전달
        const requestBody: any = {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        };

        // systemPrompt가 제공된 경우 systemInstruction으로 추가
        if (systemPrompt) {
          requestBody.systemInstruction = {
            parts: [{ text: systemPrompt }],
          };
        }

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          }
        );

        const data = await response.json();

        // 429 (할당량 초과) 오류인 경우
        if (response.status === 429) {
          lastError = data;
          console.error(
            `Gemini API 할당량 초과 (시도 ${attempt}/${maxRetries}):`,
            JSON.stringify(data)
          );

          // RetryInfo에서 권장 대기 시간 추출
          let retryAfterSeconds = 60; // 기본값 1분
          if (data.error?.details) {
            const retryInfo = data.error.details.find((d: any) =>
              d["@type"]?.includes("RetryInfo")
            );
            if (retryInfo?.retryDelay) {
              const match = retryInfo.retryDelay.match(/(\d+(\.\d+)?)/);
              if (match) {
                retryAfterSeconds = Math.ceil(parseFloat(match[1]));
              }
            }
          }

          // 마지막 시도가 아니고 대기 시간이 합리적이면 재시도
          if (attempt < maxRetries && retryAfterSeconds <= 60) {
            console.log(`API 권장 대기 시간: ${retryAfterSeconds}초`);
            await new Promise((resolve) =>
              setTimeout(resolve, retryAfterSeconds * 1000)
            );
            continue;
          }

          // 마지막 시도도 실패하거나 대기 시간이 너무 길면 사용자 친화적 오류 메시지 반환
          return c.json(
            {
              error: `AI 서버의 일일 사용량을 초과했습니다. ${
                retryAfterSeconds > 3600
                  ? "내일"
                  : `약 ${Math.ceil(retryAfterSeconds / 60)}분 후`
              } 다시 시도해주세요.\n\n자주 사용하신다면 Google AI Studio에서 새로운 API 키를 발급받아 설정하시는 것을 권장드립니다.`,
              details: data,
              retryable: true,
              retryAfterSeconds,
            },
            429
          );
        }

        // 503 (서비스 과부하) 오류인 경우
        if (response.status === 503) {
          lastError = data;
          console.error(
            `Gemini API 서비스 과부하 (시도 ${attempt}/${maxRetries}):`,
            JSON.stringify(data)
          );

          // 마지막 시도가 아니면 계속 재시도
          if (attempt < maxRetries) {
            continue;
          }

          // 마지막 시도도 실패하면 사용자 친화적 오류 메시지 반환
          return c.json(
            {
              error:
                "AI 서버가 현재 사용량이 많습니다. 1-2분 후 다시 시도해주세요.",
              details: data,
              retryable: true,
            },
            503
          );
        }

        // 성공하지 않은 다른 오류
        if (!response.ok) {
          console.error(
            `Gemini API 오류 (상태 ${response.status}):`,
            JSON.stringify(data)
          );
          return c.json(
            {
              error: `AI 요청 처리 중 오류가 발생했습니다. (상태: ${response.status})`,
              details: data,
            },
            response.status
          );
        }

        // 성공
        console.log(`Gemini API 호출 성공 (시도 ${attempt}/${maxRetries})`);
        return c.json(data);
      } catch (fetchError) {
        lastError = fetchError;
        console.error(
          `Gemini API 호출 중 네트워크 오류 (시도 ${attempt}/${maxRetries}):`,
          fetchError
        );

        // 마지막 시도가 아니면 재시도
        if (attempt < maxRetries) {
          continue;
        }
      }
    }

    // 모든 재시도 실패
    console.error("Gemini API 모든 재시도 실패:", lastError);
    return c.json(
      {
        error:
          "AI 서버 연결에 실패했습니다. 인터넷 연결을 확인하고 잠시 후 다시 시도해주세요.",
        retryable: true,
      },
      503
    );
  } catch (error) {
    console.error("Gemini API 요청 처리 중 예상치 못한 오류:", error);
    return c.json(
      {
        error: "요청 처리 중 오류가 발생했습니다. 다시 시도해주세요.",
        details: error.message,
      },
      500
    );
  }
});

// OpenAI(GPT) API 프록시 엔드포인트
app.post("/make-server-4ba10e96/gpt", async (c) => {
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

    // ✅ 프론트(gpt/client.ts)가 기대하는 형태: _text
    return c.json({ ...data, _text: text });
  } catch (error: any) {
    return c.json(
      { error: "Unexpected error", details: error?.message ?? String(error) },
      500
    );
  }
});

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

// 댓글 불러오기 (GET)
app.get("/make-server-4ba10e96/comments", async (c) => {
  try {
    const comments = await kv.getByPrefix("comment:");

    // 최신순으로 정렬
    const sortedComments = comments.sort((a, b) => b.timestamp - a.timestamp);

    return c.json({ comments: sortedComments });
  } catch (error) {
    console.error("댓글 불러오기 오류:", error);
    return c.json({ error: error.message || "Internal server error" }, 500);
  }
});

// 댓글 작성 (POST)
app.post("/make-server-4ba10e96/comments", async (c) => {
  try {
    const { rating, comment, nickname } = await c.req.json();

    if (!rating || rating < 1 || rating > 5) {
      return c.json({ error: "별점은 1-5 사이여야 합니다." }, 400);
    }

    if (!comment || !comment.trim()) {
      return c.json({ error: "댓글 내용을 입력해주세요." }, 400);
    }

    // 고유 ID 생성 (타임스탬프 + 랜덤)
    const id = `comment:${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const commentData = {
      id,
      rating: Number(rating),
      comment: comment.trim(),
      nickname: nickname?.trim() || "익명",
      timestamp: Date.now(),
    };

    await kv.set(id, commentData);

    return c.json({ success: true, comment: commentData });
  } catch (error) {
    console.error("댓글 작성 오류:", error);
    return c.json({ error: error.message || "Internal server error" }, 500);
  }
});

Deno.serve(app.fetch);
