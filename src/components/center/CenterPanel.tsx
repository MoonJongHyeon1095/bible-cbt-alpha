// src/components/center/CenterPanel.tsx
import type { User } from "@supabase/supabase-js";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { EmotionThoughtPair } from "../../types";
import { CbtMode } from "../header/navigation/ModePicker";
import { Card } from "../ui/card";
import { CenterHeader } from "./CenterHeader";
import { ALL_EXAMPLES } from "./constants/examples";
import { EmotionDetailCard } from "./EmotionDetailCard";
import { EmotionGridCard } from "./EmotionGridCard";
import { useEmotionFlow } from "./hooks/useEmotionFlow";
import { useEmotionNotes } from "./hooks/useEmotionNotes";
import { IncidentStepCard } from "./IncidentStepCard";
import { FirstEmotionIntensityModal } from "./modal/FirstEmotionIntensityModal";
import { SavedDetailsModal } from "./modal/SavedDetailsModal";
import { SavedTriggersModal } from "./modal/SavedTriggersModal";
import { ThoughtSelectionCard } from "./ThoughtSelectionCard";
import type { EmotionNote } from "./types";

interface CenterPanelProps {
  step: number;
  userInput: string;
  emotionThoughtPairs: EmotionThoughtPair[];
  onInputChange: (input: string) => void;
  onSetEmotionThoughtPairs: (pairs: EmotionThoughtPair[]) => void;
  onNext: () => void;
  mode: CbtMode;
  user: User | null;
}

const MIN_TRIGGER_LENGTH = 10;

function scrollToTop(containerRef: React.RefObject<HTMLDivElement | null>) {
  if (containerRef.current) containerRef.current.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function CenterPanel({
  step,
  userInput,
  emotionThoughtPairs,
  onInputChange,
  onSetEmotionThoughtPairs,
  onNext,
  mode,
  user,
}: CenterPanelProps) {
  // ref for scrolling
  const containerRef = useRef<HTMLDivElement>(null);
  const handleScrollTop = () => scrollToTop(containerRef);

  // ✅ 랜덤 예시 4개
  const [randomExamples, setRandomExamples] = useState(() => {
    const shuffled = [...ALL_EXAMPLES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  });

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
    if (userInput.trim().length < MIN_TRIGGER_LENGTH) {
      toast.error("상황을 10자 이상 입력해주세요.");
      return;
    }
    onNext();
  };

  const handleTriggerPick = (note: EmotionNote) => {
    handleInputChange(note.trigger, true);
    notes.setActiveNote(note.id, note.title, note.trigger);
    flow.resetForNewEmotion();
    notes.closeSavedTriggersModal();
    onNext();
  };

  return (
    <Card className="bg-slate-50/95 backdrop-blur-sm p-6 shadow-2xl border border-slate-200/50 min-h-[600px] flex flex-col">
      <CenterHeader
        step={step}
        emotionSet={emotionSet}
        showEmotionDetail={showEmotionDetail}
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

      <div className="flex-1 space-y-6 overflow-y-auto" ref={containerRef}>
        {/* ================= Step 1: 사건 기록  ================= */}
        {step === 1 && (
          <IncidentStepCard
            userInput={userInput}
            onInputChange={handleInputChange}
            onNext={handleStepOneNext}
            randomExamples={randomExamples}
            onExampleClick={handleExampleClick}
            onRefreshExamples={refreshExamples}
            onSaveTrigger={notes.handleSaveTriggerOnly}
            onOpenSavedTriggers={notes.openSavedTriggersModal}
            savingTrigger={notes.savingTrigger}
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
            currentPrefetchKey={flow.currentPrefetchKey}
            activeNoteTrigger={notes.activeNoteTrigger}
            onSelectThought={flow.handleThoughtSelect}
            onRegenerate={() => {
              flow.clearPrefetch();
              void flow.finalizeEmotionAndShowThoughts(flow.selectedEmotion);
            }}
            onRetry={() => {
              flow.clearPrefetch();
              flow.startPrefetchThoughts();
            }}
            onAddFavorite={(thought) =>
              notes.addThoughtToFavorites(
                thought,
                flow.selectedEmotion,
                flow.emotionIntensity
              )
            }
            onLoadFavorites={() => void notes.openSavedDetailsModal()}
            onCustomThoughtChange={flow.handleCustomThoughtChange}
            onCustomThoughtSelect={flow.handleCustomThoughtSelect}
            onSubmitCustom={flow.submitCustomThought}
            onSubmit={flow.submitThoughtSelection}
            canSubmit={flow.selectedThoughtIndex !== null}
            savingDetail={notes.savingDetail}
            savingDetailId={notes.savingDetailId}
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
    </Card>
  );
}
