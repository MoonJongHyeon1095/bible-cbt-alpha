// src/components/CBTSessionPage.tsx
import { useEffect, useMemo, useState } from "react";
import type { EmotionThoughtPair } from "../types";
import { CenterPanel } from "./center/CenterPanel";
import { EmailModal } from "./EmailModal";
import { FavoritesModal } from "./FavoritesModal";
import { HistoryModal } from "./HistoryModal";
import { LeftPanel } from "./left/LeftPanel";
import { RightPanel } from "./right/RightPanel";
import { ToolDock } from "./tool/ToolDock";

export function CBTSessionPage() {
  const [step, setStep] = useState<number>(1);
  const [userInput, setUserInput] = useState<string>("");

  const [emotionThoughtPairs, setEmotionThoughtPairs] = useState<
    EmotionThoughtPair[]
  >([]);
  const [selectedCognitiveErrors, setSelectedCognitiveErrors] = useState<
    string[]
  >([]);
  const [selectedAlternativeThought, setSelectedAlternativeThought] =
    useState<string>("");
  const [positiveReframes, setPositiveReframes] = useState<{
    [emotion: string]: string;
  }>({});

  // ✅ 툴 모달
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);

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
    ]
  );

  // ✅ 음성 입력에서 가져온 텍스트 확인
  useEffect(() => {
    const voiceText = localStorage.getItem("voice_input_text");
    if (voiceText) {
      setUserInput(voiceText);
      localStorage.removeItem("voice_input_text");
    }
  }, []);

  const handleNext = () => {
    if (step < 6) setStep(step + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetAll = () => {
    setStep(1);
    setUserInput("");
    setEmotionThoughtPairs([]);
    setSelectedCognitiveErrors([]);
    setSelectedAlternativeThought("");
    setPositiveReframes({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restartWithSameInput = () => {
    setStep(2);
    setEmotionThoughtPairs([]);
    setSelectedCognitiveErrors([]);
    setSelectedAlternativeThought("");
    setPositiveReframes({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /** ✅ PWA 단일 화면: step별로 하나만 보여줌 */
  const renderStepScreen = () => {
    if (step === 1 || step === 2) {
      return (
        <div className="max-w-4xl mx-auto">
          <CenterPanel
            key={`center-${step}`}
            step={step}
            userInput={userInput}
            emotionThoughtPairs={emotionThoughtPairs}
            onInputChange={setUserInput}
            onSetEmotionThoughtPairs={setEmotionThoughtPairs}
            onNext={handleNext}
          />
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="max-w-4xl mx-auto">
          <LeftPanel
            step={step}
            emotionThoughtPairs={emotionThoughtPairs}
            userInput={userInput}
            positiveReframes={positiveReframes}
            onSetPositiveReframes={setPositiveReframes}
            onSelectCognitiveErrors={setSelectedCognitiveErrors}
            onNext={handleNext}
          />
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto">
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
        />
      </div>
    );
  };

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
      {/* Header (추천 섹션 제거) */}
      <header className="text-center mb-5 sm:mb-8">
        {/* 필요하면 여기 타이틀/서브타이틀만 유지 */}
      </header>

      {/* ✅ PWA 단일 화면 */}
      <div className="mb-8">{renderStepScreen()}</div>

      {/* ✅ 툴 도크 */}
      <ToolDock
        onReset={resetAll}
        onOpenHistory={() => setShowHistoryModal(true)}
        onOpenEmail={() => setShowEmailModal(true)}
        onOpenFavorites={() => setShowFavoritesModal(true)}
      />

      {/* ✅ 모달들 */}
      <HistoryModal
        open={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />

      <EmailModal
        open={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        sessionData={sessionData}
      />

      <FavoritesModal
        open={showFavoritesModal}
        onClose={() => setShowFavoritesModal(false)}
        onSelect={(text) => {
          setUserInput(text);
          setStep(1);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}
