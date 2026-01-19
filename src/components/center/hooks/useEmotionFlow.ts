import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { generateExtendedAutomaticThoughts } from "../../../lib/ai";
import type { EmotionThoughtPair } from "../../../types";
import type { CbtMode } from "../../header/navigation/ModePicker";
import type { EmotionData } from "../types";
import { validateUserText } from "../../../utils/validation";

type PrefetchKey = string;

function makePrefetchKey(emotion: string, input: string): PrefetchKey {
  return `${emotion}::${input.trim()}`;
}

const thoughtsCache = new Map<PrefetchKey, string[]>();

export type EmotionView = "grid" | "detail" | "intensity" | "thoughts";

interface UseEmotionFlowParams {
  userInput: string;
  mode: CbtMode;
  emotionThoughtPairs: EmotionThoughtPair[];
  onSetEmotionThoughtPairs: (pairs: EmotionThoughtPair[]) => void;
  onNext: () => void;
  onScrollTop: () => void;
}

export function useEmotionFlow({
  userInput,
  mode,
  emotionThoughtPairs,
  onSetEmotionThoughtPairs,
  onNext,
  onScrollTop,
}: UseEmotionFlowParams) {
  const isEmotionDialActive =
    mode.emotionDialMode === "emotion-dial-active";

  const [view, setView] = useState<EmotionView>("grid");
  const [selectedEmotion, setSelectedEmotion] = useState<string>("");
  const [emotionIntensity, setEmotionIntensity] = useState(50);
  const [emotionDetailConfirmed, setEmotionDetailConfirmed] = useState(false);
  const [selectedEmotionData, setSelectedEmotionData] =
    useState<EmotionData | null>(null);

  const [generatedThoughts, setGeneratedThoughts] = useState<string[]>([]);
  const [selectedThoughtIndex, setSelectedThoughtIndex] = useState<
    number | null
  >(null);
  const [customThought, setCustomThought] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prefetchPromiseRef = useRef<Promise<void> | null>(null);
  const prefetchKeyRef = useRef<PrefetchKey | null>(null);

  const currentPrefetchKey = useMemo(() => {
    if (!selectedEmotion) return null;
    if (!userInput.trim()) return null;
    return makePrefetchKey(selectedEmotion, userInput);
  }, [selectedEmotion, userInput]);

  const clearPrefetch = () => {
    prefetchPromiseRef.current = null;
    prefetchKeyRef.current = null;
  };

  const resetForNewEmotion = () => {
    setEmotionDetailConfirmed(false);
    clearPrefetch();
    setGeneratedThoughts([]);
    setSelectedThoughtIndex(null);
    setCustomThought("");
    setView("grid");
    setError(null);
  };

  const startPrefetchThoughts = () => {
    if (!selectedEmotion || !userInput.trim()) return;

    const key = makePrefetchKey(selectedEmotion, userInput);

    const cachedThoughts = thoughtsCache.get(key);
    if (cachedThoughts) {
      prefetchKeyRef.current = key;
      prefetchPromiseRef.current = Promise.resolve();
      setGeneratedThoughts(cachedThoughts);
      setSelectedThoughtIndex(null);
      setCustomThought("");
      setError(null);
      setLoading(false);
      return;
    }

    if (prefetchKeyRef.current === key && prefetchPromiseRef.current) return;

    prefetchKeyRef.current = key;
    setLoading(true);
    setError(null);

    const p = (async () => {
      const result = await generateExtendedAutomaticThoughts(
        userInput,
        selectedEmotion
      );

      const thoughts = result.sdtThoughts.map((st) => st.thought);

      if (prefetchKeyRef.current === key) {
        thoughtsCache.set(key, thoughts);
        setGeneratedThoughts(thoughts);
        setSelectedThoughtIndex(null);
        setCustomThought("");
      }
    })()
      .catch((err) => {
        if (prefetchKeyRef.current === key) {
          setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
        }
      })
      .finally(() => {
        if (prefetchKeyRef.current === key) {
          setLoading(false);
        }
      });

    prefetchPromiseRef.current = p;
  };

  const finalizeEmotionAndShowThoughts = async (
    emotionOverride?: string,
    force?: boolean
  ) => {
    const emotion = emotionOverride ?? selectedEmotion;
    if (!emotion || !userInput.trim()) return;

    const key = makePrefetchKey(emotion, userInput);

    setView("thoughts");
    setError(null);

    if (!force) {
      const cachedThoughts = thoughtsCache.get(key);
      if (cachedThoughts) {
        setGeneratedThoughts(cachedThoughts);
        setSelectedThoughtIndex(null);
        setCustomThought("");
        onScrollTop();
        return;
      }
    }

    if (prefetchKeyRef.current === key && prefetchPromiseRef.current) {
      await prefetchPromiseRef.current;
      onScrollTop();
      return;
    }

    setLoading(true);
    try {
      const result = await generateExtendedAutomaticThoughts(
        userInput,
        emotion
      );
      const thoughts = result.sdtThoughts.map((st) => st.thought);
      thoughtsCache.set(key, thoughts);
      setGeneratedThoughts(thoughts);
      setSelectedThoughtIndex(null);
      setCustomThought("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }

    onScrollTop();
  };

  const handleEmotionSelect = (emotionData: EmotionData) => {
    if (!userInput.trim()) {
      toast.error("먼저 Step 1에서 내용을 입력해주세요.");
      return;
    }

    setSelectedEmotionData(emotionData);
    setSelectedEmotion(emotionData.label);
    resetForNewEmotion();
    setView("detail");
  };

  const handleSelectThisEmotion = async () => {
    if (!selectedEmotionData) return;
    if (!emotionDetailConfirmed) return;

    const emotionLabel = selectedEmotionData.label;

    if (isEmotionDialActive) {
      setView("intensity");
      return;
    }

    await finalizeEmotionAndShowThoughts(emotionLabel);
  };

  const handleThoughtSelect = (index: number) => {
    setSelectedThoughtIndex(index);
    setCustomThought("");
  };

  const handleCustomThoughtChange = (value: string) => {
    setCustomThought(value);
    if (
      value &&
      selectedThoughtIndex !== null &&
      selectedThoughtIndex !== 999
    ) {
      setSelectedThoughtIndex(null);
    }
  };

  const handleCustomThoughtSelect = () => {
    setSelectedThoughtIndex(999);
  };

  const submitCustomThought = (customText: string) => {
    const trimmed = customText.trim();
    if (!trimmed) return;
    const validation = validateUserText(trimmed, {
      minLength: 10,
      minLengthMessage: "직접 입력한 생각을 10자 이상 적어주세요.",
    });
    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }

    const storedIntensity = isEmotionDialActive ? emotionIntensity : null;
    const newPair: EmotionThoughtPair = {
      emotion: selectedEmotion,
      intensity: storedIntensity,
      thought: trimmed,
    };
    setSelectedThoughtIndex(999);
    setCustomThought(trimmed);
    onSetEmotionThoughtPairs([newPair]);

    onScrollTop();
    onNext();
  };

  const handleComplete = () => {
    if (selectedThoughtIndex === null) return;

    const storedIntensity = isEmotionDialActive ? emotionIntensity : null;

    const newPair: EmotionThoughtPair = {
      emotion: selectedEmotion,
      intensity: storedIntensity,
      thought: generatedThoughts[selectedThoughtIndex],
    };

    onSetEmotionThoughtPairs([newPair]);
    onScrollTop();
    onNext();
  };

  const submitThoughtSelection = () => {
    if (selectedThoughtIndex === null) return;

    if (selectedThoughtIndex === 999 && customThought.trim()) {
      const storedIntensity = isEmotionDialActive ? emotionIntensity : null;
      const newPair: EmotionThoughtPair = {
        emotion: selectedEmotion,
        intensity: storedIntensity,
        thought: customThought.trim(),
      };
      onSetEmotionThoughtPairs([newPair]);
      onNext();
      return;
    }

    handleComplete();
  };

  return {
    isEmotionDialActive,
    view,
    selectedEmotion,
    setSelectedEmotion,
    selectedEmotionData,
    emotionIntensity,
    setEmotionIntensity,
    emotionDetailConfirmed,
    setEmotionDetailConfirmed,
    generatedThoughts,
    selectedThoughtIndex,
    customThought,
    loading,
    error,
    currentPrefetchKey,
    resetForNewEmotion,
    handleEmotionSelect,
    handleSelectThisEmotion,
    startPrefetchThoughts,
    finalizeEmotionAndShowThoughts,
    handleThoughtSelect,
    handleCustomThoughtChange,
    handleCustomThoughtSelect,
    submitCustomThought,
    submitThoughtSelection,
    clearPrefetch,
    setSelectedEmotionData,
    setView,
  };
}
