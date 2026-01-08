// src/components/left/LeftPanel.tsx
import { COGNITIVE_ERRORS } from "../../lib/ai";
import type { EmotionThoughtPair } from "../../types";
import type { SelectedCognitiveError } from "../../types/sessionHistory";
import type { CbtMode } from "../header/navigation/ModePicker";
import { Card } from "../ui/card";
import { CognitiveErrorPickerCard } from "./CognitiveErrorPickerCard";
import { EmotionIntensityModal } from "./EmotionIntensityModal";
import { EmpathyCard } from "./EmpathyCard";
import { useLeftPanelState } from "./hooks/useLeftPanelState";

interface LeftPanelProps {
  step: number;
  emotionThoughtPairs: EmotionThoughtPair[];
  userInput: string;
  positiveReframes: { [emotion: string]: string };
  onSetPositiveReframes: (reframes: { [emotion: string]: string }) => void;
  onSelectCognitiveErrors: (errors: SelectedCognitiveError[]) => void;
  onNext: () => void;
  mode: CbtMode;
}

export function LeftPanel({
  step,
  emotionThoughtPairs,
  userInput,
  positiveReframes,
  onSetPositiveReframes,
  onSelectCognitiveErrors,
  onNext,
  mode,
}: LeftPanelProps) {
  const {
    burnsEmpathy,
    canConfirmSelection,
    currentPair,
    detailByIndex,
    detailError,
    detailLoading,
    displayIndices,
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
    setShowIntensityModal,
    setTargetIntensity,
    showIntensityModal,
    targetIntensity,
    toggleSelect,
  } = useLeftPanelState({
    step,
    emotionThoughtPairs,
    userInput,
    onSelectCognitiveErrors,
    onNext,
    mode,
  });

  return (
    <Card className="bg-slate-50/95 backdrop-blur-sm p-6 shadow-2xl border border-slate-200/50 min-h-[600px] flex flex-col text-[15px] leading-6">
      <div className="mb-4 space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
          {header.badge}
        </div>
        <h2 className="text-slate-800 text-xl">{header.title}</h2>
        <p className="text-slate-600 text-sm mt-1">{header.desc}</p>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto">
        {step < 3 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500">감정과 자동사고를 선택해주세요.</p>
          </div>
        )}

        {step === 3 && currentPair && !intensitySet && (
          <EmpathyCard
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
          <CognitiveErrorPickerCard
            emotionLabel={currentPair.emotion}
            thoughtText={currentPair.thought}
            COGNITIVE_ERRORS={COGNITIVE_ERRORS}
            ranked={ranked}
            rankLoading={rankLoading}
            rankError={rankError}
            detailByIndex={detailByIndex}
            detailLoading={detailLoading}
            detailError={detailError}
            uiIndices={displayIndices}
            selected={selected}
            canConfirm={canConfirmSelection}
            onRetryRank={() => void runRankThenKickoffTop3Details()}
            onReroll={() => void rerollCandidates()}
            onToggleSelect={toggleSelect}
            onConfirm={handleConfirm2Errors}
          />
        )}

        {step >= 4 && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <p className="text-green-800 mb-2">✓ 인지오류 검토 완료</p>
            <p className="text-emerald-600">대안사고를 구성해주세요.</p>
          </div>
        )}
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
    </Card>
  );
}
