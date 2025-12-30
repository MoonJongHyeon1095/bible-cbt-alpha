// // src/lib/gpt/cognitive.ts
// import { callGptText } from "./client";

// export interface CognitiveErrorAnalysisResult {
//   errors: Array<{
//     title: string;
//     description: string;
//     userQuote: string;
//     analysis: string;
//   }>;
// }

// const COGNITIVE_ERRORS = [
//   {
//     title: "전부 아니면 전무 사고",
//     description:
//       "흑백논리, 극단적 사고. 중간 지대 없이 완전한 성공 아니면 완전한 실패로만 생각합니다.",
//   },
//   {
//     title: "과잉일반화",
//     description:
//       '한 번의 경험을 모든 것에 적용. 한 번의 부정적 사건을 "항상", "절대" 같은 표현으로 일반화합니다.',
//   },
//   {
//     title: "정신적 여과",
//     description:
//       "부정적인 것만 보고 긍정적인 것 무시. 좋은 일들은 걸러내고 나쁜 일만 집중합니다.",
//   },
//   {
//     title: "긍정 무시",
//     description:
//       '좋은 일을 평가절하. 긍정적 경험을 "별거 아니야", "운이 좋았을 뿐"이라고 폄하합니다.',
//   },
//   {
//     title: "성급한 결론",
//     description: "근거 없이 부정적으로 해석. 증거 없이 나쁜 결과를 확신합니다.",
//   },
//   {
//     title: "확대와 축소",
//     description: "문제를 과장하거나 장점을 축소. 실수는 크게, 성공은 작게 봅니다.",
//   },
//   {
//     title: "감정적 추론",
//     description:
//       '감정이 사실이라고 믿음. "이런 기분이 드니까 사실일 거야"라고 생각합니다.',
//   },
//   {
//     title: "당위적 진술",
//     description:
//       '~해야 한다는 경직된 규칙. "반드시", "꼭", "절대" 같은 경직된 기준을 적용합니다.',
//   },
//   {
//     title: "이름 붙이기",
//     description:
//       '자신이나 타인에게 부정적 꼬리표. "나는 실패자야", "저 사람은 이기적이야"라고 단정합니다.',
//   },
//   {
//     title: "개인화",
//     description:
//       "모든 것을 자신 탓으로 돌림. 자신이 통제할 수 없는 일도 자기 책임으로 여깁니다.",
//   },
// ] as const;

// type ErrorIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

// type LlmResponseShape = {
//   errors?: Array<{
//     index: ErrorIndex; // 1..10
//     userQuote: string; // 원문에서 짧게 그대로 인용(또는 thought/situation 일부)
//     analysis: string; // 2~3문장
//   }>;
// };

// const SYSTEM_PROMPT = `
// 너는 인지행동치료(CBT) 관점에서 "생각의 왜곡"을 식별하는 전문가다.

// 너의 목표:
// - 아래 10가지 중 해당하는 것을 3~5개 고른다. (애매하면 제외, 중복 피함)
// - 각 항목에 대해 userQuote(그대로 인용)와 analysis(3문장)를 작성한다.

// 가장 중요한 규칙 (반드시 지켜):
// 1) userQuote는 입력 텍스트에서 문장을 그대로 복사한다. (의역/요약 금지)
// 2) analysis는 반드시 3문장 이상이어야 한다. (3~5 문장)
// 3) analysis는 '정의/교과서 설명'을 하지 않는다. 대신 "이 문장에서 일어난 추론 점프"를 지적한다.
// 4) analysis에는 사용자의 상황, 배후 사고를 반드시 구체적으로 반영한다. (그래야 상황을 반영했다고 볼 수 있음)
// 5) analysis의 마지막에는 그 감정이 더 커질 수 있음을 지적하고, 구체적인 확인 질문 예시를 제시한다. 

// 출력은 오직 JSON만 허용한다. (설명/주석/코드블록/번호/불릿 금지)
// 출력 스키마:
// {
//   "errors": [
//     { "index": 1, "userQuote": "...", "analysis": "..." }
//   ]
// }

// 인지오류 index 의미:
// 1. 전부 아니면 전무 사고(흑백논리) : 성공/실패, 좋음/나쁨처럼 두 극단만 존재한다고 단정함
// 2. 과잉일반화 : 한 번의 사건을 “항상”, “전부”, “매번” 같은 규칙으로 확대함
// 3. 정신적 여과 : 부정적인 한 부분만 집요하게 보고 나머지는 배제함
// 4. 긍정 무시 : 긍정적 사실을 의도적으로 깎아내리거나 의미 없다고 처리함
// 5. 성급한 결론 : 증거 없이 부정적 결과나 타인의 생각을 확정함
// 6. 확대와 축소 : 실수는 크게, 강점이나 성과는 작게 왜곡함
// 7. 감정적 추론 : 느낌이 사실을 증명한다고 믿음 (“느껴지니까 사실이다”)
// 8. 당위적 진술 : “반드시 ~해야 한다”는 경직된 규칙을 적용함
// 9. 이름 붙이기 : 행동 하나로 자기 전체에 부정적 꼬리표를 붙임
// 10. 개인화 : 통제 불가능한 일까지 자기 책임으로 돌림
// `.trim();

// const FALLBACK_INDICES: ErrorIndex[] = [1, 5, 7];

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

// function toResult(indices: ErrorIndex[], situation: string, thought: string): CognitiveErrorAnalysisResult {
//   const errors = indices.map((idx, i) => {
//     const meta = COGNITIVE_ERRORS[idx - 1];
//     const quoteSource = i === 0 ? thought : situation || thought;
//     return {
//       title: meta.title,
//       description: meta.description,
//       userQuote: cleanText(quoteSource) || thought,
//       analysis:
//         idx === 1
//           ? "이 생각은 성공/실패처럼 이분법으로 단정하는 경향이 있다. 중간 가능성과 다양한 해석을 배제하고 있다."
//           : idx === 5
//           ? "충분한 근거 없이 부정적인 결론을 빠르게 확정하고 있다. 확인되지 않은 가정이 감정을 키우고 있다."
//           : "현재 느끼는 감정을 객관적 사실처럼 취급하고 있다. 감정과 사실을 분리해 보는 시도가 필요하다.",
//     };
//   });

//   return { errors };
// }

// export async function analyzeCognitiveErrors(
//   situation: string,
//   thought: string
// ): Promise<CognitiveErrorAnalysisResult> {
//   // ✅ user prompt는 최소 정보만: 상황/사고 + 10개 목록은 system에 이미 고정
//   const prompt = `상황: ${situation}\n배후 사고: ${thought}`;

//   try {
//     const raw = await callGptText(prompt, { systemPrompt: SYSTEM_PROMPT });

//     const jsonText = extractJsonObject(raw);
//     if (!jsonText) throw new Error("No JSON object in LLM output");

//     const parsed = JSON.parse(jsonText) as LlmResponseShape;
//     const arr = Array.isArray(parsed?.errors) ? parsed.errors : [];

//     const seen = new Set<number>();
//     const picked: CognitiveErrorAnalysisResult["errors"] = [];

//     for (const item of arr) {
//       const idx = item?.index;
//       const q = cleanText(item?.userQuote);
//       const a = cleanText(item?.analysis);

//       if (!Number.isInteger(idx) || idx < 1 || idx > 10) continue;
//       if (seen.has(idx)) continue;
//       if (!q || !a) continue;

//       seen.add(idx);

//       const meta = COGNITIVE_ERRORS[idx - 1];
//       picked.push({
//         title: meta.title,
//         description: meta.description,
//         userQuote: q,
//         analysis: a,
//       });

//       if (picked.length >= 5) break;
//     }

//     // ✅ 최소 3개 보장 (모델이 덜 주면 fallback으로 채움)
//     if (picked.length < 3) {
//       const needed = 3 - picked.length;
//       for (const idx of FALLBACK_INDICES) {
//         if (picked.length >= 3) break;
//         if (picked.some((e) => e.title === COGNITIVE_ERRORS[idx - 1].title)) continue;

//         const meta = COGNITIVE_ERRORS[idx - 1];
//         picked.push({
//           title: meta.title,
//           description: meta.description,
//           userQuote: cleanText(thought) || thought,
//           analysis:
//             idx === 1
//               ? "이 생각은 성공/실패처럼 이분법으로 단정하는 경향이 있다. 중간 가능성과 다양한 해석을 배제하고 있다."
//               : idx === 5
//               ? "충분한 근거 없이 부정적인 결론을 빠르게 확정하고 있다. 확인되지 않은 가정이 감정을 키우고 있다."
//               : "현재 느끼는 감정을 객관적 사실처럼 취급하고 있다. 감정과 사실을 분리해 보는 시도가 필요하다.",
//         });
//       }
//       // 그래도 부족하면 그냥 고정 3개로 반환
//       if (picked.length < 3) return toResult(FALLBACK_INDICES, situation, thought);
//     }

//     return { errors: picked };
//   } catch (e) {
//     console.error("인지오류 분석 실패(JSON):", e);
//     return toResult(FALLBACK_INDICES, situation, thought);
//   }
// }

// src/lib/gpt/cognitive.ts
import { callGptText } from "./client";

/**
 * ✅ 기존 단일 분석 결과(호환용)
 */
export interface CognitiveErrorAnalysisResult {
  errors: Array<{
    title: string;
    description: string;
    userQuote: string;
    analysis: string;
  }>;
}

/**
 * ✅ 10개 인지오류 메타
 * - ai.ts, UI에서 재사용할 수 있도록 export
 */
export const COGNITIVE_ERRORS = [
  {
    title: "전부 아니면 전무 사고",
    description:
      "흑백논리, 극단적 사고. 중간 지대 없이 완전한 성공 아니면 완전한 실패로만 생각합니다.",
  },
  {
    title: "과잉일반화",
    description:
      '한 번의 경험을 모든 것에 적용. 한 번의 부정적 사건을 "항상", "절대" 같은 표현으로 일반화합니다.',
  },
  {
    title: "정신적 여과",
    description:
      "부정적인 것만 보고 긍정적인 것 무시. 좋은 일들은 걸러내고 나쁜 일만 집중합니다.",
  },
  {
    title: "긍정 무시",
    description:
      '좋은 일을 평가절하. 긍정적 경험을 "별거 아니야", "운이 좋았을 뿐"이라고 폄하합니다.',
  },
  {
    title: "성급한 결론",
    description: "근거 없이 부정적으로 해석. 증거 없이 나쁜 결과를 확신합니다.",
  },
  {
    title: "확대와 축소",
    description: "문제를 과장하거나 장점을 축소. 실수는 크게, 성공은 작게 봅니다.",
  },
  {
    title: "감정적 추론",
    description:
      '감정이 사실이라고 믿음. "이런 기분이 드니까 사실일 거야"라고 생각합니다.',
  },
  {
    title: "당위적 진술",
    description:
      '~해야 한다는 경직된 규칙. "반드시", "꼭", "절대" 같은 경직된 기준을 적용합니다.',
  },
  {
    title: "이름 붙이기",
    description:
      '자신이나 타인에게 부정적 꼬리표. "나는 실패자야", "저 사람은 이기적이야"라고 단정합니다.',
  },
  {
    title: "개인화",
    description:
      "모든 것을 자신 탓으로 돌림. 자신이 통제할 수 없는 일도 자기 책임으로 여깁니다.",
  },
] as const;

export type ErrorIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * ✅ 2.a: 랭킹 결과(10개 유력순)
 */
export type CognitiveErrorRankResult = {
  ranked: Array<{
    index: ErrorIndex; // 1..10
    reason: string; // 1~2문장
    evidenceQuote?: string; // 원문 그대로 인용(가능하면)
  }>;
};

/**
 * ✅ 2.b: 후보(상위3) 상세 서술 결과
 */
export type CognitiveErrorDetailResult = {
  errors: Array<{
    index: ErrorIndex; // candidates에 포함된 것만
    userQuote: string; // 원문 그대로 인용
    analysis: string; // 3~5문장 + 마지막에 확인 질문
  }>;
};

type RankLlmResponseShape = {
  ranked?: Array<{
    index?: ErrorIndex;
    reason?: string;
    evidenceQuote?: string;
  }>;
};

type DetailLlmResponseShape = {
  errors?: Array<{
    index?: ErrorIndex;
    userQuote?: string;
    analysis?: string;
  }>;
};

const RANK_SYSTEM_PROMPT = `
너는 인지행동치료(CBT) 관점에서 "인지오류(생각의 왜곡)" 가능성을 우선순위로 정렬하는 전문가다.

입력은 [상황]과 [자동사고]로 주어진다.
너의 목표:
- 아래 10가지 인지오류를 "해당 가능성이 높은 순서"로 10개 모두 정렬한다. (1~10 전부 포함, 중복 금지)
- 각 항목에 대해 reason(1~2문장)으로 왜 유력한지 짧게 설명한다. (정의/교과서 설명 금지)
- 가능하면 evidenceQuote를 1개 포함한다. evidenceQuote는 반드시 입력 텍스트에서 문장을 그대로 복사한다. (의역/요약 금지)
- 확신이 낮은 항목은 reason에서 "가능성은 낮지만" 같은 표현으로 톤을 조절한다.

중요 규칙:
1) 출력은 오직 JSON만 허용한다. (설명/주석/코드블록/번호/불릿 금지)
2) ranked 배열은 정확히 10개여야 한다.
3) index는 1..10만 가능하다.
4) evidenceQuote를 넣을 때는 반드시 원문 그대로 복사한다. (없으면 필드 생략 가능)

출력 스키마:
{
  "ranked": [
    { "index": 1, "reason": "...", "evidenceQuote": "..." }
  ]
}

인지오류 index 의미:
1. 전부 아니면 전무 사고(흑백논리)
2. 과잉일반화
3. 정신적 여과
4. 긍정 무시
5. 성급한 결론
6. 확대와 축소
7. 감정적 추론
8. 당위적 진술
9. 이름 붙이기
10. 개인화
`.trim();

const DETAIL_SYSTEM_PROMPT = `
너는 인지행동치료(CBT) 관점에서 "인지오류"를 구체적으로 분석하는 전문가다.

입력에는 [상황], [자동사고], 그리고 후보 인지오류 index 목록(candidates)이 주어진다.

너의 목표:
- candidates에 포함된 인지오류에 대해서만 분석을 작성한다. (다른 index 금지)
- 각 항목에 대해 userQuote(원문 그대로 인용)와 analysis(3~5문장)를 작성한다.

가장 중요한 규칙 (반드시 지켜):
1) userQuote는 입력 텍스트에서 문장을 그대로 복사한다. (의역/요약 금지)
2) analysis는 반드시 3문장 이상이어야 한다. (3~5 문장)
3) analysis는 '정의/교과서 설명'을 하지 않는다. 대신 "이 문장에서 일어난 추론 점프"를 지적한다.
4) analysis에는 사용자의 상황, 배후 사고를 반드시 구체적으로 반영한다.
5) analysis의 마지막에는 그 감정이 더 커질 수 있음을 지적하고, 구체적인 확인 질문 예시를 제시한다.
6) candidates의 순서대로 작성하되, 근거가 너무 약하면 "가능성은 낮지만" 같은 톤 조절은 허용한다.

출력은 오직 JSON만 허용한다. (설명/주석/코드블록/번호/불릿 금지)
출력 스키마:
{
  "errors": [
    { "index": 1, "userQuote": "...", "analysis": "..." }
  ]
}

인지오류 index 의미:
1. 전부 아니면 전무 사고(흑백논리)
2. 과잉일반화
3. 정신적 여과
4. 긍정 무시
5. 성급한 결론
6. 확대와 축소
7. 감정적 추론
8. 당위적 진술
9. 이름 붙이기
10. 개인화
`.trim();

/**
 * ✅ (호환) 기존 단일 호출용 SYSTEM_PROMPT는 유지하되,
 * 실제 구현은 "랭킹→상위 후보 상세"를 합성해 반환하도록 변경
 */
const LEGACY_SYSTEM_PROMPT = `
너는 인지행동치료(CBT) 관점에서 "생각의 왜곡"을 식별하는 전문가다.

너의 목표:
- 아래 10가지 중 해당하는 것을 3~5개 고른다. (애매하면 제외, 중복 피함)
- 각 항목에 대해 userQuote(그대로 인용)와 analysis(3문장)를 작성한다.

가장 중요한 규칙 (반드시 지켜):
1) userQuote는 입력 텍스트에서 문장을 그대로 복사한다. (의역/요약 금지)
2) analysis는 반드시 3문장 이상이어야 한다. (3~5 문장)
3) analysis는 '정의/교과서 설명'을 하지 않는다. 대신 "이 문장에서 일어난 추론 점프"를 지적한다.
4) analysis에는 사용자의 상황, 배후 사고를 반드시 구체적으로 반영한다.
5) analysis의 마지막에는 그 감정이 더 커질 수 있음을 지적하고, 구체적인 확인 질문 예시를 제시한다. 

출력은 오직 JSON만 허용한다. (설명/주석/코드블록/번호/불릿 금지)
출력 스키마:
{
  "errors": [
    { "index": 1, "userQuote": "...", "analysis": "..." }
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

const FALLBACK_INDICES: ErrorIndex[] = [1, 5, 7];

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

function isValidIndex(n: unknown): n is ErrorIndex {
  return Number.isInteger(n) && typeof n === "number" && n >= 1 && n <= 10;
}

function defaultRank(): CognitiveErrorRankResult {
  return {
    ranked: ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as ErrorIndex[]).map((idx) => ({
      index: idx,
      reason:
        "입력 정보가 제한적이라 우선순위 판단이 어려워 기본 순서로 정리했습니다.",
    })),
  };
}

function fallbackDetail(
  candidates: ErrorIndex[],
  situation: string,
  thought: string
): CognitiveErrorDetailResult {
  const quote = cleanText(thought) || cleanText(situation) || thought;

  const make = (idx: ErrorIndex) => {
    if (idx === 1) {
      return "이 문장에서는 성공/실패처럼 두 극단으로 생각이 기울어져 있어요. 중간 가능성을 스스로 배제하면 감정이 더 커질 수 있어요. 지금 상황에서 ‘중간 단계의 가능성’이 하나라도 있는지, 구체적으로 무엇인지 확인해볼 수 있을까요?";
    }
    if (idx === 5) {
      return "이 문장에서는 확인되지 않은 가정이 빠르게 결론으로 굳어지는 흐름이 보여요. 근거가 부족한 채로 최악의 결과를 확정하면 감정이 더 커질 수 있어요. 실제로 확인된 사실과 아직 추정인 부분을 나눠보면, 지금은 어떤 것이 사실에 더 가까울까요?";
    }
    if (idx === 7) {
      return "이 문장에서는 지금의 느낌이 사실을 증명하는 것처럼 연결되는 지점이 있어요. ‘느껴지니까 사실’로 굳어지면 감정이 더 커질 수 있어요. 지금의 느낌을 뒷받침하는 ‘사실’은 무엇이고, 느낌만으로 채운 부분은 어디일까요?";
    }
    return "이 문장에서는 해석이 한 방향으로 빠르게 굳어지면서 다른 가능성이 줄어드는 흐름이 보여요. 이렇게 한 가지 해석만 남으면 감정이 더 커질 수 있어요. 지금 해석 말고, 조금 덜 아픈 해석이 하나라도 가능한지 확인해볼 수 있을까요?";
  };

  return {
    errors: candidates.map((idx) => ({
      index: idx,
      userQuote: quote,
      analysis: make(idx),
    })),
  };
}

/**
 * ✅ 2.a 랭킹
 */
export async function rankCognitiveErrors(
  situation: string,
  thought: string
): Promise<CognitiveErrorRankResult> {
  const prompt = `
[상황]
${situation}

[자동사고]
${thought}
`.trim();

  try {
    const raw = await callGptText(prompt, { systemPrompt: RANK_SYSTEM_PROMPT });

    const jsonText = extractJsonObject(raw);
    if (!jsonText) throw new Error("No JSON object in LLM output (rank)");

    const parsed = JSON.parse(jsonText) as RankLlmResponseShape;
    const arr = Array.isArray(parsed?.ranked) ? parsed.ranked : [];

    const seen = new Set<number>();
    const ranked: CognitiveErrorRankResult["ranked"] = [];

    for (const item of arr) {
      const idx = item?.index;
      if (!isValidIndex(idx)) continue;
      if (seen.has(idx)) continue;

      seen.add(idx);

      const reason =
        cleanText(item?.reason) || "가능성을 평가했지만 근거가 제한적입니다.";
      const evidenceQuote = cleanText(item?.evidenceQuote);

      ranked.push({
        index: idx,
        reason,
        ...(evidenceQuote ? { evidenceQuote } : {}),
      });
    }

    // 반드시 10개(1..10)여야 함
    if (ranked.length !== 10) return defaultRank();

    return { ranked };
  } catch (e) {
    console.error("인지오류 랭킹 실패(JSON):", e);
    return defaultRank();
  }
}

/**
 * ✅ 2.b 후보 상세(상위3 등 candidates만)
 */
export async function analyzeCognitiveErrorDetails(
  situation: string,
  thought: string,
  candidates: ErrorIndex[]
): Promise<CognitiveErrorDetailResult> {
  const uniq = Array.from(new Set(candidates)).filter((x) =>
    isValidIndex(x)
  ) as ErrorIndex[];

  const prompt = `
[상황]
${situation}

[자동사고]
${thought}

[candidates]
${uniq.join(", ")}
`.trim();

  try {
    const raw = await callGptText(prompt, { systemPrompt: DETAIL_SYSTEM_PROMPT });

    const jsonText = extractJsonObject(raw);
    if (!jsonText) throw new Error("No JSON object in LLM output (detail)");

    const parsed = JSON.parse(jsonText) as DetailLlmResponseShape;
    const arr = Array.isArray(parsed?.errors) ? parsed.errors : [];

    const seen = new Set<number>();
    const errors: CognitiveErrorDetailResult["errors"] = [];

    for (const item of arr) {
      const idx = item?.index;
      const q = cleanText(item?.userQuote);
      const a = cleanText(item?.analysis);

      if (!isValidIndex(idx)) continue;
      if (!uniq.includes(idx)) continue; // candidates 밖 금지
      if (seen.has(idx)) continue;
      if (!q || !a) continue;

      seen.add(idx);
      errors.push({ index: idx, userQuote: q, analysis: a });
    }

    // 부족하면 fallback으로 채움
    const missing = uniq.filter((c) => !errors.some((e) => e.index === c));
    if (missing.length > 0) {
      errors.push(...fallbackDetail(missing, situation, thought).errors);
    }

    // candidates 순서로 정렬
    errors.sort((a, b) => uniq.indexOf(a.index) - uniq.indexOf(b.index));

    return { errors };
  } catch (e) {
    console.error("인지오류 상세 분석 실패(JSON):", e);
    return fallbackDetail(uniq, situation, thought);
  }
}

/**
 * ✅ (호환) 기존 단일 분석 API
 * - 기존 코드가 깨지지 않도록 그대로 export
 * - 내부 구현은 (랭킹→상위 후보 상세)로 합성해 반환
 */
export async function analyzeCognitiveErrors(
  situation: string,
  thought: string
): Promise<CognitiveErrorAnalysisResult> {
  // 기존 프롬프트 스타일도 살려두되, 실패하면 2단계로 fallback
  const prompt = `상황: ${situation}\n배후 사고: ${thought}`;

  try {
    // 1) 기존 방식으로 먼저 시도(호환)
    const raw = await callGptText(prompt, { systemPrompt: LEGACY_SYSTEM_PROMPT });
    const jsonText = extractJsonObject(raw);
    if (!jsonText) throw new Error("No JSON object in LLM output (legacy)");

    const parsed = JSON.parse(jsonText) as {
      errors?: Array<{ index?: ErrorIndex; userQuote?: string; analysis?: string }>;
    };

    const arr = Array.isArray(parsed?.errors) ? parsed.errors : [];
    const seen = new Set<number>();
    const picked: CognitiveErrorAnalysisResult["errors"] = [];

    for (const item of arr) {
      const idx = item?.index;
      const q = cleanText(item?.userQuote);
      const a = cleanText(item?.analysis);

      if (!isValidIndex(idx)) continue;
      if (seen.has(idx)) continue;
      if (!q || !a) continue;

      seen.add(idx);
      const meta = COGNITIVE_ERRORS[idx - 1];
      picked.push({
        title: meta.title,
        description: meta.description,
        userQuote: q,
        analysis: a,
      });

      if (picked.length >= 5) break;
    }

    if (picked.length >= 3) return { errors: picked };

    // 2) 부족하면 2단계 합성으로 보강
    const rank = await rankCognitiveErrors(situation, thought);
    const top = rank.ranked.map((x) => x.index).slice(0, 5);
    const detail = await analyzeCognitiveErrorDetails(situation, thought, top);

    const merged = detail.errors.map((d) => {
      const meta = COGNITIVE_ERRORS[d.index - 1];
      return {
        title: meta.title,
        description: meta.description,
        userQuote: d.userQuote,
        analysis: d.analysis,
      };
    });

    return { errors: merged };
  } catch (e) {
    console.error("인지오류 분석 실패(JSON):", e);

    // 최종 fallback
    const detail = fallbackDetail(FALLBACK_INDICES, situation, thought);
    return {
      errors: detail.errors.map((d) => {
        const meta = COGNITIVE_ERRORS[d.index - 1];
        return {
          title: meta.title,
          description: meta.description,
          userQuote: d.userQuote,
          analysis: d.analysis,
        };
      }),
    };
  }
}
