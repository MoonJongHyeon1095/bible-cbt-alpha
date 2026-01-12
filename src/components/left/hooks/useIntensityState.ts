import { useCallback, useEffect, useRef, useState } from "react";
import type { EmotionThoughtPair } from "../../../types";

type UseIntensityStateParams = {
  pairKey: string;
};

const DEFAULT_TARGET_INTENSITY = 30;

export function useIntensityState({ pairKey }: UseIntensityStateParams) {
  const [targetIntensity, setTargetIntensity] = useState(
    DEFAULT_TARGET_INTENSITY
  );
  const [intensitySet, setIntensitySet] = useState(false);
  const [showIntensityModal, setShowIntensityModal] = useState(false);

  const lastPairKeyRef = useRef<string>("");

  useEffect(() => {
    if (!pairKey) return;

    if (lastPairKeyRef.current && lastPairKeyRef.current !== pairKey) {
      setTargetIntensity(DEFAULT_TARGET_INTENSITY);
      setIntensitySet(false);
      setShowIntensityModal(false);
    }

    lastPairKeyRef.current = pairKey;
  }, [pairKey]);

  const syncTargetIntensityFromPair = useCallback(
    (pair: EmotionThoughtPair | null) => {
      const pairIntensity = pair?.intensity ?? null;
      if (pairIntensity != null) {
        setTargetIntensity(Math.round(pairIntensity * 0.6));
      } else {
        setTargetIntensity(DEFAULT_TARGET_INTENSITY);
      }
    },
    []
  );

  const handleIntensitySet = useCallback(() => {
    setIntensitySet(true);
  }, []);

  const resetIntensitySet = useCallback(() => {
    setIntensitySet(false);
  }, []);

  return {
    handleIntensitySet,
    intensitySet,
    resetIntensitySet,
    setShowIntensityModal,
    setTargetIntensity,
    showIntensityModal,
    syncTargetIntensityFromPair,
    targetIntensity,
  };
}
