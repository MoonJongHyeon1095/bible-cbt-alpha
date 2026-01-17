import { useEffect, useMemo, useState } from "react";
import { generateExtendedAutomaticThoughts } from "../../../../lib/ai";

type AutoThoughtCacheEntry = {
  thoughts: string[];
  index: number;
  hasShownCustomPrompt: boolean;
};

type UseAutoThoughtSuggestionsParams = {
  userInput: string;
  emotion: string;
  onResetSelection: () => void;
};

const autoThoughtCache = new Map<string, AutoThoughtCacheEntry>();
const AUTO_THOUGHT_STORAGE_PREFIX = "minimal-auto-thoughts:";

export function useAutoThoughtSuggestions({
  userInput,
  emotion,
  onResetSelection,
}: UseAutoThoughtSuggestionsParams) {
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasShownCustomPrompt, setHasShownCustomPrompt] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = useMemo(
    () => `${emotion}::${userInput.trim()}`,
    [emotion, userInput]
  );

  const loadThoughts = async () => {
    if (!userInput.trim() || !emotion) return;
    setLoading(true);
    setError(null);
    onResetSelection();
    try {
      const result = await generateExtendedAutomaticThoughts(userInput, emotion);
      const nextThoughts = result.sdtThoughts.map((item) => item.thought);
      setThoughts(nextThoughts);
      setCurrentIndex(0);
      setHasShownCustomPrompt(false);
      autoThoughtCache.set(cacheKey, {
        thoughts: nextThoughts,
        index: 0,
        hasShownCustomPrompt: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userInput.trim() || !emotion) return;
    const cached = autoThoughtCache.get(cacheKey);
    if (cached) {
      setThoughts(cached.thoughts);
      setCurrentIndex(cached.index);
      setHasShownCustomPrompt(cached.hasShownCustomPrompt);
      setLoading(false);
      setError(null);
      return;
    }
    if (typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem(
          `${AUTO_THOUGHT_STORAGE_PREFIX}${cacheKey}`
        );
        if (raw) {
          const parsed = JSON.parse(raw) as AutoThoughtCacheEntry;
          if (parsed?.thoughts?.length) {
            setThoughts(parsed.thoughts);
            setCurrentIndex(parsed.index ?? 0);
            setHasShownCustomPrompt(Boolean(parsed.hasShownCustomPrompt));
            setLoading(false);
            setError(null);
            autoThoughtCache.set(cacheKey, parsed);
            return;
          }
        }
      } catch {
        // ignore cache read errors
      }
    }
    setHasShownCustomPrompt(false);
    void loadThoughts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, emotion, userInput]);

  const currentThought = useMemo(() => {
    return thoughts[currentIndex] ?? "";
  }, [currentIndex, thoughts]);

  useEffect(() => {
    if (currentIndex >= 2) {
      setHasShownCustomPrompt(true);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (!cacheKey || thoughts.length === 0) return;
    const entry = {
      thoughts,
      index: currentIndex,
      hasShownCustomPrompt,
    };
    autoThoughtCache.set(cacheKey, entry);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(
          `${AUTO_THOUGHT_STORAGE_PREFIX}${cacheKey}`,
          JSON.stringify(entry)
        );
      } catch {
        // ignore cache write errors
      }
    }
  }, [cacheKey, currentIndex, hasShownCustomPrompt, thoughts]);

  const goNextThought = () => {
    if (currentIndex < thoughts.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      onResetSelection();
      return;
    }
    void loadThoughts();
  };

  return {
    currentThought,
    loading,
    error,
    shouldShowCustom: hasShownCustomPrompt,
    goNextThought,
    reloadThoughts: loadThoughts,
  };
}
