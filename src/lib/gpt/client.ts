// src/lib/gpt/client.ts
import { projectId, publicAnonKey } from "../../utils/supabase/info";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../../utils/supabase/runtime";

const fallbackUrl = `https://${projectId}.supabase.co`;
const baseUrl = SUPABASE_URL?.trim() || fallbackUrl;
const anonKey = SUPABASE_ANON_KEY?.trim() || publicAnonKey;

// 너의 edge function 이름 그대로
const serverUrl = `${baseUrl}/functions/v1/make-server-4ba10e96`;

export type GptCallOptions = {
  systemPrompt?: string;
};

export async function callGptText(prompt: string, opts: GptCallOptions = {}) {
  const body: any = { prompt };
  if (opts.systemPrompt) body.systemPrompt = opts.systemPrompt;

  const res = await fetch(`${serverUrl}/gpt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (data?.usage) {
    console.log("[GPT TOKEN USAGE]", {
      input: data.usage.input_tokens,
      output: data.usage.output_tokens,
      total: data.usage.total_tokens,
    });
  }

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
