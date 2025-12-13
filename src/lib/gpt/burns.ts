// src/lib/gpt/burns.ts
import { callGptText } from "./client";

export interface BurnsEmpathyResult {
  thoughtEmpathy: string;
  emotionEmpathy: string;
  iStatement: string;
  soothing: string;
  question: string;
}

type LlmResponseShape = {
  result?: Partial<BurnsEmpathyResult>;
} & Partial<BurnsEmpathyResult>; // ✅ 루트로 오는 케이스도 허용

const SYSTEM_PROMPT = `
너는 한국어로 답하는 공감 전문 심리 상담가다.
David Burns의 공감적 반응(정서 공감/재진술/I-Statement/달래기/질문)을 참고하되,
사용자의 감정과 자동사고를 반박하거나 논쟁하지 않는다.

스타일:
- 반드시 존댓말(~요)만 사용한다.
- 짧고 부드럽게, 따뜻하게, 단정/판단 금지.
- 조언/해결책/훈계/설교 금지.
- "하지만"으로 이어지는 반박 구조 금지.
- AI가 인간인 것처럼 말하기 금지(경험 공유 금지: "저도 그런 적 있어요" 금지).

출력 형식(JSON only):
{
  "result": {
    "thoughtEmpathy": "…",
    "emotionEmpathy": "…",
    "iStatement": "…",
    "soothing": "…",
    "question": "…"
  }
}

필드 정의(각 1~2문장):
- thoughtEmpathy: 자동사고가 생길 만한 배경/맥락 공감
- emotionEmpathy: 감정의 자연스러움/정당성 인정(강도 반영)
- iStatement: 관찰자의 따뜻한 진술(경험 공유/비교 금지)
- soothing: 차분한 지지/안정감 제공(칭찬/위로/힘 실어주기)
- question: 부드러운 탐색 질문 1개(심문/추궁 금지)

제약:
- JSON만 출력(설명/주석/코드블록/번호/불릿 금지)
`.trim();

const FALLBACK = (emotion: string, thought: string): BurnsEmpathyResult => ({
  thoughtEmpathy: `"${thought}" 같은 생각이 떠오를 만한 상황이었던 것 같아요.`,
  emotionEmpathy: `${emotion}이 크게 느껴지시는 것도 충분히 그럴 수 있어요.`,
  iStatement: `제가 보기에는 지금은 마음이 많이 지친 상태처럼 읽혀요.`,
  soothing: `지금 이 감정을 있는 그대로 잠깐 두셔도 괜찮아요. 급하게 결론 내리지 않아도 돼요.`,
  question: `지금 이 ${emotion}이 특히 커지는 순간이 어떤 때인지 떠오르세요?`,
});

function extractJsonObject(raw: string): string | null {
  const cleaned = raw.replace(/```(?:json)?/g, "").replace(/```/g, "").trim();
  const s = cleaned.indexOf("{");
  const e = cleaned.lastIndexOf("}");
  if (s === -1 || e === -1 || e <= s) return null;
  return cleaned.slice(s, e + 1);
}

function cleanText(v: unknown): string {
  return typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "";
}

export async function generateBurnsEmpathy(
  situation: string,
  emotion: string,
  thought: string,
  intensity: number
): Promise<BurnsEmpathyResult> {
  const prompt = `
[상황]
${situation}

[감정]
${emotion} (${intensity}/100)

[자동사고]
${thought}
`.trim();

  try {
    const raw = await callGptText(prompt, { systemPrompt: SYSTEM_PROMPT });

    const jsonText = extractJsonObject(raw);
    if (!jsonText) throw new Error("No JSON object in LLM output");

    const parsed = JSON.parse(jsonText) as LlmResponseShape;

    // ✅ result로 오든, 루트로 오든 모두 수용
    const r = (parsed.result ?? parsed) as Partial<BurnsEmpathyResult>;

    const result: BurnsEmpathyResult = {
      thoughtEmpathy: cleanText(r.thoughtEmpathy),
      emotionEmpathy: cleanText(r.emotionEmpathy),
      iStatement: cleanText(r.iStatement),
      soothing: cleanText(r.soothing),
      question: cleanText(r.question),
    };

    const fb = FALLBACK(emotion, thought);
    return {
      thoughtEmpathy: result.thoughtEmpathy || fb.thoughtEmpathy,
      emotionEmpathy: result.emotionEmpathy || fb.emotionEmpathy,
      iStatement: result.iStatement || fb.iStatement,
      soothing: result.soothing || fb.soothing,
      question: result.question || fb.question,
    };
  } catch (e) {
    console.error("번즈 공감 생성 실패(JSON):", e);
    return FALLBACK(emotion, thought);
  }
}
