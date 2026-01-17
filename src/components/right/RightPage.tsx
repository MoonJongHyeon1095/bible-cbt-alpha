// src/components/right/RightPage.tsx
import type { User } from "@supabase/supabase-js";
import { ArrowLeft, DoorOpen, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { CognitiveBehaviorId } from "../../constants/behaviors";
import { supabase } from "../../lib/supabase/client";
import type { EmotionThoughtPair } from "../../types";
import type {
  SelectedCognitiveError,
  SessionHistory,
} from "../../types/sessionHistory";
import { clearCbtSessionStorage } from "../../utils/cbtSessionStorage";
import { formatAutoTitle } from "../../utils/formatAutoTitle";
import type { CbtMode } from "../header/navigation/ModePicker";
import { Button } from "../ui/button";
import { BibleOfferCard } from "./components/BibleOfferCard";
import { useAlternativeThoughts } from "./hooks/useAlternativeThoughts";
import { useBibleVerse } from "./hooks/useBibleVerse";
import { useFinalIntensity } from "./hooks/useFinalIntensity";
import { RightAlternativePickerSection } from "./components/sections/RightAlternativePickerSection";
import { RightBibleResultSection } from "./components/sections/RightBibleResultSection";
import { RightFinalAreaSection } from "./components/sections/RightFinalAreaSection";
import { RightPlaceholderSection } from "./components/sections/RightPlaceholderSection";
import { RightShalomSection } from "./components/sections/RightShalomSection";
import { RightStepHeaderSection } from "./components/sections/RightStepHeaderSection";
import { RightSummarySection } from "./components/sections/RightSummarySection";
import { saveSessionPatternAPI } from "./utils/api";
import { saveSessionPatternLocal } from "./utils/storage";

interface RightPageProps {
  step: number;
  emotionThoughtPairs: EmotionThoughtPair[];
  userInput: string;
  selectedCognitiveErrors: SelectedCognitiveError[];
  selectedAlternativeThought: string;
  onSetSelectedAlternativeThought: (thought: string) => void;
  onComplete: () => void;
  onRestartWithSameInput?: () => void;
  onNext: (options?: { skipScroll?: boolean }) => void;
  onPrevious?: () => void;
  onExit?: () => void;
  mode: CbtMode;
  user: User | null;
}

export function RightPage({
  step,
  emotionThoughtPairs,
  userInput,
  selectedCognitiveErrors,
  selectedAlternativeThought,
  onSetSelectedAlternativeThought,
  onComplete,
  onRestartWithSameInput,
  onNext,
  onPrevious,
  onExit,
  user,
  mode,
}: RightPageProps) {
  const isDeep = mode.detailMode === "deep";
  const isChristian = mode.toneMode === "christian";
  const isDeepNormal = isDeep && !isChristian;

  const hasSelectedThought = Boolean(selectedAlternativeThought);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bibleSectionRef = useRef<HTMLDivElement | null>(null);
  const skipStepScrollRef = useRef(false);

  const hasAnyIntensity = useMemo(
    () => emotionThoughtPairs.some((p) => p.intensity != null),
    [emotionThoughtPairs],
  );

  const showBackButton = step > 1 && Boolean(onPrevious);

  const [savingPrayer, setSavingPrayer] = useState(false);
  const [selectedBehavior, setSelectedBehavior] = useState<{
    behaviorId: CognitiveBehaviorId;
    behaviorLabel: string;
    behaviorText: string;
  } | null>(null);
  const [isBehaviorGenerating, setIsBehaviorGenerating] = useState(false);

  const autoAdvancedRef = useRef(false);

  const readActiveNote = () => {
    try {
      const raw = sessionStorage.getItem("cbt_active_note");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return {
        noteId: parsed?.noteId ? String(parsed.noteId) : null,
        title: parsed?.title ? String(parsed.title) : "",
        trigger: parsed?.trigger ? String(parsed.trigger) : "",
      };
    } catch {
      return null;
    }
  };

  const goNextIfNeeded = (options?: { skipScroll?: boolean }) => {
    if (options?.skipScroll) {
      skipStepScrollRef.current = true;
    }
    if (step < 5) onNext(options);
  };

  const renderRestartWithSameInput = () => {
    if (!onRestartWithSameInput) return null;

    return (
      <Button
        onClick={() => {
          if (
            confirm(
              "같은 주제로 다시 하시겠습니까? 아직 감정이 남아 있다면 반복하시면 더욱 효과적입니다.",
            )
          ) {
            onRestartWithSameInput();
          }
        }}
        variant="outline"
        className="mb-4 w-full gap-2 rounded-full border-2 border-indigo-400 text-indigo-700 transition-all hover:-translate-y-0.5 hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-md"
      >
        <RefreshCw className="size-4" />
        같은 주제로 다시 하기
      </Button>
    );
  };

  const {
    alternativeThoughts,
    thoughtsLoading,
    thoughtsError,
    generateAlternatives,
  } = useAlternativeThoughts({
    step,
    userInput,
    emotionThoughtPairs,
    selectedCognitiveErrors,
  });
  const {
    finalIntensities,
    setFinalIntensities,
    showFinalIntensity,
    setShowFinalIntensity,
    seedFinalIntensitiesFromPairs,
  } = useFinalIntensity(emotionThoughtPairs);
  const {
    wantsBibleVerse,
    setWantsBibleVerse,
    bibleVerse,
    bibleLoading,
    bibleError,
    handleWantsBible,
    lockBibleChoice,
  } = useBibleVerse({
    step,
    userInput,
    emotionThoughtPairs,
    isDeep,
    isChristian,
    hasSelectedThought,
    onAdvance: () => goNextIfNeeded({ skipScroll: true }),
  });

  useEffect(() => {
    if (!hasSelectedThought || step < 4) {
      autoAdvancedRef.current = false;
      setShowFinalIntensity(false);
      setFinalIntensities({});
    }
  }, [hasSelectedThought, setFinalIntensities, setShowFinalIntensity, step]);

  useEffect(() => {
    if (step === 4 && hasSelectedThought && wantsBibleVerse == null) {
      scrollToTop();
    }
  }, [hasSelectedThought, step, wantsBibleVerse]);

  useEffect(() => {
    if (!selectedAlternativeThought) {
      setSelectedBehavior(null);
      setIsBehaviorGenerating(false);
    }
  }, [selectedAlternativeThought]);

  const handleSelectThought = (thought: string) => {
    onSetSelectedAlternativeThought(thought);

    if (isDeepNormal && !autoAdvancedRef.current) {
      autoAdvancedRef.current = true;

      setWantsBibleVerse(false);
      setShowFinalIntensity(true);
      seedFinalIntensitiesFromPairs();
      goNextIfNeeded();
    }
  };

  const handleReviewAlternatives = () => {
    onSetSelectedAlternativeThought("");
    void generateAlternatives({ force: true });
  };

  const handleBackToAlternatives = () => {
    onSetSelectedAlternativeThought("");
    setWantsBibleVerse(null);

    if (step >= 5) {
      onPrevious?.();
    }
  };

  const handleDoesNotWantBible = async () => {
    skipStepScrollRef.current = true;
    lockBibleChoice();

    setWantsBibleVerse(false);

    if (!isDeep) return;

    setShowFinalIntensity(true);
    seedFinalIntensitiesFromPairs();
    goNextIfNeeded({ skipScroll: true });
  };

  const handleRequestBible = () => {
    skipStepScrollRef.current = true;
    void handleWantsBible();
  };

  const handleFinalComplete = async () => {
    const pairsToSave = emotionThoughtPairs.map((pair) => ({
      ...pair,
      intensity: isDeep
        ? finalIntensities[pair.emotion] ?? pair.intensity ?? null
        : null,
    }));
    const primaryPair = emotionThoughtPairs[0];
    const activeNote = readActiveNote();
    const title = activeNote?.title?.trim() || formatAutoTitle(new Date());

    const historyItem: SessionHistory = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      userInput,
      emotionThoughtPairs: pairsToSave,
      selectedCognitiveErrors,
      selectedAlternativeThought,
      selectedBehavior: selectedBehavior
        ? {
            behaviorLabel: selectedBehavior.behaviorLabel,
            behaviorText: selectedBehavior.behaviorText,
          }
        : null,
      bibleVerse: wantsBibleVerse ? bibleVerse : null,
      detailMode: mode.detailMode,
    };

    if (user) {
      try {
        const { ok: saveOk, payload: savePayload } =
          await saveSessionPatternAPI({
            noteId: activeNote?.noteId ?? null,
            title,
            triggerText: userInput,
            emotion: primaryPair?.emotion ?? "",
            automaticThought: primaryPair?.thought ?? "",
            alternativeThought: selectedAlternativeThought,
            errors: selectedCognitiveErrors.map((error) => ({
              errorLabel: error.title ?? "",
              errorDescription: error.detail ?? "",
            })),
            behavior: selectedBehavior
              ? {
                  behaviorLabel: selectedBehavior.behaviorLabel,
                  behaviorText: selectedBehavior.behaviorText,
                }
              : null,
          });
        if (!saveOk) {
          throw new Error(savePayload?.error || "감정노트 저장 실패");
        }

        const { error } = await supabase.from("session_history").insert({
          user_id: user.id,
          timestamp: historyItem.timestamp,
          user_input: historyItem.userInput,
          emotion_thought_pairs: pairsToSave,
          selected_cognitive_errors: historyItem.selectedCognitiveErrors,
          selected_alternative_thought: historyItem.selectedAlternativeThought,
          selected_behavior: historyItem.selectedBehavior,
          bible_verse: historyItem.bibleVerse,
        });
        if (error) throw error;
      } catch (e) {
        console.error("히스토리 저장 실패:", e);
        toast.error("세션 기록을 저장하지 못했습니다.");
        return;
      }
    } else {
      try {
        saveSessionPatternLocal({
          noteId: activeNote?.noteId ?? null,
          title,
          triggerText: userInput,
          emotion: primaryPair?.emotion ?? "",
          automaticThought: primaryPair?.thought ?? "",
          alternativeThought: selectedAlternativeThought,
          errors: selectedCognitiveErrors,
          behavior: selectedBehavior
            ? {
                behaviorLabel: selectedBehavior.behaviorLabel,
                behaviorText: selectedBehavior.behaviorText,
              }
            : null,
        });

        const existing = localStorage.getItem("cbt_history");
        const histories = existing ? JSON.parse(existing) : [];
        histories.unshift(historyItem);
        if (histories.length > 20) histories.pop();
        localStorage.setItem("cbt_history", JSON.stringify(histories));
      } catch (e) {
        console.error("히스토리 저장 실패:", e);
      }
    }

    toast.success("세션 기록이 저장되었습니다. 평안을 기원합니다.");
    clearCbtSessionStorage();
    onComplete();
  };

  const primaryEmotion = emotionThoughtPairs[0]?.emotion ?? "";

  const handleSavePrayer = async () => {
    if (!bibleVerse) return;
    if (savingPrayer) return;

    const now = new Date().toISOString();
    const title = primaryEmotion
      ? `${primaryEmotion}에 대한 기도`
      : "기도 노트";
    const tags = primaryEmotion ? [primaryEmotion] : [];

    let emotionNoteId: string | null = null;
    try {
      const raw = sessionStorage.getItem("cbt_active_note");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.noteId) {
          emotionNoteId = String(parsed.noteId);
        }
      }
    } catch {
      /* ignore */
    }

    if (!user) {
      try {
        setSavingPrayer(true);
        const existingRaw = localStorage.getItem("prayer_notes");
        const existing = existingRaw ? JSON.parse(existingRaw) : [];
        const newNote = {
          id: Date.now().toString(),
          title,
          content: bibleVerse.prayer,
          tags,
          emotionNoteId,
          book: bibleVerse.book,
          chapter: bibleVerse.chapter,
          startVerse: bibleVerse.startVerse,
          endVerse: bibleVerse.endVerse,
          responses: [],
          timestamp: now,
        };
        const updated = [newNote, ...existing];
        localStorage.setItem("prayer_notes", JSON.stringify(updated));
        toast.success("기도 노트에 저장되었습니다.");
      } catch (e) {
        console.error("기도 노트 로컬 저장 실패:", e);
        toast.error("기도 노트를 저장하지 못했습니다.");
      } finally {
        setSavingPrayer(false);
      }
      return;
    }

    setSavingPrayer(true);
    try {
      const { error } = await supabase.from("prayer_notes").insert({
        user_id: user.id,
        title,
        content: bibleVerse.prayer,
        tags,
        emotion_note_id: emotionNoteId ? Number(emotionNoteId) : null,
        book: bibleVerse.book,
        chapter: bibleVerse.chapter,
        start_verse: bibleVerse.startVerse,
        end_verse: bibleVerse.endVerse,
      });
      if (error) throw error;
      toast.success("기도 노트에 저장되었습니다.");
    } catch (e) {
      console.error("기도 노트 저장 실패:", e);
      toast.error("기도 노트를 저장하지 못했습니다.");
    } finally {
      setSavingPrayer(false);
    }
  };

  const showStep3Placeholder = step < 4;
  const showAlternativesPicker = step === 4 && !hasSelectedThought;
  const showBibleResult = wantsBibleVerse === true;
  const showFinalArea =
    hasSelectedThought &&
    !showBibleResult &&
    (step >= 5 || wantsBibleVerse === false || isDeepNormal);
  const showStep4AfterPickPanel =
    step === 4 && hasSelectedThought && !showFinalArea;
  const showBibleOfferInFinalArea =
    isChristian && hasSelectedThought && wantsBibleVerse === null;
  const shouldShowDial =
    isDeep && hasAnyIntensity && (isDeepNormal || showFinalIntensity);

  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (skipStepScrollRef.current) {
      skipStepScrollRef.current = false;
      return;
    }
    // 단계 변화 시 스크롤을 상단으로
    scrollToTop();
  }, [step]);

  const header = useMemo(() => {
    if (step < 4) {
      return {
        badge: "STEP 3 · 준비 중",
        title: "대안사고 단계가 곧 열립니다.",
        desc: "인지오류를 먼저 검토해주세요.",
      };
    }

    if (step === 4 && !hasSelectedThought) {
      return {
        badge: "STEP 4 · 대안사고",
        title: "어떤 대안사고가 가장 마음에 와닿나요?",
        desc: "가장 힘이 되는 생각을 골라주세요.",
      };
    }

    return {
      badge: "STEP 5 · 마무리",
    };
  }, [step, hasSelectedThought, wantsBibleVerse]);

  const handleBack = () => {
    if (showFinalIntensity) {
      setShowFinalIntensity(false);
      return;
    }
    if (showBibleResult) {
      setWantsBibleVerse(null);
      return;
    }
    if (step === 4 && hasSelectedThought) {
      onSetSelectedAlternativeThought("");
      return;
    }
    onPrevious?.();
  };

  return (
    <div className="relative min-h-[600px] flex flex-col">
      {showBackButton && (
        <div className="absolute right-4 -top-3 z-10 flex items-center gap-2">
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
      <RightStepHeaderSection
        badge={header.badge}
        title={header.title}
        desc={header.desc}
      />

      <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto">
        {showStep3Placeholder && <RightPlaceholderSection />}

        {showAlternativesPicker && (
          <RightAlternativePickerSection
            thoughtsLoading={thoughtsLoading}
            thoughtsError={thoughtsError}
            alternativeThoughts={alternativeThoughts}
            onSelectThought={handleSelectThought}
            onRetry={() => void generateAlternatives({ force: true })}
            onReviewAlternatives={handleReviewAlternatives}
          />
        )}

        {showStep4AfterPickPanel && (
          <div className="space-y-4">
            <RightSummarySection
              userInput={userInput}
              emotionThoughtPairs={emotionThoughtPairs}
              selectedCognitiveErrors={selectedCognitiveErrors}
              selectedAlternativeThought={selectedAlternativeThought}
              selectedBehaviorId={selectedBehavior?.behaviorId ?? null}
              onSelectBehavior={setSelectedBehavior}
              onLoadingChange={setIsBehaviorGenerating}
              onBackToAlternatives={handleBackToAlternatives}
            />
            {isChristian ? (
              <BibleOfferCard
                onAccept={handleRequestBible}
                onDecline={handleDoesNotWantBible}
                bibleLoading={bibleLoading}
                bibleError={bibleError}
              />
            ) : (
              <RightShalomSection
                isDeep={isDeep}
                isBehaviorGenerating={isBehaviorGenerating}
                onComplete={handleFinalComplete}
              />
            )}
          </div>
        )}

        {showBibleResult && (
          <div className="space-y-4">
              <RightBibleResultSection
                bibleSectionRef={bibleSectionRef}
                bibleLoading={bibleLoading}
                bibleError={bibleError}
                bibleVerse={bibleVerse}
                onRetry={handleRequestBible}
                onComplete={handleFinalComplete}
                restartAction={renderRestartWithSameInput()}
              userInput={userInput}
              emotionThoughtPairs={emotionThoughtPairs}
              selectedCognitiveErrors={selectedCognitiveErrors}
              selectedAlternativeThought={selectedAlternativeThought}
              selectedBehaviorId={selectedBehavior?.behaviorId ?? null}
              onSelectBehavior={setSelectedBehavior}
              onLoadingChange={setIsBehaviorGenerating}
              onBackToAlternatives={handleBackToAlternatives}
              isBehaviorGenerating={isBehaviorGenerating}
              savingPrayer={savingPrayer}
              onSavePrayer={handleSavePrayer}
            />
          </div>
        )}

        {showFinalArea && (
          <RightFinalAreaSection
            userInput={userInput}
            emotionThoughtPairs={emotionThoughtPairs}
            selectedCognitiveErrors={selectedCognitiveErrors}
            selectedAlternativeThought={selectedAlternativeThought}
            selectedBehaviorId={selectedBehavior?.behaviorId ?? null}
            onSelectBehavior={setSelectedBehavior}
            onLoadingChange={setIsBehaviorGenerating}
            onBackToAlternatives={handleBackToAlternatives}
            showBibleOffer={showBibleOfferInFinalArea}
            onAcceptBible={handleRequestBible}
            onDeclineBible={handleDoesNotWantBible}
            bibleLoading={bibleLoading}
            bibleError={bibleError}
            shouldShowDial={shouldShowDial}
            finalIntensities={finalIntensities}
            onChangeFinalIntensity={(emotion, value) =>
              setFinalIntensities((prev) => ({
                ...prev,
                [emotion]: value,
              }))
            }
            onEnableFinalIntensity={() => {
              setShowFinalIntensity(true);
              if (Object.keys(finalIntensities).length === 0)
                seedFinalIntensitiesFromPairs();
            }}
            onComplete={handleFinalComplete}
            isBehaviorGenerating={isBehaviorGenerating}
            isDeep={isDeep}
            hasAnyIntensity={hasAnyIntensity}
            restartAction={renderRestartWithSameInput()}
          />
        )}
      </div>
    </div>
  );
}
