
// src/lib/gemini.ts
import { ENV } from "../config/env"; // 경로는 네 프로젝트에 맞게 조정

const API_BASE = ENV.API_BASE || ""; // same-origin이면 ""

export async function callGeminiAPI(prompt: string, systemPrompt?: string): Promise<string> {
  if (!prompt?.trim()) throw new Error("prompt is required");

  const body: any = { prompt };
  if (systemPrompt) body.systemPrompt = systemPrompt;

  const response = await fetch(`${API_BASE}/api/gemini`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // (선택) 남용 방지용
      // "x-api-key": import.meta.env.VITE_APP_API_KEY,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({} as any));

  if (!response.ok) {
    // ✅ 서버가 429일 때 retryAfterSeconds 같이 내려주면 그대로 활용
    if (response.status === 429) {
      const retryAfterSeconds = Number(data?.retryAfterSeconds ?? 3600);
      const retryMessage =
        retryAfterSeconds > 3600 ? "내일" : `약 ${Math.ceil(retryAfterSeconds / 60)}분 후`;

      const errorMessage =
        `⏰ AI 서버의 일일 무료 사용량을 초과했습니다.\n\n` +
        `${retryMessage}에 다시 시도하시거나, 더 많이 사용하시려면 Google AI Studio에서 새로운 무료 API 키를 발급받아 설정하실 수 있습니다.\n\n` +
        `불편을 드려 죄송합니다.`;

      console.error("Gemini API 할당량 초과:", {
        status: response.status,
        retryAfterSeconds,
        error: data?.error,
        details: data?.details,
      });
      throw new Error(errorMessage);
    }

    if (response.status === 503) {
      const errorMessage =
        data?.error || "⚠️ AI 서버가 현재 사용량이 많습니다.\n\n1-2분 후 다시 시도해주세요.";
      console.error("Gemini API 과부하:", {
        status: response.status,
        error: errorMessage,
        details: data?.details,
      });
      throw new Error(errorMessage);
    }

    const errorMessage = data?.error || `서버 응답 오류: ${response.status}`;
    console.error("Gemini API 오류:", {
      status: response.status,
      error: errorMessage,
      details: data?.details,
    });
    throw new Error(errorMessage);
  }

  // ✅ 서버가 텍스트만 내려주면 그걸 우선 사용
  const text = typeof data?._text === "string" ? data._text.trim() : "";
  if (text) return text;

  // (옵션) 서버가 raw gemini payload를 그대로 내려주는 경우 대비
  const legacy =
    data?.candidates?.[0]?.content?.parts?.[0]?.text
      ? String(data.candidates[0].content.parts[0].text).trim()
      : "";

  if (legacy) return legacy;

  throw new Error("AI 응답 텍스트가 비어있습니다.");
}
