// src/components/CBTSessionPage.tsx
import type { User } from "@supabase/supabase-js";
import { History } from "lucide-react";
import { useEffect, useState } from "react";
import type { EmotionThoughtPair } from "../types";
import type { SelectedCognitiveError } from "../types/sessionHistory";
import { clearCbtSessionStorage } from "../utils/cbtSessionStorage";
import { CenterPanel } from "./center/CenterPanel";
import { SelectedSectionActions } from "./common/SelectedSectionActions";
import { HistoryModal } from "./feature/dashboard/HistoryModal";
import { CbtMode } from "./header/navigation/ModePicker";
import { LeftPage } from "./left/LeftPage";
import { RightPage } from "./right/RightPage";

export function CBTSessionPage({
  mode,
  onChangeMode,
  onStartMinimal,
  user,
  onStepChange,
}: {
  mode: CbtMode;
  onChangeMode: (next: CbtMode) => void;
  onStartMinimal?: () => void;
  user: User | null;
  onStepChange?: (step: number) => void;
}) {
  const [step, setStep] = useState<number>(1);
  const [userInput, setUserInput] = useState<string>("");
  const [resumeCenterView, setResumeCenterView] = useState<"thoughts" | null>(
    null,
  );
  const [resumeLeftView, setResumeLeftView] = useState<"errors" | null>(null);

  const [emotionThoughtPairs, setEmotionThoughtPairs] = useState<
    EmotionThoughtPair[]
  >([]);
  const [selectedCognitiveErrors, setSelectedCognitiveErrors] = useState<
    SelectedCognitiveError[]
  >([]);
  const [selectedAlternativeThought, setSelectedAlternativeThought] =
    useState<string>("");

  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    const voiceText = localStorage.getItem("voice_input_text");
    if (voiceText) {
      setUserInput(voiceText);
      localStorage.removeItem("voice_input_text");
    }
  }, []);

  useEffect(() => {
    onStepChange?.(step);
  }, [onStepChange, step]);

  const handleNext = (options?: { skipScroll?: boolean }) => {
    if (step < 6) setStep(step + 1);
    if (!options?.skipScroll) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      if (step === 3) {
        setResumeCenterView("thoughts");
      }
      if (step === 4) {
        setResumeLeftView("errors");
      }
      setStep(step - 1);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetAll = () => {
    setStep(1);
    setUserInput("");
    setEmotionThoughtPairs([]);
    setSelectedCognitiveErrors([]);
    setSelectedAlternativeThought("");
    clearCbtSessionStorage();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restartWithSameInput = () => {
    setStep(2);
    setEmotionThoughtPairs([]);
    setSelectedCognitiveErrors([]);
    setSelectedAlternativeThought("");
    clearCbtSessionStorage();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderStepScreen = () => {
    if (step === 1 || step === 2) {
      return (
        <div className="w-full">
          <CenterPanel
            key={`center-${step}`}
            step={step}
            userInput={userInput}
            emotionThoughtPairs={emotionThoughtPairs}
            onInputChange={setUserInput}
            onSetEmotionThoughtPairs={setEmotionThoughtPairs}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onExit={resetAll}
            mode={mode}
            onChangeMode={onChangeMode}
            onStartMinimal={onStartMinimal}
            user={user}
            resumeCenterView={resumeCenterView}
            onResumeCenterViewHandled={() => setResumeCenterView(null)}
          />
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="w-full">
          <LeftPage
            step={step}
            emotionThoughtPairs={emotionThoughtPairs}
            userInput={userInput}
            onSelectCognitiveErrors={setSelectedCognitiveErrors}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onExit={resetAll}
            mode={mode}
            resumeLeftView={resumeLeftView}
            onResumeLeftViewHandled={() => setResumeLeftView(null)}
          />
        </div>
      );
    }

    return (
      <div className="w-full">
        <RightPage
          step={step}
          emotionThoughtPairs={emotionThoughtPairs}
          userInput={userInput}
          selectedCognitiveErrors={selectedCognitiveErrors}
          selectedAlternativeThought={selectedAlternativeThought}
          onSetSelectedAlternativeThought={setSelectedAlternativeThought}
          onComplete={resetAll}
          onRestartWithSameInput={restartWithSameInput}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onExit={resetAll}
          mode={mode}
          user={user}
        />
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      <div className="mb-8">{renderStepScreen()}</div>

      <SelectedSectionActions
        hidden={step !== 1}
        theme="behaviors"
        editLabel="이전 세션"
        editAriaLabel="이전 세션"
        onEdit={() => setShowHistoryModal(true)}
        editIcon={<History className="size-4 mr-1" />}
        editClassName="border-0 shadow-sm shadow-slate-200/80 hover:shadow-md"
      />

      <HistoryModal
        open={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onUpdated={() => {}}
        user={user}
      />
    </div>
  );
}
