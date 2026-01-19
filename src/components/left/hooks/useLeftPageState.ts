import { useMemo } from "react";
import type { EmotionThoughtPair } from "../../../types";
import type { SelectedCognitiveError } from "../../../types/sessionHistory";
import type { CbtMode } from "../../header/navigation/ModePicker";
import { useCognitiveErrorCandidates } from "./useCognitiveErrorCandidates";
import { useEmpathyState } from "./useEmpathyState";
import { useIntensityState } from "./useIntensityState";

type UseLeftPageStateParams = {
  step: number;
  emotionThoughtPairs: EmotionThoughtPair[];
  userInput: string;
  onSelectCognitiveErrors: (errors: SelectedCognitiveError[]) => void;
  onNext: () => void;
  mode: CbtMode;
};

export function useLeftPageState({
  step,
  emotionThoughtPairs,
  userInput,
  onSelectCognitiveErrors,
  onNext,
  mode,
}: UseLeftPageStateParams) {
  const currentPair =
    emotionThoughtPairs.length > 0
      ? emotionThoughtPairs[emotionThoughtPairs.length - 1]
      : null;

  const isEmotionDialInactive =
    mode.emotionDialMode === "emotion-dial-inactive";

  const pairKey = useMemo(() => {
    if (!currentPair) return "";
    return `${currentPair.emotion}::${currentPair.thought}::${currentPair.intensity}`;
  }, [currentPair]);

  const intensityState = useIntensityState({ pairKey });
  const intensitySet = intensityState.intensitySet;

  const header = useMemo(() => {
    if (step < 3) {
      return {
        badge: "STEP 3 · 준비 중",
        title: "인지오류 검토 단계로 곧 이동해요.",
        desc: "감정과 자동사고를 먼저 선택해주세요.",
      };
    }

    if (step === 3 && !intensitySet) {
      return {
        badge: "STEP 3 · 공감 및 제안",
        title: "생각 속 오류를 함께 찾아볼까요?",
        desc: "숨어있는 오류 가능성을 검토해보려 합니다.",
      };
    }

    if (step === 3 && intensitySet) {
      return {
        badge: "STEP 3 · 인지오류 검토",
        title: "인지오류 중 2가지를 선택해주세요.",
        desc: "제안된 오류를 검토하고 맞다고 느끼는 것을 선택하세요.",
      };
    }

    return {
      badge: "STEP 4 · 대안사고 준비",
      title: "이제 대안사고를 만들 준비가 되었어요.",
      desc: "선택한 오류를 바탕으로 오른쪽에서 대안사고를 확인하세요.",
    };
  }, [step, intensitySet]);

  const {
    burnsEmpathy,
    empathyError,
    empathyLoading,
    generateEmpathy,
  } = useEmpathyState({
    step,
    currentPair,
    pairKey,
    userInput,
    syncTargetIntensityFromPair: intensityState.syncTargetIntensityFromPair,
  });

  const candidateState = useCognitiveErrorCandidates({
    step,
    currentPair,
    pairKey,
    userInput,
    onSelectCognitiveErrors,
    onNext,
  });

  return {
    burnsEmpathy,
    canConfirmSelection: candidateState.canConfirmSelection,
    currentPair,
    detailByIndex: candidateState.detailByIndex,
    detailError: candidateState.detailError,
    detailLoading: candidateState.detailLoading,
    pageIndices: candidateState.pageIndices,
    pinnedSelected: candidateState.pinnedSelected,
    pageIndex: candidateState.pageIndex,
    totalPages: candidateState.totalPages,
    empathyError,
    empathyLoading,
    generateEmpathy,
    handleConfirm2Errors: candidateState.handleConfirm2Errors,
    handleIntensitySet: intensityState.handleIntensitySet,
    header,
    isEmotionDialInactive,
    intensitySet: intensityState.intensitySet,
    rankError: candidateState.rankError,
    rankLoading: candidateState.rankLoading,
    ranked: candidateState.ranked,
    rerollCandidates: candidateState.rerollCandidates,
    runRankThenKickoffTop3Details: candidateState.runRankThenKickoffTop3Details,
    selected: candidateState.selected,
    goPrevPage: candidateState.goPrevPage,
    goNextPage: candidateState.goNextPage,
    setShowIntensityModal: intensityState.setShowIntensityModal,
    setTargetIntensity: intensityState.setTargetIntensity,
    showIntensityModal: intensityState.showIntensityModal,
    targetIntensity: intensityState.targetIntensity,
    toggleSelect: candidateState.toggleSelect,
    resetIntensitySet: intensityState.resetIntensitySet,
  };
}
