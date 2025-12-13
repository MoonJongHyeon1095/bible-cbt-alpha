// // src/lib/gpt/thoughts.ts

// import { callGptText } from "./client";

// export async function generateExtendedAutomaticThoughts(
//   situation: string,
//   emotion: string
// ): Promise<{
//   sdtThoughts: Array<{ category: string; thought: string }>;
//   cognitiveThoughts: string[];
// }> {
//   const systemPrompt = `당신은 자기결정이론(SDT)과 인지행동치료(CBT)를 통합하는 전문 상담가입니다. 
// 사용자의 상황을 분석하여 SDT 욕구(관계성, 유능감, 자율성) 관련 자동사고와 인지오류 기반 자동사고를 정확히 파악합니다.
// 간결하고 구체적으로 응답하세요.`;

//   const prompt = `상황: ${situation}
// 감정: ${emotion}

// 이 상황에서 "${emotion}" 감정을 느낄 때 떠오를 수 있는 자동적 사고를 다음 두 그룹으로 생성해주세요:

// [SDT 기반 자동사고 3개]
// 관계성: [관계와 소속감 관련된 부정적 생각]
// 유능감: [능력과 성취 관련된 부정적 생각]
// 자율성: [통제와 선택 관련된 부정적 생각]

// [인지오류 기반 자동사고 10개]
// 1. [극단적으로 생각하는 사고]
// 2. [한 번의 일을 항상 그렇다고 생각하는 사고]
// 3. [좋은 건 무시하고 나쁜 것만 보는 사고]
// 4. [좋은 일을 평가절하하는 사고]
// 5. [근거 없이 부정적으로 예측하는 사고]
// 6. [문제를 과장하거나 장점을 축소하는 사고]
// 7. [기분이 곧 사실이라고 믿는 사고]
// 8. [반드시 ~해야 한다고 생각하는 사고]
// 9. [자신에게 부정적 꼬리표를 붙이는 사고]
// 10. [모든 것을 자기 탓으로 돌리는 사고]

// 주의: 각 사고는 순수하게 생각만 작성하고, 괄호나 카테고리 레이블을 붙이지 마세요.`;

//   try {
//     const response = await callGptText(prompt, { systemPrompt });

//     // SDT 사고 파싱
//     const sdtThoughts: Array<{ category: string; thought: string }> = [];
//     const relationMatch = response.match(/관계성[:\s]+(.+?)(?=\n|유능감|$)/);
//     const competenceMatch = response.match(/유능감[:\s]+(.+?)(?=\n|자율성|$)/);
//     const autonomyMatch = response.match(
//       /자율성[:\s]+(.+?)(?=\n|인지오류|\[|$)/
//     );

//     console.log(response)

//     if (relationMatch) {
//       sdtThoughts.push({
//         category: "관계성",
//         thought: relationMatch[1].replace(/\[.*?\]\s*/g, "").trim(),
//       });
//     }
//     if (competenceMatch) {
//       sdtThoughts.push({
//         category: "유능감",
//         thought: competenceMatch[1].replace(/\[.*?\]\s*/g, "").trim(),
//       });
//     }
//     if (autonomyMatch) {
//       sdtThoughts.push({
//         category: "자율성",
//         thought: autonomyMatch[1].replace(/\[.*?\]\s*/g, "").trim(),
//       });
//     }

//     // 기본값 보정
//     if (sdtThoughts.length < 3) {
//       const defaults = [
//         { category: "관계성", thought: "사람들이 나를 이해하지 못할 것이다" },
//         { category: "유능감", thought: "나는 이 일을 제대로 해낼 수 없을 것이다" },
//         { category: "자율성", thought: "내가 통제할 수 있는 것이 아무것도 없다" },
//       ];
//       while (sdtThoughts.length < 3) {
//         const missing = defaults.find(
//           (d) => !sdtThoughts.some((st) => st.category === d.category)
//         );
//         if (missing) sdtThoughts.push(missing);
//       }
//     }

//     // 인지오류 기반 사고 파싱
//     const cognitiveThoughts: string[] = [];
//     const lines = response.split("\n");

//     for (const line of lines) {
//       const match = line.match(/^\s*\d+\.\s*(.+?)(?:\s*\(.*?\)\s*)?$/);
//       if (match) {
//         const thought = match[1]
//           .replace(/\[.*?\]\s*/g, "")
//           .replace(/\(.*?\)\s*$/g, "")
//           .trim();
//         if (thought && cognitiveThoughts.length < 10) cognitiveThoughts.push(thought);
//       }
//     }

//     // 기본값 보정
//     const defaultCognitiveThoughts = [
//       "이 일은 완전한 실패야",
//       "항상 이런 식이야",
//       "좋았던 것들은 하나도 기억나지 않아",
//       "내가 한 좋은 일들은 별거 아니야",
//       "분명히 나쁜 일이 일어날 거야",
//       "이 문제는 너무 크고, 내 강점은 너무 작아",
//       "이런 기분이 드니까 사실인 게 분명해",
//       "나는 반드시 완벽해야만 해",
//       "나는 실패자야",
//       "모든 게 다 내 잘못이야",
//     ];
//     while (cognitiveThoughts.length < 10) {
//       cognitiveThoughts.push(defaultCognitiveThoughts[cognitiveThoughts.length]);
//     }

//     return {
//       sdtThoughts: sdtThoughts.slice(0, 3),
//       cognitiveThoughts: cognitiveThoughts.slice(0, 10),
//     };
//   } catch (error) {
//     console.error("확장 자동사고 생성 실패:", error);
//     return {
//       sdtThoughts: [
//         { category: "관계성", thought: "사람들이 나를 이해하지 못할 것이다" },
//         { category: "유능감", thought: "나는 이 일을 제대로 해낼 수 없을 것이다" },
//         { category: "자율성", thought: "내가 통제할 수 있는 것이 아무것도 없다" },
//       ],
//       cognitiveThoughts: [
//         "이 일은 완전한 실패야",
//         "항상 이런 식이야",
//         "좋았던 것들은 하나도 기억나지 않아",
//         "내가 한 좋은 일들은 별거 아니야",
//         "분명히 나쁜 일이 일어날 거야",
//         "이 문제는 너무 크고, 내 강점은 너무 작아",
//         "이런 기분이 드니까 사실인 게 분명해",
//         "나는 반드시 완벽해야만 해",
//         "나는 실패자야",
//         "모든 게 다 내 잘못이야",
//       ],
//     };
//   }
// }

// src/lib/gpt/thoughts.ts
import { callGptText } from "./client";

type SDTKey = "relatedness" | "competence" | "autonomy";
type SDTLabel = "관계성" | "유능감" | "자율성";

export type ExtendedThoughtsResult = {
  sdtThoughts: Array<{ category: SDTLabel; thought: string }>;
  cognitiveThoughts: string[];
};

type LlmResponseShape = {
  sdt?: Partial<Record<SDTKey, string>>;
  cognitive?: Array<{ index: number; thought: string }>;
};

const DEFAULT_SDT: Record<SDTKey, { category: SDTLabel; thought: string }> = {
  relatedness: { category: "관계성", thought: "사람들이 나를 이해하지 못할 것이다" },
  competence: { category: "유능감", thought: "나는 이 일을 제대로 해낼 수 없을 것이다" },
  autonomy: { category: "자율성", thought: "내가 통제할 수 있는 것이 아무것도 없다" },
};

const DEFAULT_COG: string[] = [
  "이 일은 완전한 실패다",
  "항상 이런 식이다",
  "좋은 건 다 의미 없다",
  "내가 한 좋은 일은 별거 아니다",
  "분명히 나쁜 일이 일어날 것이다",
  "문제는 너무 크고 내 강점은 너무 작다",
  "이런 기분이 드니 사실이 분명하다",
  "나는 반드시 완벽해야만 한다",
  "나는 실패자다",
  "모든 게 다 내 잘못이다",
];

const SYSTEM_PROMPT = `
너는 한국어로 답하는 인지행동치료(CBT) 상담자다.

역할:
- 사용자의 상황과 감정을 바탕으로 "자동사고"를 또렷하게 문장으로 뽑아준다.
- 표면적 사건 묘사가 아니라, 그 사건이 의미하는 '한 단계 일반화된 믿음/규칙/두려운 결과'를 잡아낸다.
- 너무 막연한 인생 철학이 아니라, 현재 상황/관계 맥락에 밀접한 믿음으로 쓴다.
- 자기결정이론(SDT) 관점(관계/유능/자율)을 고려하되, 그 단어 자체는 쓰지 않는다.

스타일:
- 반드시 한국어, 자연스러운 1인칭 자동사고로 쓴다. ("나는 …다", "분명 …일 것이다" 등)
- 같은 표현 반복을 피하고, 상황 디테일을 1개 이상 은근히 반영한다.
- 모든 문장은 "~다" 체로 마무리한다.

형식 제약:
- 출력은 오직 JSON만 허용한다. (설명, 주석, 코드블록, 번호, 불릿 금지)
- SDT 기반 자동사고 3개(관계/유능/자율 관점 각각 1개)를 생성한다.
- 인지오류 기반 자동사고 10개를 index 1~10에 맞춰 생성한다.
- 사건 문장을 그대로 복사하지 말고, 그 사건이 의미하는 핵심 믿음/규칙/두려운 결과로 한 단계 일반화한다.
- 아래 스키마를 정확히 지킨다.

출력 스키마(정확히):
{
  "sdt": {
    "relatedness": "문장 1~2개",
    "competence": "문장 1~2개",
    "autonomy": "문장 1~2개"
  },
  "cognitive": [
    { "index": 1, "thought": "문장 1~2개" },
    { "index": 2, "thought": "문장 1~2개" },
    { "index": 3, "thought": "문장 1~2개" },
    { "index": 4, "thought": "문장 1~2개" },
    { "index": 5, "thought": "문장 1~2개" },
    { "index": 6, "thought": "문장 1~2개" },
    { "index": 7, "thought": "문장 1~2개" },
    { "index": 8, "thought": "문장 1~2개" },
    { "index": 9, "thought": "문장 1~2개" },
    { "index": 10, "thought": "문장 1~2개" }
  ]
}

인지오류 index 의미:
1. 전부 아니면 전무 사고(흑백논리) : 성공/실패, 좋음/나쁨처럼 두 극단만 존재한다고 단정함
2. 과잉일반화 : 한 번의 사건을 “항상”, “전부”, “매번” 같은 규칙으로 확대함
3. 정신적 여과 : 부정적인 한 부분만 집요하게 보고 나머지는 배제함
4. 긍정 무시 : 긍정적 사실을 의도적으로 깎아내리거나 의미 없다고 처리함
5. 성급한 결론 : 증거 없이 부정적 결과나 타인의 생각을 확정함
6. 확대와 축소 : 실수는 크게, 강점이나 성과는 작게 왜곡함
7. 감정적 추론 : 느낌이 사실을 증명한다고 믿음 (“느껴지니까 사실이다”)
8. 당위적 진술 : “반드시 ~해야 한다”는 경직된 규칙을 적용함
9. 이름 붙이기 : 행동 하나로 자기 전체에 부정적 꼬리표를 붙임
10. 개인화 : 통제 불가능한 일까지 자기 책임으로 돌림
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

export async function generateExtendedAutomaticThoughts(
  situation: string,
  emotion: string
): Promise<ExtendedThoughtsResult> {
  const prompt = `상황: ${situation}\n감정: ${emotion}`;

  try {
    const raw = await callGptText(prompt, { systemPrompt: SYSTEM_PROMPT });

    const jsonText = extractJsonObject(raw);
    if (!jsonText) throw new Error("No JSON object in LLM output");

    const parsed = JSON.parse(jsonText) as LlmResponseShape;

    const sdt = parsed.sdt ?? {};
    const sdtThoughts = (["relatedness", "competence", "autonomy"] as const).map(
      (k) => ({
        category: DEFAULT_SDT[k].category,
        thought: cleanText(sdt[k]) || DEFAULT_SDT[k].thought,
      })
    );

    const cogByIndex = new Map<number, string>();
    for (const it of parsed.cognitive ?? []) {
      const idx = typeof it?.index === "number" ? it.index : NaN;
      const thought = cleanText(it?.thought);
      if (Number.isFinite(idx) && idx >= 1 && idx <= 10 && thought) {
        cogByIndex.set(idx, thought);
      }
    }

    const cognitiveThoughts = Array.from(
      { length: 10 },
      (_, i) => cogByIndex.get(i + 1) || DEFAULT_COG[i]
    );

    return { sdtThoughts, cognitiveThoughts };
  } catch (e) {
    console.error("확장 자동사고(JSON) 생성 실패:", e);
    return {
      sdtThoughts: (["relatedness", "competence", "autonomy"] as const).map(
        (k) => ({ category: DEFAULT_SDT[k].category, thought: DEFAULT_SDT[k].thought })
      ),
      cognitiveThoughts: [...DEFAULT_COG],
    };
  }
}
