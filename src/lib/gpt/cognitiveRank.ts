// src/lib/gpt/cognitiveRank.ts
import { callGptText } from "./client";

/**
 * ✅ 기존 단일 분석 결과(호환용)
 * - 최종 API(analyzeCognitiveErrors)는 cognitiveAnalysis.ts에 존재
 */
export type CognitiveErrorAnalysisResult = {
  errors: Array<{
    title: string;
    description: string;
    analysis: string;
  }>;
};

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

type RankLlmResponseShape = {
  ranked?: Array<{
    index?: ErrorIndex;
    reason?: string;
    evidenceQuote?: string;
  }>;
};

export const FALLBACK_INDICES: ErrorIndex[] = [1, 5, 7];

export function extractJsonObject(raw: string): string | null {
  const cleaned = raw.replace(/```(?:json)?/g, "").replace(/```/g, "").trim();
  const s = cleaned.indexOf("{");
  const e = cleaned.lastIndexOf("}");
  if (s === -1 || e === -1 || e <= s) return null;
  return cleaned.slice(s, e + 1);
}

export function cleanText(v: unknown): string {
  return typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "";
}

export function isValidIndex(n: unknown): n is ErrorIndex {
  return Number.isInteger(n) && typeof n === "number" && n >= 1 && n <= 10;
}

export function defaultRank(): CognitiveErrorRankResult {
  return {
    ranked: ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as ErrorIndex[]).map((idx) => ({
      index: idx,
      reason:
        "입력 정보가 제한적이라 우선순위 판단이 어려워 기본 순서로 정리했습니다.",
    })),
  };
}

const RANK_SYSTEM_PROMPT = `
너는 인지행동치료(CBT) 관점에서 "인지오류(생각의 왜곡)" 가능성을 우선순위로 정렬하는 전문가다.

입력은 [상황]과 [자동사고]로 주어진다.
너의 목표:
- 아래 10가지 인지오류를 "해당 가능성이 높은 순서"로 10개 모두 정렬한다. (1~10 전부 포함, 중복 금지)
- 각 항목에 대해 reason(1~2문장)으로 왜 유력한지 짧게 설명한다. 설명의 끝은 "~에 해당합니다." 또는 "~로 보입니다." 또는 "~로 의심됩니다." 또는 그와 유사한 표현을 사용한다. (정의/교과서 설명 금지)
- evidenceQuote를 1개 포함한다. evidenceQuote는 반드시 [자동사고]에서 문장을 그대로 복사한다. (의역/요약 금지)
- 확신이 낮은 항목은 reason에서 "가능성은 낮지만" 같은 표현으로 톤을 조절한다.

중요 규칙:
1) 출력은 오직 JSON만 허용한다. (설명/주석/코드블록/번호/불릿 금지)
2) ranked 배열은 정확히 10개여야 한다.
3) index는 1..10만 가능하다.
4) evidenceQuote를 넣을 때는 반드시 원문 그대로 복사한다. 

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
