

// src/lib/gpt/bible.ts
import { callGptText } from "./client";

export type BibleResult = {
  verse: string;
  reference: string;
  prayer: string;
};

type LlmResponseShape = {
  result?: Partial<BibleResult>;
} & Partial<BibleResult>; // ✅ 루트로 오는 케이스도 허용

const SYSTEM_PROMPT = `
너는 한국어로 답하는 성경에 정통한 기독교 목회 상담가다.
사용자의 상황과 감정에 맞는 "위로/소망" 중심의 성경 구절 1개와,
그 말씀에 기반한 기도문을 제안한다.

원칙:
- 과도한 단정/정죄/훈계 금지. 부드럽고 따뜻하게.
- 구절은 1~2 구절이상의 분량을 인용한다.

reference(책명/장/절 표기) 요구사항:
- "책 장:절" 형태로 명확히 쓴다. (예: "마태복음 11:28~29")

verse(본문 내용) 요구사항:
- 반드시 "개역한글" 성경 본문을 그대로 인용한다. (의역/요약/재진술 금지)
- reference에 적힌 범위(예: 11:28~29)와 "절 수/순서/문장"이 정확히 1:1로 일치해야 한다.
- verse에는 본문 텍스트만 넣고, 책명/장/절 표기(reference)나 괄호 설명을 섞지 않는다.
- 선택한 구절이 2절 이상이면 각 절을 자연스럽게 이어서 한 문장처럼 출력
  "책이름 장:절" 같은 표기는 절대 포함하지 않는다.

기도(prayer) 요구사항:
- 반드시 기도체(“~소서”)로만 쓴다. 존댓말(~요) 섞지 않는다.
- 표현이 어색하지 않도록 주의한다.
- 5~7문장으로 쓴다.
- 사용자의 [상황]에서 구체 디테일을 2개 이상 자연스럽게 반영한다.
- [감정] 단어를 1번 이상 포함한다.
- “말씀(verse)의 핵심 의미”를 1문장으로 붙잡아 다시 말한다.
- 마지막은 반드시 “예수님의 이름으로 기도합니다. 아멘.”으로 끝낸다.

출력은 오직 JSON만. 설명/주석/코드블록/번호/불릿 금지.

출력 스키마(정확히):
{
  "result": {
    "verse": "...",
    "reference": "...",
    "prayer": "..."
  }
}
`.trim();
const FALLBACK = (emotion: string): BibleResult => ({
  verse: "수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라",
  reference: "마태복음 11:28",
  prayer: `주님, 제 마음이 ${emotion}으로 무거울 때 주님께 나아가 쉬게 하소서. 오늘도 주님의 평안으로 제 마음을 붙들어 주소서. 아멘.`,
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

export async function generateBibleVerse(
  situation: string,
  emotion: string
): Promise<BibleResult> {
  const prompt = `
[상황]
${situation}

[감정]
${emotion}

위 상황과 감정에 맞는 성경 구절 1개와 짧은 기도문을 JSON 스키마로만 출력하라.
`.trim();

  try {
    const raw = await callGptText(prompt, { systemPrompt: SYSTEM_PROMPT });

    const jsonText = extractJsonObject(raw);
    if (!jsonText) throw new Error("No JSON object in LLM output");

    const parsed = JSON.parse(jsonText) as LlmResponseShape;
    console.log("Parsed Bible LLM response:", parsed);

    // ✅ result로 오든, 루트로 오든 수용
    const r = (parsed.result ?? parsed) as Partial<BibleResult>;

    const result: BibleResult = {
      verse: cleanText(r.verse),
      reference: cleanText(r.reference),
      prayer: cleanText(r.prayer),
    };

    const fb = FALLBACK(emotion);
    return {
      verse: result.verse || fb.verse,
      reference: result.reference || fb.reference,
      prayer: result.prayer || fb.prayer,
    };
  } catch (error) {
    console.error("성경 구절 생성 실패(JSON):", error);
    return FALLBACK(emotion);
  }
}
