// src/lib/devAiProvider.ts
export type Provider = "gemini" | "openai";
export const DEV_AI_PROVIDER_KEY = "dev.ai.provider";

export function getDevAIProvider(): Provider {
  if (typeof window === "undefined") return "gemini"; // SSR/빌드 안전
  const v = window.localStorage.getItem(DEV_AI_PROVIDER_KEY);
  return v === "openai" ? "openai" : "gemini";
}
// src/lib/devAiProvider.ts
export function setDevAIProvider(v: Provider) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEV_AI_PROVIDER_KEY, v);
}
