import type { EmotionThoughtPair } from "../../../types";
import type { BurnsEmpathyShape } from "../hooks/useLeftPageTypes";
import type { CbtMode } from "../../header/navigation/ModePicker";
import { EmpathyCard } from "../empathy/EmpathyCard";

interface EmpathySectionProps {
  currentPair: EmotionThoughtPair;
  mode: CbtMode;
  burnsEmpathy: BurnsEmpathyShape | null;
  empathyLoading: boolean;
  empathyError: string | null;
  onRetry: () => void;
  onOpenIntensityModal: () => void;
  onLiteNext: () => void;
  showCognitivePreparingHint: boolean;
}

export function EmpathySection({
  currentPair,
  mode,
  burnsEmpathy,
  empathyLoading,
  empathyError,
  onRetry,
  onOpenIntensityModal,
  onLiteNext,
  showCognitivePreparingHint,
}: EmpathySectionProps) {
  return (
    <EmpathyCard
      currentPair={currentPair}
      mode={mode}
      burnsEmpathy={burnsEmpathy}
      empathyLoading={empathyLoading}
      empathyError={empathyError}
      onRetry={onRetry}
      onOpenIntensityModal={onOpenIntensityModal}
      onLiteNext={onLiteNext}
      showCognitivePreparingHint={showCognitivePreparingHint}
    />
  );
}
