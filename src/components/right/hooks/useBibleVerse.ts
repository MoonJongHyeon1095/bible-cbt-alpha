import { useCallback, useEffect, useRef, useState } from "react";
import { generateBibleVerse } from "../../../lib/ai";
import type { EmotionThoughtPair } from "../../../types";
import type { BibleVerseResult } from "../types";

const bibleVerseCache = new Map<string, BibleVerseResult>();

type UseBibleVerseParams = {
  step: number;
  userInput: string;
  emotionThoughtPairs: EmotionThoughtPair[];
  isDeep: boolean;
  isChristian: boolean;
  hasSelectedThought: boolean;
  onAdvance: () => void;
};

export function useBibleVerse({
  step,
  userInput,
  emotionThoughtPairs,
  isDeep,
  isChristian,
  hasSelectedThought,
  onAdvance,
}: UseBibleVerseParams) {
  const [wantsBibleVerse, setWantsBibleVerse] = useState<boolean | null>(null);
  const [bibleVerse, setBibleVerse] = useState<BibleVerseResult | null>(null);
  const [bibleLoading, setBibleLoading] = useState(false);
  const [bibleError, setBibleError] = useState<string | null>(null);
  const bibleChoiceLockedRef = useRef(false);

  const resetBibleFlow = useCallback(() => {
    bibleChoiceLockedRef.current = false;
    setWantsBibleVerse(null);
    setBibleVerse(null);
    setBibleError(null);
    setBibleLoading(false);
  }, []);

  const lockBibleChoice = useCallback(() => {
    bibleChoiceLockedRef.current = true;
  }, []);

  const handleWantsBible = useCallback(async () => {
    lockBibleChoice();

    setWantsBibleVerse(true);

    try {
      const emotions = emotionThoughtPairs
        .map((p) =>
          isDeep && p.intensity != null
            ? `${p.emotion}(${p.intensity}/100)`
            : p.emotion
        )
        .join(", ");

      const cacheKey = JSON.stringify({
        userInput,
        emotions,
      });

      const cached = bibleVerseCache.get(cacheKey);
      if (cached) {
        setBibleVerse(cached);
        setBibleError(null);
        setBibleLoading(false);
        onAdvance();
        return;
      }

      setBibleLoading(true);
      setBibleError(null);

      const verse = await generateBibleVerse(userInput, emotions);
      bibleVerseCache.set(cacheKey, verse);
      setBibleVerse(verse);
      onAdvance();
    } catch (err) {
      setBibleError(
        err instanceof Error ? err.message : "오류가 발생했습니다."
      );
    } finally {
      setBibleLoading(false);
    }
  }, [emotionThoughtPairs, isDeep, lockBibleChoice, onAdvance, userInput]);

  useEffect(() => {
    if (!hasSelectedThought || step < 4) {
      resetBibleFlow();
    }
  }, [hasSelectedThought, resetBibleFlow, step]);

  useEffect(() => {
    if (
      isChristian &&
      hasSelectedThought &&
      wantsBibleVerse === false &&
      !bibleChoiceLockedRef.current
    ) {
      resetBibleFlow();
    }
  }, [hasSelectedThought, isChristian, resetBibleFlow, wantsBibleVerse]);

  return {
    wantsBibleVerse,
    setWantsBibleVerse,
    bibleVerse,
    bibleLoading,
    bibleError,
    handleWantsBible,
    lockBibleChoice,
  };
}
