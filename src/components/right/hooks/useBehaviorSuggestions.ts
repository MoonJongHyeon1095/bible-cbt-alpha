import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { generateBehaviorSuggestions } from "../../../lib/ai";
import type { EmotionThoughtPair } from "../../../types";
import type { SelectedCognitiveError } from "../../../types/sessionHistory";
import type { CognitiveBehaviorId } from "../../../constants/behaviors";

const suggestionsCache = new Map<string, Record<CognitiveBehaviorId, string>>();

type BehaviorMeta = {
  id: CognitiveBehaviorId;
  replacement_title: string;
  category: string;
  description: string;
  usage_description: string;
};

type UseBehaviorSuggestionsParams = {
  enabled: boolean;
  userInput: string;
  emotionThoughtPairs: EmotionThoughtPair[];
  selectedCognitiveErrors: SelectedCognitiveError[];
  selectedAlternativeThought: string;
  behaviors: BehaviorMeta[];
};

export function useBehaviorSuggestions({
  enabled,
  userInput,
  emotionThoughtPairs,
  selectedCognitiveErrors,
  selectedAlternativeThought,
  behaviors,
}: UseBehaviorSuggestionsParams) {
  const [suggestionsById, setSuggestionsById] = useState<
    Record<CognitiveBehaviorId, string>
  >({} as Record<CognitiveBehaviorId, string>);
  const [loadingId, setLoadingId] = useState<
    "all" | CognitiveBehaviorId | null
  >(null);
  const [errorAll, setErrorAll] = useState<string | null>(null);
  const [errorById, setErrorById] = useState<
    Record<CognitiveBehaviorId, string | null>
  >({} as Record<CognitiveBehaviorId, string | null>);
  const lastKeyRef = useRef<string>("");

  const requestKey = useMemo(
    () =>
      JSON.stringify({
        userInput,
        emotionThoughtPairs,
        selectedCognitiveErrors,
        selectedAlternativeThought,
        behaviorIds: behaviors.map((b) => b.id),
      }),
    [
      behaviors,
      emotionThoughtPairs,
      selectedAlternativeThought,
      selectedCognitiveErrors,
      userInput,
    ]
  );

  const generateSuggestions = useCallback(async () => {
    if (!behaviors.length) return;

    setLoadingId("all");
    setErrorAll(null);
    setErrorById({} as Record<CognitiveBehaviorId, string | null>);

    try {
      const suggestions = await generateBehaviorSuggestions(
        userInput,
        emotionThoughtPairs,
        selectedAlternativeThought,
        selectedCognitiveErrors,
        behaviors
      );

      const next: Record<CognitiveBehaviorId, string> = {} as Record<
        CognitiveBehaviorId,
        string
      >;

      suggestions.forEach((item) => {
        next[item.behaviorId] = item.suggestion;
      });

      suggestionsCache.set(requestKey, next);
      setSuggestionsById(next);
    } catch (err) {
      console.error("행동 제안 생성 오류:", err);
      setErrorAll(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoadingId(null);
    }
  }, [
    behaviors,
    emotionThoughtPairs,
    selectedAlternativeThought,
    selectedCognitiveErrors,
    requestKey,
    userInput,
  ]);

  const regenerateOne = useCallback(
    async (behaviorId: CognitiveBehaviorId) => {
      const target = behaviors.find((b) => b.id === behaviorId);
      if (!target) return;

      setLoadingId(behaviorId);
      setErrorById((prev) => ({ ...prev, [behaviorId]: null }));

      try {
        const suggestions = await generateBehaviorSuggestions(
          userInput,
          emotionThoughtPairs,
          selectedAlternativeThought,
          selectedCognitiveErrors,
          [target]
        );

        const next = suggestions[0]?.suggestion;
        if (next) {
          setSuggestionsById((prev) => {
            const updated = { ...prev, [behaviorId]: next };
            suggestionsCache.set(requestKey, updated);
            return updated;
          });
        }
      } catch (err) {
        console.error("행동 제안 재생성 오류:", err);
        setErrorById((prev) => ({
          ...prev,
          [behaviorId]:
            err instanceof Error ? err.message : "오류가 발생했습니다.",
        }));
      } finally {
        setLoadingId(null);
      }
    },
    [
      behaviors,
      emotionThoughtPairs,
      selectedAlternativeThought,
      selectedCognitiveErrors,
      requestKey,
      userInput,
    ]
  );

  useEffect(() => {
    if (!enabled || behaviors.length === 0) return;
    if (lastKeyRef.current === requestKey) return;

    const cached = suggestionsCache.get(requestKey);
    if (cached) {
      lastKeyRef.current = requestKey;
      setSuggestionsById(cached);
      setErrorAll(null);
      setErrorById({} as Record<CognitiveBehaviorId, string | null>);
      return;
    }

    lastKeyRef.current = requestKey;
    setSuggestionsById({} as Record<CognitiveBehaviorId, string>);
    setErrorAll(null);
    setErrorById({} as Record<CognitiveBehaviorId, string | null>);
    void generateSuggestions();
  }, [behaviors.length, enabled, generateSuggestions, requestKey]);

  return {
    suggestionsById,
    loadingId,
    errorAll,
    errorById,
    regenerateAll: generateSuggestions,
    regenerateOne,
  };
}
