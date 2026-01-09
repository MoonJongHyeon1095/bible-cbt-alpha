// src/components/right/RightPanel.tsx
import type { User } from "@supabase/supabase-js";
import { Loader2, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { CognitiveBehaviorId } from "../../constants/behaviors";
import { supabase } from "../../lib/supabase/client";
import type { EmotionThoughtPair } from "../../types";
import type {
  SelectedCognitiveError,
  SessionHistory,
} from "../../types/sessionHistory";
import type { CbtMode } from "../header/navigation/ModePicker";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { AlternativeThoughtCard } from "./AlternativeThoughtCard";
import { AlternativeThoughtIntroCard } from "./AlternativeThoughtIntroCard";
import { AlternativeThoughtQuoteCard } from "./AlternativeThoughtQuoteCard";
import { BehaviorReviewCard } from "./BehaviorReviewCard";
import { BibleOfferCard } from "./BibleOfferCard";
import { BibleVerseCard } from "./BibleVerseCard";
import { FinalIntensityCard } from "./FinalIntensityCard";
import { ProgressSummaryCard } from "./ProgressSummaryCard";
import { SelectedThoughtCard } from "./SelectedThoughtCard";
import { ShalomCard } from "./ShalomCard";
import { useAlternativeThoughts } from "./hooks/useAlternativeThoughts";
import { useBibleVerse } from "./hooks/useBibleVerse";
import { useFinalIntensity } from "./hooks/useFinalIntensity";
import { useTriggerNotes } from "./hooks/useTriggerNotes";

interface RightPanelProps {
  step: number;
  emotionThoughtPairs: EmotionThoughtPair[];
  userInput: string;
  positiveReframes: { [emotion: string]: string };
  selectedCognitiveErrors: SelectedCognitiveError[];
  selectedAlternativeThought: string;
  onSetSelectedAlternativeThought: (thought: string) => void;
  onComplete: () => void;
  onRestartWithSameInput?: () => void;
  onNext: () => void;
  mode: CbtMode;
  user: User | null;
}

export function RightPanel({
  step,
  emotionThoughtPairs,
  userInput,
  positiveReframes,
  selectedCognitiveErrors,
  selectedAlternativeThought,
  onSetSelectedAlternativeThought,
  onComplete,
  onRestartWithSameInput,
  onNext,
  user,
  mode,
}: RightPanelProps) {
  const isDeep = mode.detailMode === "deep";
  const isChristian = mode.toneMode === "christian";
  const isDeepNormal = isDeep && !isChristian;

  const hasSelectedThought = Boolean(selectedAlternativeThought);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const hasAnyIntensity = useMemo(
    () => emotionThoughtPairs.some((p) => p.intensity != null),
    [emotionThoughtPairs]
  );

  const [savingScripture, setSavingScripture] = useState(false);
  const [savingPrayer, setSavingPrayer] = useState(false);
  const [selectedBehavior, setSelectedBehavior] = useState<{
    behaviorId: CognitiveBehaviorId;
    behaviorLabel: string;
    behaviorText: string;
  } | null>(null);
  const [isBehaviorGenerating, setIsBehaviorGenerating] = useState(false);

  const autoAdvancedRef = useRef(false);

  const goNextIfNeeded = () => {
    if (step < 5) onNext();
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
    onAdvance: goNextIfNeeded,
  });
  const {
    savingAlternative,
    handleSaveAlternative,
    savingBehavior,
    handleSaveBehavior,
    isAlternativeSaved,
    isBehaviorSaved,
  } = useTriggerNotes({
    user,
    userInput,
    selectedAlternativeThought,
    selectedCognitiveErrors,
    selectedBehavior,
  });

  useEffect(() => {
    if (!hasSelectedThought || step < 4) {
      autoAdvancedRef.current = false;
      setShowFinalIntensity(false);
      setFinalIntensities({});
    }
  }, [hasSelectedThought, setFinalIntensities, setShowFinalIntensity, step]);

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

  const handleDoesNotWantBible = async () => {
    lockBibleChoice();

    setWantsBibleVerse(false);

    if (!isDeep) {
      await handleFinalComplete();
      return;
    }

    setShowFinalIntensity(true);
    seedFinalIntensitiesFromPairs();
    goNextIfNeeded();
  };

  const handleFinalComplete = async () => {
    const pairsToSave = emotionThoughtPairs.map((pair) => ({
      ...pair,
      intensity: isDeep
        ? finalIntensities[pair.emotion] ?? pair.intensity ?? null
        : null,
    }));

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
      positiveReframes,
      bibleVerse: wantsBibleVerse ? bibleVerse : null,
      detailMode: mode.detailMode,
    };

    if (user) {
      try {
        const { error } = await supabase.from("session_history").insert({
          user_id: user.id,
          timestamp: historyItem.timestamp,
          user_input: historyItem.userInput,
          emotion_thought_pairs: pairsToSave,
          selected_cognitive_errors: historyItem.selectedCognitiveErrors,
          selected_alternative_thought: historyItem.selectedAlternativeThought,
          selected_behavior: historyItem.selectedBehavior,
          positive_reframes: historyItem.positiveReframes,
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
    try {
      sessionStorage.removeItem("cbt_saved_error_keys");
      sessionStorage.removeItem("cbt_saved_alternative_keys");
      sessionStorage.removeItem("cbt_saved_behavior_keys");
      sessionStorage.removeItem("cbt_saved_detail_keys");
      sessionStorage.removeItem("cbt_active_note");
    } catch {
      /* ignore */
    }
    onComplete();
  };

  const primaryEmotion = emotionThoughtPairs[0]?.emotion ?? "";

  const handleSaveScripture = async () => {
    if (!bibleVerse || savingScripture) return;

    const now = new Date().toISOString();

    if (!user) {
      try {
        setSavingScripture(true);
        const existingRaw = localStorage.getItem("scripture_notes");
        const existing = existingRaw ? JSON.parse(existingRaw) : [];
        const newNote = {
          id: Date.now().toString(),
          reference: bibleVerse.reference,
          verse: bibleVerse.verse,
          reflections: [],
          timestamp: now,
        };
        const updated = [newNote, ...existing];
        localStorage.setItem("scripture_notes", JSON.stringify(updated));
        toast.success("말씀 노트에 저장되었습니다.");
      } catch (e) {
        console.error("말씀 노트 로컬 저장 실패:", e);
        toast.error("말씀을 저장하지 못했습니다.");
      } finally {
        setSavingScripture(false);
      }
      return;
    }

    setSavingScripture(true);
    try {
      const { error } = await supabase.from("scripture_notes").insert({
        user_id: user.id,
        reference: bibleVerse.reference,
        verse: bibleVerse.verse,
      });
      if (error) throw error;
      toast.success("말씀 노트에 저장되었습니다.");
    } catch (e) {
      console.error("말씀 노트 저장 실패:", e);
      toast.error("말씀 노트를 저장하지 못했습니다.");
    } finally {
      setSavingScripture(false);
    }
  };

  const handleSavePrayer = async () => {
    if (!bibleVerse) return;
    if (savingPrayer) return;

    const now = new Date().toISOString();
    const title = primaryEmotion
      ? `${primaryEmotion}에 대한 기도`
      : "기도 노트";
    const tags = primaryEmotion ? [primaryEmotion] : [];

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
    // 단계 변화나 영역 전환 시 스크롤을 상단으로
    scrollToTop();
  }, [step, showBibleResult, showFinalArea, hasSelectedThought]);

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

    if (wantsBibleVerse === true) {
      return {
        badge: "STEP 5 · 말씀",
        title: "위로가 될 말씀과 기도문을 살펴볼까요?",
        desc: "말씀을 읽고 마음에 와닿는 부분을 기억해두세요.",
      };
    }

    return {
      badge: "STEP 5 · 마무리",
      title: "세션을 마무리하며 구체적인 행동을 고려해볼까요?",
      desc: "행동의 변화가 마음의 변화를 가져오기 마련입니다.",
    };
  }, [step, hasSelectedThought, wantsBibleVerse]);

  return (
    <Card className="bg-slate-50/95 backdrop-blur-sm p-6 shadow-2xl border border-slate-200/50 min-h-[600px] flex flex-col">
      <div className="mb-4 space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
          {header.badge}
        </div>
        <h2 className="text-slate-800 text-xl">{header.title}</h2>
        <p className="text-slate-600 text-sm mt-1">{header.desc}</p>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto">
        {showStep3Placeholder && (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500">인지오류 검토를 완료해주세요.</p>
          </div>
        )}

        {showAlternativesPicker && (
          <div className="space-y-4">
            <AlternativeThoughtIntroCard />

            {thoughtsLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="size-10 animate-spin text-purple-600 mb-4" />
                <p className="text-slate-600 text-lg">
                  대안적 사고를 생성하고 있습니다...
                </p>
              </div>
            ) : thoughtsError ? (
              <div className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-lg">
                <p className="mb-3 text-base">{thoughtsError}</p>
                <Button
                  onClick={() => void generateAlternatives()}
                  variant="outline"
                  size="sm"
                >
                  다시 시도
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {alternativeThoughts.map((item, index) => (
                  <AlternativeThoughtCard
                    key={index}
                    item={item}
                    index={index}
                    onSelect={handleSelectThought}
                  />
                ))}
              </div>
            )}

            {thoughtsLoading && <AlternativeThoughtQuoteCard />}
          </div>
        )}

        {showStep4AfterPickPanel && (
          <div className="space-y-4">
            <ProgressSummaryCard
              userInput={userInput}
              emotionThoughtPairs={emotionThoughtPairs}
              selectedCognitiveErrors={selectedCognitiveErrors}
            />
            <SelectedThoughtCard
              thought={selectedAlternativeThought}
              canSave={Boolean(userInput.trim())}
              saving={savingAlternative}
              saved={isAlternativeSaved(selectedAlternativeThought)}
              onReviewAlternatives={() => {
                onSetSelectedAlternativeThought("");
                void generateAlternatives();
              }}
              reviewDisabled={thoughtsLoading}
              onSave={handleSaveAlternative}
            />
            <BehaviorReviewCard
              userInput={userInput}
              emotionThoughtPairs={emotionThoughtPairs}
              selectedCognitiveErrors={selectedCognitiveErrors}
              selectedAlternativeThought={selectedAlternativeThought}
              selectedBehaviorId={selectedBehavior?.behaviorId ?? null}
              onSelectBehavior={setSelectedBehavior}
              onLoadingChange={setIsBehaviorGenerating}
              onSaveBehavior={handleSaveBehavior}
              savingBehavior={savingBehavior}
              isBehaviorSaved={isBehaviorSaved}
            />

            {isChristian ? (
              <BibleOfferCard
                onAccept={handleWantsBible}
                onDecline={handleDoesNotWantBible}
                bibleLoading={bibleLoading}
                bibleError={bibleError}
              />
            ) : (
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
                <ShalomCard />
                {isDeep ? (
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <Loader2 className="size-4 animate-spin" />
                    마무리 단계로 이동 중...
                  </div>
                ) : (
                  <Button
                    onClick={handleDoesNotWantBible}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={isBehaviorGenerating}
                  >
                    {isBehaviorGenerating ? "행동 제안 생성중" : "완료하기"}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {showBibleResult && (
          <div className="space-y-4">
            {bibleLoading && (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="size-10 animate-spin text-blue-600 mb-4" />
                <p className="text-slate-600 text-lg">
                  말씀과 기도문을 생성하고 있습니다...
                </p>
              </div>
            )}

            {!bibleLoading && bibleError && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-lg">
                <p className="mb-3 text-base">{bibleError}</p>
                <Button onClick={handleWantsBible} variant="outline" size="sm">
                  다시 시도
                </Button>
              </div>
            )}

            {!bibleLoading && !bibleError && bibleVerse && (
              <>
                <ProgressSummaryCard
                  userInput={userInput}
                  emotionThoughtPairs={emotionThoughtPairs}
                  selectedCognitiveErrors={selectedCognitiveErrors}
                />
                <SelectedThoughtCard
                  thought={selectedAlternativeThought}
                  canSave={Boolean(userInput.trim())}
                  saving={savingAlternative}
                  saved={isAlternativeSaved(selectedAlternativeThought)}
                  onSave={handleSaveAlternative}
                />
                <BehaviorReviewCard
                  userInput={userInput}
                  emotionThoughtPairs={emotionThoughtPairs}
                  selectedCognitiveErrors={selectedCognitiveErrors}
                  selectedAlternativeThought={selectedAlternativeThought}
                  selectedBehaviorId={selectedBehavior?.behaviorId ?? null}
                  onSelectBehavior={setSelectedBehavior}
                  onLoadingChange={setIsBehaviorGenerating}
                  onSaveBehavior={handleSaveBehavior}
                  savingBehavior={savingBehavior}
                  isBehaviorSaved={isBehaviorSaved}
                />
                <BibleVerseCard
                  bibleVerse={bibleVerse}
                  onSaveScripture={handleSaveScripture}
                  onSavePrayer={handleSavePrayer}
                  savingScripture={savingScripture}
                  savingPrayer={savingPrayer}
                />
                <Button
                  onClick={handleFinalComplete}
                  className="w-full py-6 text-lg bg-purple-600 hover:bg-purple-700"
                  disabled={isBehaviorGenerating}
                >
                  {isBehaviorGenerating ? "행동제안 생성 중" : "완료"}
                </Button>
              </>
            )}
          </div>
        )}

        {showFinalArea && (
          <div className="space-y-4">
            <ProgressSummaryCard
              userInput={userInput}
              emotionThoughtPairs={emotionThoughtPairs}
              selectedCognitiveErrors={selectedCognitiveErrors}
            />
            <SelectedThoughtCard
              thought={selectedAlternativeThought}
              canSave={Boolean(userInput.trim())}
              saving={savingAlternative}
              saved={isAlternativeSaved(selectedAlternativeThought)}
              onSave={handleSaveAlternative}
            />
            <BehaviorReviewCard
              userInput={userInput}
              emotionThoughtPairs={emotionThoughtPairs}
              selectedCognitiveErrors={selectedCognitiveErrors}
              selectedAlternativeThought={selectedAlternativeThought}
              selectedBehaviorId={selectedBehavior?.behaviorId ?? null}
              onSelectBehavior={setSelectedBehavior}
              onLoadingChange={setIsBehaviorGenerating}
              onSaveBehavior={handleSaveBehavior}
              savingBehavior={savingBehavior}
              isBehaviorSaved={isBehaviorSaved}
            />
            {showBibleOfferInFinalArea && (
              <BibleOfferCard
                onAccept={handleWantsBible}
                onDecline={handleDoesNotWantBible}
                bibleLoading={bibleLoading}
                bibleError={bibleError}
              />
            )}

            <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
              {shouldShowDial && (
                <FinalIntensityCard
                  emotionThoughtPairs={emotionThoughtPairs}
                  finalIntensities={finalIntensities}
                  onChange={(emotion, value) =>
                    setFinalIntensities((prev) => ({
                      ...prev,
                      [emotion]: value,
                    }))
                  }
                />
              )}

              <ShalomCard />

              {isDeep && hasAnyIntensity && !shouldShowDial ? (
                <Button
                  onClick={() => {
                    setShowFinalIntensity(true);
                    if (Object.keys(finalIntensities).length === 0)
                      seedFinalIntensitiesFromPairs();
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  감정 변화 기록하기
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleFinalComplete}
                    className="w-full bg-purple-600 hover:bg-purple-700 mb-4"
                    disabled={isBehaviorGenerating}
                  >
                    {isBehaviorGenerating ? "행동 제안 생성중" : "완료"}
                  </Button>
                  {onRestartWithSameInput && (
                    <Button
                      onClick={() => {
                        if (
                          confirm(
                            "같은 주제로 다시 하시겠습니까? 아직 감정이 남아 있다면 반복하시면 더욱 효과적입니다."
                          )
                        ) {
                          onRestartWithSameInput();
                        }
                      }}
                      variant="outline"
                      className="w-full mb-4 gap-2 border-2 border-green-400 text-green-700 hover:bg-green-50"
                    >
                      <RefreshCw className="size-4" />
                      같은 주제로 다시 하기
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
