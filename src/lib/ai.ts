// src/lib/ai.ts

// gpt 
import {
  analyzeCognitiveErrors as gptAnalyzeCognitiveErrors,
  generateBibleVerse as gptGenerateBibleVerse,
  generateBurnsEmpathy as gptGenerateBurnsEmpathy,
  generateContextualAlternativeThoughts as gptGenerateContextualAlternativeThoughts,
  generateExtendedAutomaticThoughts as gptGenerateExtendedAutomaticThoughts,
} from "./gpt";

/** ✅ 0) 공통 타입(계약) 정의 */
export type ExtendedAutomaticThought = {
  thought: string;
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
  return gptGenerateExtendedAutomaticThoughts(situation, emotion);
}

// ✅ 2) 인지오류
export async function analyzeCognitiveErrors(
  situation: string,
  thought: string
): Promise<CognitiveErrorAnalysisResult> {
  return gptAnalyzeCognitiveErrors(situation, thought);
}

// ✅ 3) 대안사고
export async function generateContextualAlternativeThoughts(
  situation: string,
  emotion: string,
  thought: string,
  cognitiveErrors: string[]
): Promise<AlternativeThoughtItem[]> {
  return gptGenerateContextualAlternativeThoughts(
    situation,
    emotion,
    thought,
    cognitiveErrors
  );
}

// ✅ 4) 성경구절
export async function generateBibleVerse(
  situation: string,
  emotion: string
): Promise<BibleVerseResult> {
  return gptGenerateBibleVerse(situation, emotion);
}

// ✅ 5) 번즈 공감
export async function generateBurnsEmpathy(
  situation: string,
  emotion: string,
  thought: string,
  intensity: number
): Promise<BurnsEmpathyResult> {
  return gptGenerateBurnsEmpathy(
    situation,
    emotion,
    thought,
    intensity
  );
}
