
// src/lib/gpt/alternative.ts
import { callGptText } from "./client";

export type AlternativeThought = {
  thought: string;
  technique: string;
  techniqueDescription: string;
};

type LlmResponseShape = {
  result?: { alternatives?: Array<{ thought?: string }> };
  alternatives?: Array<{ thought?: string }>; // 루트로 오는 케이스 대비
};

const TECHNIQUES = [
  {
    technique: "현실검증",
    techniqueDescription:
      "극단적 사고를 사실/증거/대안 해석으로 재평가해 균형을 잡습니다.",
  },
  {
    technique: "강점 발견",
    techniqueDescription:
      "이미 해낸 것, 버틴 것, 쌓아온 자원을 확인해 회복감을 돕습니다.",
  },
  {
    technique: "자기수용",
    techniqueDescription:
      "완벽하지 않아도 괜찮다는 관점으로 자기비난을 완화합니다.",
  },
] as const;

const DEFAULT_THOUGHTS = [
  "지금은 감정이 크게 올라온 상태라서, 결론을 확정하기보다 사실과 증거를 먼저 정리해보는 게 좋겠어요.",
  "이번 결과가 아쉽더라도, 그동안 준비하며 쌓인 노력과 배움은 분명 남아 있어요.",
  "완벽해야 한다는 부담이 커질수록 더 힘들어져요. 지금의 나도 충분히 존중받을 가치가 있어요.",
] as const;

const SYSTEM_PROMPT = `
너는 한국어로 답하는 CBT 기반 상담자다.
사용자의 부정적 자동사고를, 현실적이고 균형잡힌 대안사고 3개로 제안한다.

규칙:
- 반박/논쟁/훈계/설교 금지. 따뜻하고 조심스럽게.
- 과장된 긍정(희망회로) 금지. 현실 기반으로.
- 대안사고는 1인칭 "~요"로 자연스럽게.
- 중복 없이 3개.
- 출력은 오직 JSON만.
- 스키마는 정확히 아래 형태만:

{
  "result": {
    "alternatives": [
      { "thought": "..." },
      { "thought": "..." },
      { "thought": "..." }
    ]
  }
}
`.trim();

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

function toResult(thoughts: string[]): AlternativeThought[] {
  const finalThoughts =
    thoughts.length === 3 ? thoughts : [...DEFAULT_THOUGHTS];

  return finalThoughts.slice(0, 3).map((t, i) => ({
    thought: t,
    technique: TECHNIQUES[i].technique,
    techniqueDescription: TECHNIQUES[i].techniqueDescription,
  }));
}

export async function generateContextualAlternativeThoughts(
  situation: string,
  emotion: string,
  thought: string,
  cognitiveErrors: string[]
): Promise<AlternativeThought[]> {
  const prompt = `
[상황]
${situation}

[감정]
${emotion}

[부정적 자동사고]
${thought}

[발견된 인지오류]
${cognitiveErrors.join(", ")}

위 정보를 반영해 대안사고 3개를 JSON 스키마로만 출력하라.
`.trim();

  try {
    const raw = await callGptText(prompt, { systemPrompt: SYSTEM_PROMPT });

    const jsonText = extractJsonObject(raw);
    if (!jsonText) throw new Error("No JSON object in LLM output");

    const parsed = JSON.parse(jsonText) as LlmResponseShape;
    const arr = parsed?.result?.alternatives ?? parsed?.alternatives ?? [];

    const seen = new Set<string>();
    const thoughts: string[] = [];

    for (const item of arr) {
      const t = cleanText(item?.thought);
      if (!t) continue;
      if (seen.has(t)) continue;
      seen.add(t);
      thoughts.push(t);
      if (thoughts.length >= 3) break;
    }

    return toResult(thoughts);
  } catch (e) {
    console.error("대안사고 생성 실패(JSON):", e);
    return toResult([]); // default 3개로
  }
}
