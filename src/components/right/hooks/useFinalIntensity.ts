import { useCallback, useState } from "react";
import type { EmotionThoughtPair } from "../../../types";

export function useFinalIntensity(emotionThoughtPairs: EmotionThoughtPair[]) {
  const [finalIntensities, setFinalIntensities] = useState<
    Record<string, number>
  >({});
  const [showFinalIntensity, setShowFinalIntensity] = useState(false);

  const seedFinalIntensitiesFromPairs = useCallback(() => {
    const initial: Record<string, number> = {};
    for (const pair of emotionThoughtPairs) {
      if (pair.intensity != null) initial[pair.emotion] = pair.intensity;
    }
    setFinalIntensities(initial);
  }, [emotionThoughtPairs]);

  return {
    finalIntensities,
    setFinalIntensities,
    showFinalIntensity,
    setShowFinalIntensity,
    seedFinalIntensitiesFromPairs,
  };
}
