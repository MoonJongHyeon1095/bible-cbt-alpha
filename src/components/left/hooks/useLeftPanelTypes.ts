import type { ErrorIndex } from "../../../lib/ai";

export type BurnsEmpathyShape = {
  thoughtEmpathy: string;
  emotionEmpathy: string;
  iStatement: string;
  soothing: string;
  observedSelf: string;
};

export type RankItem = {
  index: ErrorIndex;
  reason: string;
  evidenceQuote?: string;
};

export type DetailItem = {
  index: ErrorIndex;
  analysis: string;
};
