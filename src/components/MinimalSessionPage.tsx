import { useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import type { EmotionThoughtPair } from "../types";
import type {
  SelectedCognitiveError,
  SessionHistory,
} from "../types/sessionHistory";
import { supabase } from "../lib/supabase/client";
import { clearCbtSessionStorage } from "../utils/cbtSessionStorage";
import type { CbtMode } from "./header/navigation/ModePicker";
import { MinimalAutoThoughtSection } from "./center/minimal/MinimalAutoThoughtSection";
import { MinimalEmotionSection } from "./center/minimal/MinimalEmotionSection";
import { MinimalIncidentSection } from "./center/minimal/MinimalIncidentSection";
import { MinimalFloatingBackButton } from "./common/MinimalFloatingBackButton";
import { MinimalSavingModal } from "./common/MinimalSavingModal";
import { MinimalCognitiveErrorSection } from "./left/minimal/MinimalCognitiveErrorSection";
import { MinimalAlternativeThoughtSection } from "./right/minimal/MinimalAlternativeThoughtSection";
import { saveMinimalPatternAPI } from "./right/minimal/utils/api";
import { saveMinimalPatternLocal } from "./right/minimal/utils/storage";

type MinimalStep = "incident" | "emotion" | "thought" | "errors" | "alternative";

interface MinimalSessionPageProps {
  mode: CbtMode;
  user: User | null;
  onComplete: () => void;
}

export function MinimalSessionPage({
  mode,
  user,
  onComplete,
}: MinimalSessionPageProps) {
  const [step, setStep] = useState<MinimalStep>("incident");
  const [userInput, setUserInput] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [emotionThoughtPairs, setEmotionThoughtPairs] = useState<
    EmotionThoughtPair[]
  >([]);
  const [selectedCognitiveErrors, setSelectedCognitiveErrors] = useState<
    SelectedCognitiveError[]
  >([]);
  const [autoThoughtWantsCustom, setAutoThoughtWantsCustom] = useState(false);
  const [alternativeSeed, setAlternativeSeed] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const lastErrorsKeyRef = useRef<string>("");
  const stepOrder: MinimalStep[] = [
    "incident",
    "emotion",
    "thought",
    "errors",
    "alternative",
  ];
  const currentStepIndex = stepOrder.indexOf(step);

  const handleBack = () => {
    if (currentStepIndex <= 0) return;
    if (step === "thought" && autoThoughtWantsCustom) {
      setAutoThoughtWantsCustom(false);
      return;
    }
    setStep(stepOrder[currentStepIndex - 1]);
  };

  const handleSubmitThought = (thought: string) => {
    const nextPair: EmotionThoughtPair = {
      emotion: selectedEmotion,
      intensity: null,
      thought,
    };
    setEmotionThoughtPairs([nextPair]);
    setStep("errors");
  };

  const handleSelectErrors = (errors: SelectedCognitiveError[]) => {
    const nextKey = JSON.stringify(
      errors.map((item) => ({
        id: item.id,
        index: item.index,
        title: item.title,
        detail: item.detail,
      }))
    );
    if (nextKey !== lastErrorsKeyRef.current) {
      setAlternativeSeed((prev) => prev + 1);
      lastErrorsKeyRef.current = nextKey;
    }
    setSelectedCognitiveErrors(errors);
    setStep("alternative");
  };

  const handleComplete = async (thought: string) => {
    if (isSaving) return;
    const totalStartedAt = Date.now();
    let completed = false;
    const markMinimalSeen = () => {
      try {
        localStorage.setItem("minimal_session_seen", "true");
      } catch {
        // ignore
      }
    };
    const transitionAfter = (delayMs: number) => {
      window.setTimeout(() => {
        clearCbtSessionStorage();
        onComplete();
      }, delayMs);
    };
    const pairsToSave = emotionThoughtPairs.map((pair) => ({
      ...pair,
      intensity: null,
    }));

    const historyItem: SessionHistory = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      userInput,
      emotionThoughtPairs: pairsToSave,
      selectedCognitiveErrors,
      selectedAlternativeThought: thought,
      selectedBehavior: null,
      positiveReframes: {},
      bibleVerse: null,
      detailMode: mode.detailMode,
    };

    const minimalPayload = {
      triggerText: userInput,
      emotion: selectedEmotion,
      automaticThought: emotionThoughtPairs[0]?.thought ?? "",
      alternativeThought: thought,
      cognitiveError: selectedCognitiveErrors[0] ?? null,
    };

    setIsSaving(true);
    try {
      if (user) {
        const { ok } = await saveMinimalPatternAPI(minimalPayload);
        if (!ok) {
          throw new Error("save_minimal_note_failed");
        }
      } else {
        saveMinimalPatternLocal(minimalPayload);
      }

      if (user) {
        const { error } = await supabase.from("session_history").insert({
          user_id: user.id,
          timestamp: historyItem.timestamp,
          user_input: historyItem.userInput,
          emotion_thought_pairs: pairsToSave,
          selected_cognitive_errors: historyItem.selectedCognitiveErrors,
          selected_alternative_thought: historyItem.selectedAlternativeThought,
          selected_behavior: historyItem.selectedBehavior,
          positive_reframes: historyItem.positiveReframes,
          bible_verse: historyItem.bibleVerse,
        });
        if (error) throw error;
      } else {
        const existing = localStorage.getItem("cbt_history");
        const histories = existing ? JSON.parse(existing) : [];
        histories.unshift(historyItem);
        if (histories.length > 20) histories.pop();
        localStorage.setItem("cbt_history", JSON.stringify(histories));
      }

      toast.success("세션 기록이 저장되었습니다.");
      markMinimalSeen();
      transitionAfter(120);
      completed = true;
    } catch (e) {
      console.error("세션 저장 실패:", e);
      toast.error("세션 기록을 저장하지 못했습니다.");
      markMinimalSeen();
      transitionAfter(240);
      completed = true;
    } finally {
      console.info(
        `[minimal-save] total: ${Date.now() - totalStartedAt}ms`
      );
      if (!completed) {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#efe9df] via-[#f7f3ee] to-[#dfe8e6] dark:from-[#0f1115] dark:via-[#141824] dark:to-[#0f1a1f]">
      <MinimalSavingModal open={isSaving} />
      {currentStepIndex > 0 && (
        <div className="absolute inset-x-0 top-6 z-10">
          <div className="mx-auto max-w-xl px-6">
            <MinimalFloatingBackButton onClick={handleBack} />
          </div>
        </div>
      )}
      {step === "incident" && (
        <MinimalIncidentSection
          userInput={userInput}
          onInputChange={setUserInput}
          onNext={() => setStep("emotion")}
        />
      )}

      {step === "emotion" && (
        <MinimalEmotionSection
          selectedEmotion={selectedEmotion}
          onSelectEmotion={setSelectedEmotion}
          onNext={() => {
            setAutoThoughtWantsCustom(false);
            setStep("thought");
          }}
        />
      )}

      {step === "thought" && (
        <MinimalAutoThoughtSection
          userInput={userInput}
          emotion={selectedEmotion}
          wantsCustom={autoThoughtWantsCustom}
          onWantsCustomChange={setAutoThoughtWantsCustom}
          onSubmitThought={handleSubmitThought}
        />
      )}

      {step === "errors" && (
        <MinimalCognitiveErrorSection
          userInput={userInput}
          thought={emotionThoughtPairs[0]?.thought ?? ""}
          onSelect={handleSelectErrors}
        />
      )}

      {step === "alternative" && (
        <MinimalAlternativeThoughtSection
          userInput={userInput}
          emotionThoughtPairs={emotionThoughtPairs}
          selectedCognitiveErrors={selectedCognitiveErrors}
          seed={alternativeSeed}
          onSelect={handleComplete}
        />
      )}

    </div>
  );
}
