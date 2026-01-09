import { useCallback, useEffect, useState } from "react";
import { generateContextualAlternativeThoughts } from "../../../lib/ai";
import type { EmotionThoughtPair } from "../../../types";
import type { SelectedCognitiveError } from "../../../types/sessionHistory";
import type { AlternativeThought } from "../types";

type UseAlternativeThoughtsParams = {
  step: number;
  userInput: string;
  emotionThoughtPairs: EmotionThoughtPair[];
  selectedCognitiveErrors: SelectedCognitiveError[];
};

export function useAlternativeThoughts({
  step,
  userInput,
  emotionThoughtPairs,
  selectedCognitiveErrors,
}: UseAlternativeThoughtsParams) {
  const [alternativeThoughts, setAlternativeThoughts] = useState<
    AlternativeThought[]
  >([]);
  const [thoughtsLoading, setThoughtsLoading] = useState(false);
  const [thoughtsError, setThoughtsError] = useState<string | null>(null);

  const generateAlternatives = useCallback(async () => {
    setThoughtsLoading(true);
    setThoughtsError(null);

    try {
      const emotions = emotionThoughtPairs.map((p) => p.emotion).join(", ");
      const firstPair = emotionThoughtPairs[0];
      const thoughts = await generateContextualAlternativeThoughts(
        userInput,
        emotions,
        firstPair?.thought ?? "",
        selectedCognitiveErrors
      );

      setAlternativeThoughts(thoughts);
    } catch (err) {
      setThoughtsError(
        err instanceof Error ? err.message : "오류가 발생했습니다."
      );
      console.error("대안사고 생성 오류:", err);
    } finally {
      setThoughtsLoading(false);
    }
  }, [emotionThoughtPairs, selectedCognitiveErrors, userInput]);

  useEffect(() => {
    if (
      step === 4 &&
      alternativeThoughts.length === 0 &&
      !thoughtsLoading &&
      emotionThoughtPairs.length > 0
    ) {
      void generateAlternatives();
    }
  }, [
    alternativeThoughts.length,
    emotionThoughtPairs.length,
    generateAlternatives,
    step,
    thoughtsLoading,
  ]);

  return {
    alternativeThoughts,
    thoughtsLoading,
    thoughtsError,
    generateAlternatives,
  };
}
