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
  bibleVerse?: {
    book: string;
    chapter: number | null;
    startVerse: number | null;
    endVerse: number | null;
    verse: string;
    prayer: string;
  } | null;
  emotionDialMode?: "emotion-dial-active" | "emotion-dial-inactive";
}
