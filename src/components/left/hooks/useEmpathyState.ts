import { useCallback, useEffect, useRef, useState } from "react";
import { generateBurnsEmpathy } from "../../../lib/ai";
import type { EmotionThoughtPair } from "../../../types";
import type { BurnsEmpathyShape } from "./useLeftPageTypes";

type UseEmpathyStateParams = {
  step: number;
  currentPair: EmotionThoughtPair | null;
  pairKey: string;
  userInput: string;
  syncTargetIntensityFromPair: (pair: EmotionThoughtPair | null) => void;
};

const burnsCache = new Map<string, BurnsEmpathyShape>();

export function useEmpathyState({
  step,
  currentPair,
  pairKey,
  userInput,
  syncTargetIntensityFromPair,
}: UseEmpathyStateParams) {
  const [burnsEmpathy, setBurnsEmpathy] = useState<BurnsEmpathyShape | null>(
    null
  );
  const [empathyLoading, setEmpathyLoading] = useState(false);
  const [empathyError, setEmpathyError] = useState<string | null>(null);

  const lastPairKeyRef = useRef<string>("");

  const isStale = useCallback(
    (keyAtStart: string) => lastPairKeyRef.current !== keyAtStart,
    []
  );

  useEffect(() => {
    if (!pairKey) return;

    if (lastPairKeyRef.current && lastPairKeyRef.current !== pairKey) {
      setBurnsEmpathy(null);
      setEmpathyError(null);
      setEmpathyLoading(false);
    }

    lastPairKeyRef.current = pairKey;

    const cachedEmpathy = burnsCache.get(pairKey);
    if (cachedEmpathy) {
      setBurnsEmpathy(cachedEmpathy);
      syncTargetIntensityFromPair(currentPair);
    }
  }, [currentPair, pairKey, syncTargetIntensityFromPair]);

  const generateEmpathy = useCallback(async () => {
    if (!currentPair) return;
    const keyAtStart = pairKey;

    const cached = burnsCache.get(pairKey);
    if (cached) {
      setBurnsEmpathy(cached);
      syncTargetIntensityFromPair(currentPair);
      setEmpathyError(null);
      setEmpathyLoading(false);
      return;
    }

    setEmpathyLoading(true);
    setEmpathyError(null);

    try {
      const pairIntensity = currentPair.intensity ?? null;
      const result = await generateBurnsEmpathy(
        userInput,
        currentPair.emotion,
        currentPair.thought,
        pairIntensity
      );
      if (isStale(keyAtStart)) return;

      setBurnsEmpathy(result);
      burnsCache.set(pairKey, result);
      syncTargetIntensityFromPair(currentPair);
    } catch (err) {
      if (isStale(keyAtStart)) return;
      setEmpathyError(
        err instanceof Error ? err.message : "오류가 발생했습니다."
      );
    } finally {
      if (isStale(keyAtStart)) return;
      setEmpathyLoading(false);
    }
  }, [currentPair, isStale, pairKey, syncTargetIntensityFromPair, userInput]);

  useEffect(() => {
    if (step === 3 && currentPair && !burnsEmpathy && !empathyLoading) {
      void generateEmpathy();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, currentPair, burnsEmpathy, empathyLoading]);

  return {
    burnsEmpathy,
    empathyError,
    empathyLoading,
    generateEmpathy,
  };
}
