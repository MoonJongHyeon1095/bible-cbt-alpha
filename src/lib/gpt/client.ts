

// src/lib/gpt/client.ts
import { ENV } from "../../config/env";
import { readTokenSessionUsage, writeTokenSessionUsage } from "../../utils/tokenSessionStorage";

const API_BASE = ENV.API_BASE || ""; // same-origin이면 ""

export type GptCallOptions = { systemPrompt?: string; model?: string };

export async function callGptText(prompt: string, opts: GptCallOptions = {}) {
  if (!prompt?.trim()) throw new Error("prompt is required");

  const body: any = { prompt };
  if (opts.systemPrompt) body.systemPrompt = opts.systemPrompt;
  if (opts.model) body.model = opts.model;

  const res = await fetch(`${API_BASE}/api/gpt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // (선택) 남용 방지용. 쓸 거면 VITE_APP_API_KEY도 env로 추가
      // "x-api-key": import.meta.env.VITE_APP_API_KEY,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.error ?? `AI 요청 실패 (status: ${res.status})`;
    const err = new Error(msg);
    (err as any).details = data?.details;
    throw err;
  }

  if (data?.usage) {
    const prevUsage = readTokenSessionUsage() ?? {
      total_tokens: 0,
      input_tokens: 0,
      output_tokens: 0,
      request_count: 0,
    };
    const inputTokens = Number(data.usage.input_tokens || 0);
    const outputTokens = Number(data.usage.output_tokens || 0);
    const totalTokens =
      Number(data.usage.total_tokens || 0) || inputTokens + outputTokens;
    const next = {
      total_tokens: totalTokens + prevUsage.total_tokens,
      input_tokens: inputTokens + prevUsage.input_tokens,
      output_tokens: outputTokens + prevUsage.output_tokens,
      request_count: prevUsage.request_count + 1,
    };
    // 지우지 마라 이거
    console.log('inputTokens', next.input_tokens, 'outputTokens', next.output_tokens, 'totalTokens', next.total_tokens, 'requestCount', next.request_count);

    writeTokenSessionUsage(next);
  }

  const text = typeof data?._text === "string" ? data._text.trim() : "";
  if (!text) throw new Error("AI 응답 텍스트가 비어있습니다.");
  console.log('AI response text:', text);
  return text;
}
