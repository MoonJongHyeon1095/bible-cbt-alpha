// src/lib/ai.ts
import { getDevAIProvider } from "./devAiProvider";

// gemini
import {
  generateContextualAlternativeThoughts as gemAlt,
  generateBibleVerse as gemBible,
  generateBurnsEmpathy as gemBurns,
  analyzeCognitiveErrors as gemCog,
  generateExtendedAutomaticThoughts as gemExt,
} from "./gemini";

// gpt
import {
  generateContextualAlternativeThoughts as gptAlt,
  generateBibleVerse as gptBible,
  generateBurnsEmpathy as gptBurns,
  analyzeCognitiveErrors as gptCog,
  generateExtendedAutomaticThoughts as gptExt,
} from "./gpt";

/** ✅ 0) 공통 타입(계약) 정의 */
export type ExtendedAutomaticThought = {
  thought: string;
  // 필요하면 reason/label 같은 필드 추가 가능
};

export type ExtendedAutomaticThoughtsResult = {
  sdtThoughts: ExtendedAutomaticThought[];
};

export type CognitiveErrorItem = {
  title: string;
  description: string;
  userQuote: string;
  analysis: string;
};

export type CognitiveErrorAnalysisResult = {
  errors: CognitiveErrorItem[];
};

export type BurnsEmpathyResult = {
  thoughtEmpathy: string;
  emotionEmpathy: string;
  iStatement: string;
  question: string;
  soothing: string;
};

export type AlternativeThoughtItem = {
  thought: string;
  technique: string;
  techniqueDescription: string;
};

export type BibleVerseResult = {
  verse: string;
  reference: string;
  prayer: string;
};

// ✅ 1) 확장 자동사고
export async function generateExtendedAutomaticThoughts(
  situation: string,
  emotion: string
): Promise<ExtendedAutomaticThoughtsResult> {
  return getDevAIProvider() === "openai"
    ? (gptExt(situation, emotion) as Promise<ExtendedAutomaticThoughtsResult>)
    : (gemExt(situation, emotion) as Promise<ExtendedAutomaticThoughtsResult>);
}

// ✅ 2) 인지오류
export async function analyzeCognitiveErrors(
  situation: string,
  thought: string
): Promise<CognitiveErrorAnalysisResult> {
  return getDevAIProvider() === "openai"
    ? (gptCog(situation, thought) as Promise<CognitiveErrorAnalysisResult>)
    : (gemCog(situation, thought) as Promise<CognitiveErrorAnalysisResult>);
}

// ✅ 3) 대안사고
export async function generateContextualAlternativeThoughts(
  situation: string,
  emotion: string,
  thought: string,
  cognitiveErrors: string[]
): Promise<AlternativeThoughtItem[]> {
  return getDevAIProvider() === "openai"
    ? (gptAlt(
        situation,
        emotion,
        thought,
        cognitiveErrors
      ) as Promise<AlternativeThoughtItem[]>)
    : (gemAlt(
        situation,
        emotion,
        thought,
        cognitiveErrors
      ) as Promise<AlternativeThoughtItem[]>);
}

// ✅ 4) 성경구절
export async function generateBibleVerse(
  situation: string,
  emotion: string
): Promise<BibleVerseResult> {
  return getDevAIProvider() === "openai"
    ? (gptBible(situation, emotion) as Promise<BibleVerseResult>)
    : (gemBible(situation, emotion) as Promise<BibleVerseResult>);
}

// ✅ 5) 번즈 공감
export async function generateBurnsEmpathy(
  situation: string,
  emotion: string,
  thought: string,
  intensity: number
): Promise<BurnsEmpathyResult> {
  return getDevAIProvider() === "openai"
    ? (gptBurns(
        situation,
        emotion,
        thought,
        intensity
      ) as Promise<BurnsEmpathyResult>)
    : (gemBurns(
        situation,
        emotion,
        thought,
        intensity
      ) as Promise<BurnsEmpathyResult>);
}
