// // src/lib/gpt/client.ts
// import { assertEnv } from "../../config/env";

// assertEnv();

// export type GptCallOptions = {
//   systemPrompt?: string;
// };

// export async function callGptText(prompt: string, opts: GptCallOptions = {}) {
//   const body: any = { prompt };
//   if (opts.systemPrompt) body.systemPrompt = opts.systemPrompt;

//   const res = await fetch(`${serverUrl}/gpt`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${anonKey}`,
//     },
//     body: JSON.stringify(body),
//   });

//   const data = await res.json().catch(() => ({}));
//   if (data?.usage) {
//     console.log("[GPT TOKEN USAGE]", {
//       input: data.usage.input_tokens,
//       output: data.usage.output_tokens,
//       total: data.usage.total_tokens,
//     });
//   }

//   if (!res.ok) {
//     const msg = data?.error ?? `AI 요청 실패 (status: ${res.status})`;
//     const err = new Error(msg);
//     (err as any).details = data?.details;
//     throw err;
//   }

//   const text = typeof data?._text === "string" ? data._text.trim() : "";
//   if (!text) throw new Error("AI 응답 텍스트가 비어있습니다.");

//   return text;
// }

// src/lib/gpt/client.ts
import { ENV } from "../../config/env";

const API_BASE = ENV.API_BASE || ""; // same-origin이면 ""

export type GptCallOptions = { systemPrompt?: string };

export async function callGptText(prompt: string, opts: GptCallOptions = {}) {
  if (!prompt?.trim()) throw new Error("prompt is required");

  const body: any = { prompt };
  if (opts.systemPrompt) body.systemPrompt = opts.systemPrompt;

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

  const text = typeof data?._text === "string" ? data._text.trim() : "";
  if (!text) throw new Error("AI 응답 텍스트가 비어있습니다.");

  return text;
}
