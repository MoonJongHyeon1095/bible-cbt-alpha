import type { ErrorIndex } from "../../../lib/ai";

export type RankItem = {
  index: ErrorIndex;
  reason: string;
  evidenceQuote?: string;
};

export type DetailItem = {
  index: ErrorIndex;
  analysis: string;
};

export type CognitiveErrorMeta = {
  index: ErrorIndex;
  title: string;
  description: string;
};
