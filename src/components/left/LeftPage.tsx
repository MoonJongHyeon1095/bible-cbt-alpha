// src/components/left/LeftPage.tsx
import { useEffect } from "react";
import type { EmotionThoughtPair } from "../../types";
import type { SelectedCognitiveError } from "../../types/sessionHistory";
import type { CbtMode } from "../header/navigation/ModePicker";
import { Button } from "../ui/button";
import { ArrowLeft, DoorOpen } from "lucide-react";
import { useLeftPageState } from "./hooks/useLeftPageState";
import { EmotionIntensityModal } from "./modals/EmotionIntensityModal";
import { CognitiveErrorSection } from "./sections/CognitiveErrorSection";
import { EmpathySection } from "./sections/EmpathySection";
import { LeftCompletionSection } from "./sections/LeftCompletionSection";
import { LeftEmptyStateSection } from "./sections/LeftEmptyStateSection";
import { LeftHeaderSection } from "./sections/LeftHeaderSection";

interface LeftPageProps {
  step: number;
  emotionThoughtPairs: EmotionThoughtPair[];
  userInput: string;
  positiveReframes: { [emotion: string]: string };
  onSetPositiveReframes: (reframes: { [emotion: string]: string }) => void;
  onSelectCognitiveErrors: (errors: SelectedCognitiveError[]) => void;
  onNext: () => void;
  onPrevious?: () => void;
  onExit?: () => void;
  mode: CbtMode;
  resumeLeftView?: "errors" | null;
  onResumeLeftViewHandled?: () => void;
}

export function LeftPage({
  step,
  emotionThoughtPairs,
  userInput,
  positiveReframes,
  onSetPositiveReframes,
  onSelectCognitiveErrors,
  onNext,
  onPrevious,
  onExit,
  mode,
  resumeLeftView,
  onResumeLeftViewHandled,
}: LeftPageProps) {
  const showBackButton = step > 1 && Boolean(onPrevious);
  const {
    burnsEmpathy,
    canConfirmSelection,
    currentPair,
    detailByIndex,
    detailError,
    detailLoading,
    pageIndices,
    pinnedSelected,
    pageIndex,
    totalPages,
    empathyError,
    empathyLoading,
    generateEmpathy,
    handleConfirm2Errors,
    handleIntensitySet,
    header,
    isLite,
    intensitySet,
    rankError,
    rankLoading,
    ranked,
    rerollCandidates,
    runRankThenKickoffTop3Details,
    selected,
    goPrevPage,
    goNextPage,
    setShowIntensityModal,
    setTargetIntensity,
    showIntensityModal,
    targetIntensity,
    toggleSelect,
    resetIntensitySet,
  } = useLeftPageState({
    step,
    emotionThoughtPairs,
    userInput,
    onSelectCognitiveErrors,
    onNext,
    mode,
  });

  useEffect(() => {
    if (step !== 3 || resumeLeftView !== "errors") return;
    setShowIntensityModal(false);
    handleIntensitySet();
    onResumeLeftViewHandled?.();
  }, [
    handleIntensitySet,
    onResumeLeftViewHandled,
    resumeLeftView,
    setShowIntensityModal,
    step,
  ]);

  const handleBack = () => {
    if (step === 3) {
      if (showIntensityModal) {
        setShowIntensityModal(false);
        return;
      }
      if (intensitySet) {
        resetIntensitySet();
        return;
      }
    }
    onPrevious?.();
  };

  return (
    <div className="relative min-h-[600px] flex flex-col text-[15px] leading-6">
      {showBackButton && (
        <div className="absolute right-4 top-0 z-10 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="rounded-full"
            aria-label="이전 단계"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onExit}
            className="rounded-full"
            aria-label="세션 종료"
          >
            <DoorOpen className="size-5" />
          </Button>
        </div>
      )}
      <LeftHeaderSection header={header} />

      <div
        className={`flex-1 space-y-6 ${
          step === 3 && currentPair && !intensitySet
            ? "overflow-visible"
            : "overflow-y-auto"
        }`}
      >
        {step < 3 && (
          <LeftEmptyStateSection message="감정과 자동사고를 선택해주세요." />
        )}

        {step === 3 && currentPair && !intensitySet && (
          <EmpathySection
            currentPair={currentPair}
            mode={mode}
            burnsEmpathy={burnsEmpathy}
            empathyLoading={empathyLoading}
            empathyError={empathyError}
            onRetry={() => void generateEmpathy()}
            onOpenIntensityModal={() => setShowIntensityModal(true)}
            onLiteNext={handleIntensitySet}
            showCognitivePreparingHint={rankLoading || detailLoading}
          />
        )}

        {step === 3 && intensitySet && currentPair && (
          <CognitiveErrorSection
            emotionLabel={currentPair.emotion}
            thoughtText={currentPair.thought}
            ranked={ranked}
            rankLoading={rankLoading}
            rankError={rankError}
            detailByIndex={detailByIndex}
            detailLoading={detailLoading}
            detailError={detailError}
            uiIndices={pageIndices}
            pinnedSelected={pinnedSelected}
            pageIndex={pageIndex}
            totalPages={totalPages}
            selected={selected}
            canConfirm={canConfirmSelection}
            onRetryRank={() => void runRankThenKickoffTop3Details()}
            onReroll={() => void rerollCandidates()}
            onToggleSelect={toggleSelect}
            onPrevPage={goPrevPage}
            onNextPage={goNextPage}
            onConfirm={handleConfirm2Errors}
          />
        )}

        {step >= 4 && <LeftCompletionSection />}
      </div>

      {currentPair && !isLite && (
        <EmotionIntensityModal
          open={showIntensityModal}
          emotion={currentPair.emotion}
          currentIntensity={currentPair.intensity ?? 50}
          targetIntensity={targetIntensity}
          onTargetIntensityChange={setTargetIntensity}
          onConfirm={() => {
            setShowIntensityModal(false);
            handleIntensitySet();
          }}
          onCancel={() => setShowIntensityModal(false)}
        />
      )}
    </div>
  );
}
