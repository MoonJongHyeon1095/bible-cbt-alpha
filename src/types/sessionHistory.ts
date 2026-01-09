import type {
  CognitiveErrorId,
  CognitiveErrorIndex,
} from "../constants/errors";

export interface SelectedCognitiveError {
  id?: CognitiveErrorId;
  index?: CognitiveErrorIndex;
  title: string;
  detail?: string;
}

export interface SessionHistory {
  id: string;
  timestamp: string;
  userInput: string;
  emotionThoughtPairs: Array<{
    emotion: string;
    intensity: number | null;
    thought: string;
  }>;
  selectedCognitiveErrors: SelectedCognitiveError[];
  selectedAlternativeThought: string;
  selectedBehavior?: {
    behaviorLabel: string;
    behaviorText: string;
  } | null;
  positiveReframes: { [emotion: string]: string };
  bibleVerse?: {
    verse: string;
    reference: string;
    prayer: string;
  } | null;
  detailMode?: "lite" | "deep";
}
