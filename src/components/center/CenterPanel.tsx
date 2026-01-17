// src/components/center/CenterPanel.tsx
import type { User } from "@supabase/supabase-js";
import { ArrowLeft, DoorOpen } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { EMOTIONS } from "../../constants/emotions";
import type { EmotionThoughtPair } from "../../types";
import { validateUserText } from "../../utils/validation";
import { CbtMode } from "../header/navigation/ModePicker";
import { Button } from "../ui/button";
import { ThoughtSelectionCard } from "./auto-thought/ThoughtSelectionCard";
import { CenterDisclaimerBanner } from "./CenterDisclaimerBanner";
import { CenterHeader } from "./CenterHeader";
import { ALL_EXAMPLES } from "./constants/examples";
import { EmotionDetailCard } from "./emotion/EmotionDetailCard";
import { EmotionGridCard } from "./emotion/EmotionGridCard";
import { useEmotionFlow } from "./hooks/useEmotionFlow";
import { useEmotionNotes } from "./hooks/useEmotionNotes";
import { IncidentStepCard } from "./incident/IncidentStepCard";
import { CenterDisclaimerModal } from "./modal/CenterDisclaimerModal";
import { FirstEmotionIntensityModal } from "./modal/FirstEmotionIntensityModal";
import { SavedDetailsModal } from "./modal/SavedDetailsModal";
import { SavedTriggersModal } from "./modal/SavedTriggersModal";
import type { EmotionNote } from "./types";

interface CenterPanelProps {
  step: number;
  userInput: string;
  emotionThoughtPairs: EmotionThoughtPair[];
  onInputChange: (input: string) => void;
  onSetEmotionThoughtPairs: (pairs: EmotionThoughtPair[]) => void;
  onNext: () => void;
  onPrevious?: () => void;
  onExit?: () => void;
  mode: CbtMode;
  onChangeMode: (next: CbtMode) => void;
  onStartMinimal?: () => void;
  user: User | null;
  resumeCenterView?: "thoughts" | null;
  onResumeCenterViewHandled?: () => void;
}

function scrollToTop(containerRef: React.RefObject<HTMLDivElement | null>) {
  if (containerRef.current) containerRef.current.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

const CENTER_DISCLAIMER_KEY = "center_disclaimer_ack_v1";

export function CenterPanel({
  step,
  userInput,
  emotionThoughtPairs,
  onInputChange,
  onSetEmotionThoughtPairs,
  onNext,
  onPrevious,
  onExit,
  mode,
  onChangeMode,
  onStartMinimal,
  user,
  resumeCenterView,
  onResumeCenterViewHandled,
}: CenterPanelProps) {
  const showBackButton = step > 1 && Boolean(onPrevious);

  // ref for scrolling
  const containerRef = useRef<HTMLDivElement>(null);
  const handleScrollTop = () => scrollToTop(containerRef);

  // ✅ 랜덤 예시 4개
  const [randomExamples, setRandomExamples] = useState(() => {
    const shuffled = [...ALL_EXAMPLES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  });
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  const refreshExamples = () => {
    const shuffled = [...ALL_EXAMPLES].sort(() => Math.random() - 0.5);
    setRandomExamples(shuffled.slice(0, 4));
  };

  const flow = useEmotionFlow({
    userInput,
    mode,
    emotionThoughtPairs,
    onSetEmotionThoughtPairs,
    onNext,
    onScrollTop: handleScrollTop,
  });

  const notes = useEmotionNotes({
    user,
    userInput,
    selectedEmotion: flow.selectedEmotion,
    emotionIntensity: flow.emotionIntensity,
    isDeep: flow.isDeep,
    emotionThoughtPairs,
    onSetEmotionThoughtPairs,
    onNext,
    onScrollTop: handleScrollTop,
    onInputPreserveNote: (value) => onInputChange(value),
    onSetSelectedEmotion: flow.setSelectedEmotion,
  });

  const showEmotionDetail = flow.view === "detail";
  const showIntensityModal = flow.view === "intensity";
  const emotionSet = flow.view === "thoughts";

  const resumeHandledRef = useRef(false);

  useEffect(() => {
    if (!resumeCenterView) {
      resumeHandledRef.current = false;
      return;
    }

    if (step !== 2 || resumeHandledRef.current) return;

    const lastPair = emotionThoughtPairs[emotionThoughtPairs.length - 1];
    if (!lastPair?.emotion) {
      resumeHandledRef.current = true;
      onResumeCenterViewHandled?.();
      return;
    }

    const emotionData =
      EMOTIONS.find((item) => item.label === lastPair.emotion) ?? null;

    flow.setSelectedEmotion(lastPair.emotion);
    flow.setSelectedEmotionData(emotionData);
    flow.setEmotionDetailConfirmed(true);
    if (lastPair.intensity != null) {
      flow.setEmotionIntensity(lastPair.intensity);
    }

    void flow.finalizeEmotionAndShowThoughts(lastPair.emotion);

    resumeHandledRef.current = true;
    onResumeCenterViewHandled?.();
  }, [
    resumeCenterView,
    step,
    emotionThoughtPairs,
    flow,
    onResumeCenterViewHandled,
  ]);

  const handleBack = () => {
    if (step === 2) {
      if (showIntensityModal) {
        flow.setView("detail");
        return;
      }
      if (emotionSet) {
        flow.setView("detail");
        return;
      }
      if (showEmotionDetail) {
        flow.setView("grid");
        flow.setSelectedEmotionData(null);
        flow.setEmotionDetailConfirmed(false);
        return;
      }
    }
    onPrevious?.();
  };

  // 예시 클릭
  const handleInputChange = (value: string, preserveNote = false) => {
    if (!preserveNote && value !== userInput) {
      notes.clearActiveNote();
    }
    onInputChange(value);
  };

  const handleExampleClick = (example: string) => {
    handleInputChange(example);
  };

  const handleStepOneNext = () => {
    if (mode.detailMode === "lite") {
      onStartMinimal?.();
      return;
    }
    const validation = validateUserText(userInput, {
      minLength: 10,
      minLengthMessage: "상황을 10자 이상 입력해주세요.",
    });
    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }
    onNext();
  };

  const handleTriggerPick = (note: EmotionNote) => {
    const validation = validateUserText(note.trigger, {
      minLength: 10,
      minLengthMessage: "상황을 10자 이상 입력해주세요.",
    });
    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }
    handleInputChange(note.trigger, true);
    notes.setActiveNote(note.id, note.title, note.trigger);
    flow.resetForNewEmotion();
    notes.closeSavedTriggersModal();
    onNext();
  };

  const acknowledgeDisclaimer = () => {
    try {
      localStorage.setItem(CENTER_DISCLAIMER_KEY, "true");
    } catch {
      // ignore
    }
    setIsDisclaimerOpen(false);
  };

  const handleDisclaimerOpenChange = (open: boolean) => {
    if (open) {
      setIsDisclaimerOpen(true);
      return;
    }
    acknowledgeDisclaimer();
  };

  return (
    <div className="relative min-h-[600px] flex flex-col">
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
      {step === 1 && (
        <CenterDisclaimerBanner
          onOpenDetails={() => setIsDisclaimerOpen(true)}
        />
      )}
      <div className="mb-6">
        <CenterHeader
          step={step}
          emotionSet={emotionSet}
          showEmotionDetail={showEmotionDetail}
        />
      </div>

      <CenterDisclaimerModal
        open={isDisclaimerOpen}
        onOpenChange={handleDisclaimerOpenChange}
        onConfirm={acknowledgeDisclaimer}
      />

      <FirstEmotionIntensityModal
        // ✅ deep일 때만 실제로 열리게 방지
        open={flow.isDeep && showIntensityModal}
        emotion={flow.selectedEmotion}
        intensity={flow.emotionIntensity}
        onIntensityChange={flow.setEmotionIntensity}
        onPrefetchThoughts={flow.startPrefetchThoughts}
        onConfirm={async () => {
          await flow.finalizeEmotionAndShowThoughts();
        }}
        onClose={() => flow.setView("grid")}
        isLoading={flow.loading}
      />

      <SavedTriggersModal
        open={notes.showSavedTriggersModal}
        onClose={notes.closeSavedTriggersModal}
        loading={notes.notesLoading}
        triggers={notes.savedTriggerNotes}
        onSelect={handleTriggerPick}
      />
      <SavedDetailsModal
        open={notes.showSavedDetailsModal}
        onClose={notes.closeSavedDetailsModal}
        loading={notes.notesLoading}
        details={notes.savedDetails}
        showNoteScopeOnly={Boolean(notes.activeNoteId && notes.useServerNotes)}
        activeNoteTrigger={notes.activeNoteTrigger}
        onSelect={notes.loadFromFavorites}
        onDelete={(id) => void notes.removeFromFavorites(id)}
      />

      <div
        className={`flex-1 space-y-6 ${
          step === 1 ? "overflow-visible" : "overflow-y-auto"
        }`}
        ref={containerRef}
      >
        {/* ================= Step 1: 사건 기록  ================= */}
        {step === 1 && (
          <IncidentStepCard
            userInput={userInput}
            onInputChange={handleInputChange}
            onNext={handleStepOneNext}
            mode={mode}
            onChangeMode={onChangeMode}
            randomExamples={randomExamples}
            onExampleClick={handleExampleClick}
            onRefreshExamples={refreshExamples}
            onOpenSavedTriggers={notes.openSavedTriggersModal}
            showExamples={mode.detailMode !== "lite"}
          />
        )}

        {/* ================= Step 2: 감정 선택 (목록) ================= */}
        {step === 2 && !emotionSet && !showEmotionDetail && (
          <EmotionGridCard
            selectedEmotion={flow.selectedEmotion}
            onSelect={(emotion) => flow.handleEmotionSelect(emotion)}
          />
        )}

        {/* ================= Step 2: 감정 상세 ================= */}
        {step === 2 &&
          !emotionSet &&
          showEmotionDetail &&
          flow.selectedEmotionData && (
            <EmotionDetailCard
              emotion={flow.selectedEmotionData}
              confirmed={flow.emotionDetailConfirmed}
              onConfirmChange={flow.setEmotionDetailConfirmed}
              onBack={() => {
                flow.setView("grid");
                flow.setSelectedEmotionData(null);
                flow.setEmotionDetailConfirmed(false);
              }}
              onSelect={flow.handleSelectThisEmotion}
            />
          )}

        {/* ================= Step 2: AI 자동사고 생성 → 1개 선택 ================= */}
        {step === 2 && emotionSet && (
          <ThoughtSelectionCard
            selectedEmotion={flow.selectedEmotion}
            selectedEmotionData={flow.selectedEmotionData}
            loading={flow.loading}
            error={flow.error}
            generatedThoughts={flow.generatedThoughts}
            selectedThoughtIndex={flow.selectedThoughtIndex}
            customThought={flow.customThought}
            onSelectThought={flow.handleThoughtSelect}
            onRegenerate={() => {
              flow.clearPrefetch();
              void flow.finalizeEmotionAndShowThoughts(
                flow.selectedEmotion,
                true
              );
            }}
            onRetry={() => {
              flow.clearPrefetch();
              flow.startPrefetchThoughts();
            }}
            onLoadFavorites={() => void notes.openSavedDetailsModal()}
            onCustomThoughtChange={flow.handleCustomThoughtChange}
            onCustomThoughtSelect={flow.handleCustomThoughtSelect}
            onSubmitCustom={flow.submitCustomThought}
            onSubmit={flow.submitThoughtSelection}
            canSubmit={flow.selectedThoughtIndex !== null}
          />
        )}

        {/* ================= Step 3 이상: 완료 ================= */}
        {step >= 3 && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <p className="text-green-800 mb-2">✓ 자동사고 체크 완료</p>
            <div className="space-y-2 text-slate-700">
              {emotionThoughtPairs.map((pair, i) => (
                <div
                  key={i}
                  className="bg-white p-3 rounded border border-green-300"
                >
                  <p className="text-sm mb-1">
                    <strong>{pair.emotion}</strong>
                    {pair.intensity != null && ` (강도: ${pair.intensity})`}
                  </p>
                  <p className="text-xs text-slate-600">"{pair.thought}"</p>
                </div>
              ))}
            </div>
            <p className="text-emerald-600 mt-3 text-base">
              인지오류를 검토해주세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
