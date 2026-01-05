export interface SessionHistory {
  id: string;
  timestamp: string;
  userInput: string;
  emotionThoughtPairs: Array<{
    emotion: string;
    intensity: number | null;
    thought: string;
  }>;
  selectedCognitiveErrors: string[];
  selectedAlternativeThought: string;
  positiveReframes: { [emotion: string]: string };
  bibleVerse?: {
    verse: string;
    reference: string;
    prayer: string;
  } | null;
  detailMode?: "lite" | "deep";
}
