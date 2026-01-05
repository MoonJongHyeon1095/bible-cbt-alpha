// src/lib/ai.ts
// gpt
import {
  COGNITIVE_ERRORS,
  type ErrorIndex, // (호환) 기존 단일 호출
  analyzeCognitiveErrorDetails as gptAnalyzeCognitiveErrorDetails,
  generateBibleVerse as gptGenerateBibleVerse,
  generateBurnsEmpathy as gptGenerateBurnsEmpathy,
  generateContextualAlternativeThoughts as gptGenerateContextualAlternativeThoughts,
  generateExtendedAutomaticThoughts as gptGenerateExtendedAutomaticThoughts,
  rankCognitiveErrors as gptRankCognitiveErrors
} from "./gpt";

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

export type CognitiveErrorRankItem = {
  index: ErrorIndex;
  reason: string;
  evidenceQuote?: string;
};

export type CognitiveErrorRankResult = {
  ranked: CognitiveErrorRankItem[];
};

export type CognitiveErrorDetailItem = {
  index: ErrorIndex;
  analysis: string;
};

export type CognitiveErrorDetailResult = {
  errors: CognitiveErrorDetailItem[];
};

// 메타 export (UI에서 사용)
export { COGNITIVE_ERRORS };
export type { ErrorIndex };

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

// 1) 확장 자동사고
export async function generateExtendedAutomaticThoughts(
  situation: string,
  emotion: string
): Promise<ExtendedAutomaticThoughtsResult> {
  return gptGenerateExtendedAutomaticThoughts(situation, emotion);
}

// 2.a) 인지오류 랭킹(10개 유력순)
export async function rankCognitiveErrors(
  situation: string,
  thought: string
): Promise<CognitiveErrorRankResult> {
  return gptRankCognitiveErrors(situation, thought);
}

// 2.b) 인지오류 상세(후보 index만)
export async function analyzeCognitiveErrorDetails(
  situation: string,
  thought: string,
  candidates: ErrorIndex[]
): Promise<CognitiveErrorDetailResult> {
  return gptAnalyzeCognitiveErrorDetails(situation, thought, candidates);
}

// 3) 대안사고
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

// 4) 성경구절
export async function generateBibleVerse(
  situation: string,
  emotion: string
): Promise<BibleVerseResult> {
  return gptGenerateBibleVerse(situation, emotion);
}

// 5) 번즈 공감
export async function generateBurnsEmpathy(
  situation: string,
  emotion: string,
  thought: string,
  intensity: number
): Promise<BurnsEmpathyResult> {
  return gptGenerateBurnsEmpathy(situation, emotion, thought, intensity);
}
