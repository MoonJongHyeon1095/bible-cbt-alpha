

// src/lib/gpt/cognitive.ts
import { callGptText } from "./client";

export interface CognitiveErrorAnalysisResult {
  errors: Array<{
    title: string;
    description: string;
    userQuote: string;
    analysis: string;
  }>;
}

const COGNITIVE_ERRORS = [
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

type ErrorIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

type LlmResponseShape = {
  errors?: Array<{
    index: ErrorIndex; // 1..10
    userQuote: string; // 원문에서 짧게 그대로 인용(또는 thought/situation 일부)
    analysis: string; // 2~3문장
  }>;
};

const SYSTEM_PROMPT = `
너는 인지행동치료(CBT) 관점에서 "인지오류"를 식별하는 전문가다.

요구사항:
- 아래 10가지 인지오류 중 해당하는 것을 3~5개 고른다.
- index 의미에 정확히 부합하는 경우만 선택한다. 애매하면 다른 index를 고르거나 제외한다.
- userQuote는 입력 텍스트에서 문장을 그대로 복사한다(의역/요약 금지).
- analysis는 왜 해당 인지오류인지 2~3문장으로 구체적으로 설명한다.
- 중복(동일 인지오류) 선택은 피한다.
- 출력은 오직 JSON만 허용한다. (설명/주석/코드블록/번호/불릿 금지)
- 아래 스키마를 정확히 지킨다.

출력 스키마(정확히):
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

function toResult(indices: ErrorIndex[], situation: string, thought: string): CognitiveErrorAnalysisResult {
  const errors = indices.map((idx, i) => {
    const meta = COGNITIVE_ERRORS[idx - 1];
    const quoteSource = i === 0 ? thought : situation || thought;
    return {
      title: meta.title,
      description: meta.description,
      userQuote: cleanText(quoteSource) || thought,
      analysis:
        idx === 1
          ? "이 생각은 성공/실패처럼 이분법으로 단정하는 경향이 있다. 중간 가능성과 다양한 해석을 배제하고 있다."
          : idx === 5
          ? "충분한 근거 없이 부정적인 결론을 빠르게 확정하고 있다. 확인되지 않은 가정이 감정을 키우고 있다."
          : "현재 느끼는 감정을 객관적 사실처럼 취급하고 있다. 감정과 사실을 분리해 보는 시도가 필요하다.",
    };
  });

  return { errors };
}

export async function analyzeCognitiveErrors(
  situation: string,
  thought: string
): Promise<CognitiveErrorAnalysisResult> {
  // ✅ user prompt는 최소 정보만: 상황/사고 + 10개 목록은 system에 이미 고정
  const prompt = `상황: ${situation}\n자동사고: ${thought}`;

  try {
    const raw = await callGptText(prompt, { systemPrompt: SYSTEM_PROMPT });

    const jsonText = extractJsonObject(raw);
    if (!jsonText) throw new Error("No JSON object in LLM output");

    const parsed = JSON.parse(jsonText) as LlmResponseShape;
    const arr = Array.isArray(parsed?.errors) ? parsed.errors : [];

    const seen = new Set<number>();
    const picked: CognitiveErrorAnalysisResult["errors"] = [];

    for (const item of arr) {
      const idx = item?.index;
      const q = cleanText(item?.userQuote);
      const a = cleanText(item?.analysis);

      if (!Number.isInteger(idx) || idx < 1 || idx > 10) continue;
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

    // ✅ 최소 3개 보장 (모델이 덜 주면 fallback으로 채움)
    if (picked.length < 3) {
      const needed = 3 - picked.length;
      for (const idx of FALLBACK_INDICES) {
        if (picked.length >= 3) break;
        if (picked.some((e) => e.title === COGNITIVE_ERRORS[idx - 1].title)) continue;

        const meta = COGNITIVE_ERRORS[idx - 1];
        picked.push({
          title: meta.title,
          description: meta.description,
          userQuote: cleanText(thought) || thought,
          analysis:
            idx === 1
              ? "이 생각은 성공/실패처럼 이분법으로 단정하는 경향이 있다. 중간 가능성과 다양한 해석을 배제하고 있다."
              : idx === 5
              ? "충분한 근거 없이 부정적인 결론을 빠르게 확정하고 있다. 확인되지 않은 가정이 감정을 키우고 있다."
              : "현재 느끼는 감정을 객관적 사실처럼 취급하고 있다. 감정과 사실을 분리해 보는 시도가 필요하다.",
        });
      }
      // 그래도 부족하면 그냥 고정 3개로 반환
      if (picked.length < 3) return toResult(FALLBACK_INDICES, situation, thought);
    }

    return { errors: picked };
  } catch (e) {
    console.error("인지오류 분석 실패(JSON):", e);
    return toResult(FALLBACK_INDICES, situation, thought);
  }
}
