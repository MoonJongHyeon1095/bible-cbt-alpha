// src/components/CBTSessionPage.tsx
import type { User } from "@supabase/supabase-js";
import { History } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { EmotionThoughtPair } from "../types";
import type { SelectedCognitiveError } from "../types/sessionHistory";
import { clearCbtSessionStorage } from "../utils/cbtSessionStorage";
import { CenterPanel } from "./center/CenterPanel";
import { SelectedSectionActions } from "./common/SelectedSectionActions";
import { HistoryModal } from "./feature/dashboard/HistoryModal";
import { EmailModal } from "./feature/EmailModal";
import { CbtMode } from "./header/navigation/ModePicker";
import { LeftPage } from "./left/LeftPage";
import { RightPanel } from "./right/RightPanel";

export function CBTSessionPage({
  mode,
  user,
  onStepChange,
}: {
  mode: CbtMode;
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
  const [positiveReframes, setPositiveReframes] = useState<{
    [emotion: string]: string;
  }>({});

  // ✅ 툴 모달
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const sessionData = useMemo(
    () => ({
      userInput,
      emotionThoughtPairs,
      selectedCognitiveErrors,
      selectedAlternativeThought,
      positiveReframes,
    }),
    [
      userInput,
      emotionThoughtPairs,
      selectedCognitiveErrors,
      selectedAlternativeThought,
      positiveReframes,
    ],
  );

  // ✅ 음성 입력에서 가져온 텍스트 확인
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

  const handleNext = () => {
    if (step < 6) setStep(step + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    setPositiveReframes({});
    clearCbtSessionStorage();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restartWithSameInput = () => {
    setStep(2);
    setEmotionThoughtPairs([]);
    setSelectedCognitiveErrors([]);
    setSelectedAlternativeThought("");
    setPositiveReframes({});
    clearCbtSessionStorage();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /** ✅ PWA 단일 화면: step별로 하나만 보여줌 */
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
            user={user}
            positiveReframes={positiveReframes}
            onSetPositiveReframes={setPositiveReframes}
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
        <RightPanel
          step={step}
          emotionThoughtPairs={emotionThoughtPairs}
          userInput={userInput}
          positiveReframes={positiveReframes}
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
    <div className="max-w-[1800px] mx-auto px-8 py-8">
      {/* Header (추천 섹션 제거) */}
      <header className="text-center mb-5 sm:mb-8">
        {/* 필요하면 여기 타이틀/서브타이틀만 유지 */}
      </header>

      {/* ✅ PWA 단일 화면 */}
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

      {/* 툴 도크 비활성화 */}
      {/* <ToolDock
        onReset={resetAll}
        onOpenHistory={() => setShowHistoryModal(true)}
        onOpenEmail={() => setShowEmailModal(true)}
      /> */}

      {/* ✅ 모달들 */}
      <HistoryModal
        open={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onUpdated={() => {}}
        user={user}
      />

      <EmailModal
        open={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        user={user}
        sessionData={sessionData}
      />
    </div>
  );
}
