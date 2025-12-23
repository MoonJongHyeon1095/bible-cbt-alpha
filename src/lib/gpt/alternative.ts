
// // src/lib/gpt/alternative.ts
// import { callGptText } from "./client";

// export type AlternativeThought = {
//   thought: string;
//   technique: string;
//   techniqueDescription: string;
// };

// type LlmResponseShape = {
//   result?: { alternatives?: Array<{ thought?: string }> };
//   alternatives?: Array<{ thought?: string }>; // 루트로 오는 케이스 대비
// };

// const TECHNIQUES = [
//   {
//     technique: "현실검증",
//     techniqueDescription:
//       "극단적 사고를 사실/증거/대안 해석으로 재평가해 균형을 잡습니다.",
//   },
//   {
//     technique: "강점 발견",
//     techniqueDescription:
//       "이미 해낸 것, 버틴 것, 쌓아온 자원을 확인해 회복감을 돕습니다.",
//   },
//   {
//     technique: "자기수용",
//     techniqueDescription:
//       "완벽하지 않아도 괜찮다는 관점으로 자기비난을 완화합니다.",
//   },
// ] as const;

// const DEFAULT_THOUGHTS = [
//   "지금은 감정이 크게 올라온 상태라서, 결론을 확정하기보다 사실과 증거를 먼저 정리해보는 게 좋겠어요.",
//   "이번 결과가 아쉽더라도, 그동안 준비하며 쌓인 노력과 배움은 분명 남아 있어요.",
//   "완벽해야 한다는 부담이 커질수록 더 힘들어져요. 지금의 나도 충분히 존중받을 가치가 있어요.",
// ] as const;

// const SYSTEM_PROMPT = `
// 너는 한국어로 답하는 CBT 기반 상담자다.
// 사용자의 부정적 자동사고를, 현실적이고 균형잡힌 대안사고 3개로 제안한다.

// 1. 현실검증
//   - 

// 2. 강점발견
//   - 

// 3. 자기수용
//   -

// 규칙:
// - 반박/논쟁/훈계/설교 금지. 따뜻하고 조심스럽게.
// - 과장된 긍정(희망회로) 금지. 현실 기반으로.
// - 대안사고는 1인칭 "~요"로 자연스럽게.
// - 중복 없이 3개.
// - 출력은 오직 JSON만.
// - 스키마는 정확히 아래 형태만:

// {
//   "result": {
//     "alternatives": [
//       { "thought": "..." },
//       { "thought": "..." },
//       { "thought": "..." }
//     ]
//   }
// }
// `.trim();

// function extractJsonObject(raw: string): string | null {
//   const cleaned = raw.replace(/```(?:json)?/g, "").replace(/```/g, "").trim();
//   const s = cleaned.indexOf("{");
//   const e = cleaned.lastIndexOf("}");
//   if (s === -1 || e === -1 || e <= s) return null;
//   return cleaned.slice(s, e + 1);
// }

// function cleanText(v: unknown): string {
//   return typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "";
// }

// function toResult(thoughts: string[]): AlternativeThought[] {
//   const finalThoughts =
//     thoughts.length === 3 ? thoughts : [...DEFAULT_THOUGHTS];

//   return finalThoughts.slice(0, 3).map((t, i) => ({
//     thought: t,
//     technique: TECHNIQUES[i].technique,
//     techniqueDescription: TECHNIQUES[i].techniqueDescription,
//   }));
// }

// export async function generateContextualAlternativeThoughts(
//   situation: string,
//   emotion: string,
//   thought: string,
//   cognitiveErrors: string[]
// ): Promise<AlternativeThought[]> {
//   const prompt = `
// [상황]
// ${situation}

// [감정]
// ${emotion}

// [부정적 자동사고]
// ${thought}

// [발견된 인지오류]
// ${cognitiveErrors.join(", ")}

// 위 정보를 반영해 대안사고 3개를 JSON 스키마로만 출력하라.
// `.trim();

//   try {
//     const raw = await callGptText(prompt, { systemPrompt: SYSTEM_PROMPT });

//     const jsonText = extractJsonObject(raw);
//     if (!jsonText) throw new Error("No JSON object in LLM output");

//     const parsed = JSON.parse(jsonText) as LlmResponseShape;
//     const arr = parsed?.result?.alternatives ?? parsed?.alternatives ?? [];

//     const seen = new Set<string>();
//     const thoughts: string[] = [];

//     for (const item of arr) {
//       const t = cleanText(item?.thought);
//       if (!t) continue;
//       if (seen.has(t)) continue;
//       seen.add(t);
//       thoughts.push(t);
//       if (thoughts.length >= 3) break;
//     }

//     return toResult(thoughts);
//   } catch (e) {
//     console.error("대안사고 생성 실패(JSON):", e);
//     return toResult([]); // default 3개로
//   }
// }
// src/lib/gpt/alternative.ts
import { callGptText } from "./client";

/** =========================
 * Types
 * ========================= */

// 내부 식별자(LLM 계약용)
export type TechniqueType =
  | "REALITY_CHECK"
  | "STRENGTHS"
  | "SELF_ACCEPTANCE";

// ✅ 최종 반환 타입: technique에 "한글 라벨"이 들어가도록
export type AlternativeThought = {
  thought: string;
  technique: string; // "현실검증" | "강점 발견" | "자기수용"
  techniqueDescription: string;
};

type LlmResponseShape = {
  result?: {
    alternatives?: Array<{
      technique?: string;
      thought?: string;
    }>;
  };
  alternatives?: Array<{
    technique?: string;
    thought?: string;
  }>;
};

/** =========================
 * Technique Metadata
 * ========================= */

const TECHNIQUES: Array<{
  technique: TechniqueType; // 내부 enum
  label: string; // ✅ 한글 라벨
  techniqueDescription: string;
}> = [
  {
    technique: "REALITY_CHECK",
    label: "현실검증",
    techniqueDescription:
      "사실과 증거, 가능한 대안적 해석을 통해 극단적인 사고를 현실적으로 재평가합니다.",
  },
  {
    technique: "STRENGTHS",
    label: "강점 발견",
    techniqueDescription:
      "이미 해낸 것과 버텨온 경험에서 회복 자원과 자기 효능감을 찾습니다.",
  },
  {
    technique: "SELF_ACCEPTANCE",
    label: "자기수용",
    techniqueDescription:
      "완벽주의와 자기비난을 완화하고 지금의 자신을 존중하는 관점을 기릅니다.",
  },
];

// ✅ return 시 technique에 넣을 한글 라벨 매핑
const TECHNIQUE_LABEL_MAP: Record<TechniqueType, string> = {
  REALITY_CHECK: "현실검증",
  STRENGTHS: "강점 발견",
  SELF_ACCEPTANCE: "자기수용",
};

/** =========================
 * Fallback Thoughts
 * ========================= */

const DEFAULT_THOUGHTS: Record<TechniqueType, string> = {
  REALITY_CHECK:
    "지금 떠오르는 생각이 사실인지, 아니면 감정이 강해져서 한쪽으로 치우친 해석인지 차분히 구분해볼 필요가 있어요. 모든 상황에는 여러 가능성이 있는데, 지금은 가장 불리한 해석 하나만 붙잡고 있는 것 같아요. 증거와 반증을 함께 살펴보면 생각의 무게가 조금은 달라질 수 있어요.",
  STRENGTHS:
    "이 상황에 오기까지 이미 많은 것들을 감당하고 버텨왔다는 점은 분명해요. 쉽지 않은 조건에서도 계속 움직여 왔다는 사실 자체가 당신의 자원이에요. 지금은 그 강점이 잘 보이지 않지만, 사라진 건 아니에요.",
  SELF_ACCEPTANCE:
    "이렇게 힘들다고 느끼는 자신을 나약하다고 판단할 필요는 없어요. 누구라도 이 정도 상황에서는 흔들릴 수 있어요. 지금의 모습도 충분히 존중받아야 할 나의 한 부분이에요.",
};

/** =========================
 * System Prompt
 * ========================= */

const SYSTEM_PROMPT = `
너는 한국어로 답하는 CBT(인지행동치료) 기반 상담자다.
사용자가 겪은 상황, 감정, 부정적 자동사고, 인지오류를 바탕으로
아래 3가지 기법에 대해 각각 "하나의 대안사고"를 생성하라.

[기법]
1) REALITY_CHECK (현실검증)
- 인지행치료의 증거사실 수집 및 설문 기법을 적용한다.
- 사실, 증거, 가능성, 대안적 해석을 통해 지나치게 극단적인 사고를 현실적으로 재평가한다.
- 4~5문장으로 작성한다.

2) STRENGTHS (강점 발견)
- 인지치료에서의 긍정적 재구성 기법과 긍정심리학에서의 칭찬기법을 바탕으로 한다.
- 사용자가 이미 해낸 것, 버텨온 경험, 쌓아온 자원과 능력을 발견해 회복감과 자기 효능감을 돕는다.
- 3~5문장으로 작성한다.

3) SELF_ACCEPTANCE (자기수용)
- 이야기 치료의 대얀서사기법, 자비중심치료의 자기연민 기법을 기반으로 한다.
- 완벽해야 한다는 압박과 자기비난을 완화하고 지금의 자신을 존중하는 관점을 제시한다.
- 3~5문장으로 작성한다.

[출력 규칙]
- 사용자가 겪은 상황, 감정, 부정적 자동사고, 인지오류를 반드시 반영한다.
- 근거 없는 낙관, 과장된 긍정(희망회로)은 금지한다.
- 서로 다른 기법 간 내용이 중복되지 않도록 한다.
- 출력은 오직 JSON만 허용한다.
- 아래 스키마를 정확히 따른다.

{
  "result": {
    "alternatives": [
      { "technique": "REALITY_CHECK", "thought": "..." },
      { "technique": "STRENGTHS", "thought": "..." },
      { "technique": "SELF_ACCEPTANCE", "thought": "..." }
    ]
  }
}
`.trim();

/** =========================
 * Utils
 * ========================= */

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

function normalizeTechnique(v: unknown): TechniqueType | null {
  const t = cleanText(v);
  if (t === "REALITY_CHECK") return "REALITY_CHECK";
  if (t === "STRENGTHS") return "STRENGTHS";
  if (t === "SELF_ACCEPTANCE") return "SELF_ACCEPTANCE";
  return null;
}

/** =========================
 * Mapping
 * ========================= */

function toResultByTechnique(
  map: Partial<Record<TechniqueType, string>>
): AlternativeThought[] {
  return TECHNIQUES.map((tech) => ({
    thought: map[tech.technique] ?? DEFAULT_THOUGHTS[tech.technique],
    technique: TECHNIQUE_LABEL_MAP[tech.technique], // ✅ 최종 반환은 한글
    techniqueDescription: tech.techniqueDescription,
  }));
}

/** =========================
 * Main Function
 * ========================= */

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

위 정보를 바탕으로 대안사고를 생성하라.
`.trim();

  try {
    const raw = await callGptText(prompt, {
      systemPrompt: SYSTEM_PROMPT,
    });

    const jsonText = extractJsonObject(raw);
    if (!jsonText) throw new Error("No JSON object in LLM output");

    const parsed = JSON.parse(jsonText) as LlmResponseShape;
    const arr = parsed?.result?.alternatives ?? parsed?.alternatives ?? [];

    const byTechnique: Partial<Record<TechniqueType, string>> = {};
    const usedThoughts = new Set<string>();

    for (const item of arr) {
      const technique = normalizeTechnique(item?.technique);
      const t = cleanText(item?.thought);
      if (!technique || !t) continue;
      if (usedThoughts.has(t)) continue;

      if (!byTechnique[technique]) {
        byTechnique[technique] = t;
        usedThoughts.add(t);
      }
    }

    return toResultByTechnique(byTechnique);
  } catch (e) {
    console.error("대안사고 생성 실패(JSON):", e);
    return toResultByTechnique({});
  }
}
