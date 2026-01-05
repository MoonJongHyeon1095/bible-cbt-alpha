// src/components/right/RightPanel.tsx
import type { User } from "@supabase/supabase-js";
import { Loader2, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  generateBibleVerse,
  generateContextualAlternativeThoughts,
} from "../../lib/ai";
import { supabase } from "../../lib/supabase/client";
import type { EmotionThoughtPair } from "../../types";
import type {
  SelectedCognitiveError,
  SessionHistory,
} from "../../types/sessionHistory";
import type { CbtMode } from "../header/ModePicker";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { AlternativeThoughtCard } from "./AlternativeThoughtCard";
import { AlternativeThoughtIntroCard } from "./AlternativeThoughtIntroCard";
import { AlternativeThoughtQuoteCard } from "./AlternativeThoughtQuoteCard";
import { BibleOfferCard } from "./BibleOfferCard";
import { BibleVerseCard } from "./BibleVerseCard";
import { FavoritesAndRetryRow } from "./FavoritesAndRetryRow";
import { FinalIntensityCard } from "./FinalIntensityCard";
import { SelectedThoughtCard } from "./SelectedThoughtCard";
import type { AlternativeThought, BibleVerseResult } from "./types";

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

  const hasAnyIntensity = useMemo(
    () => emotionThoughtPairs.some((p) => p.intensity != null),
    [emotionThoughtPairs]
  );

  const [alternativeThoughts, setAlternativeThoughts] = useState<
    AlternativeThought[]
  >([]);
  const [thoughtsLoading, setThoughtsLoading] = useState(false);
  const [thoughtsError, setThoughtsError] = useState<string | null>(null);

  const [wantsBibleVerse, setWantsBibleVerse] = useState<boolean | null>(null);
  const [bibleVerse, setBibleVerse] = useState<BibleVerseResult | null>(null);
  const [bibleLoading, setBibleLoading] = useState(false);
  const [bibleError, setBibleError] = useState<string | null>(null);

  const [finalIntensities, setFinalIntensities] = useState<
    Record<string, number>
  >({});
  const [showFinalIntensity, setShowFinalIntensity] = useState(false);

  const autoAdvancedRef = useRef(false);
  const bibleChoiceLockedRef = useRef(false);

  const goNextIfNeeded = () => {
    if (step < 5) onNext();
  };

  const seedFinalIntensitiesFromPairs = () => {
    const initial: Record<string, number> = {};
    for (const pair of emotionThoughtPairs) {
      if (pair.intensity != null) initial[pair.emotion] = pair.intensity;
    }
    setFinalIntensities(initial);
  };

  const saveQuestionToFavorites = () => {
    const favorites = JSON.parse(localStorage.getItem("cbt-favorites") || "[]");
    const exists = favorites.some((f: any) => f.text === userInput);

    if (exists) {
      toast.info("이미 즐겨찾기에 있습니다.");
      return;
    }
    if (favorites.length >= 10) {
      toast.warning("최대 10개까지 저장할 수 있습니다.");
      return;
    }

    const newFavorite = {
      id: Date.now().toString(),
      text: userInput,
      createdAt: Date.now(),
    };

    favorites.unshift(newFavorite);
    localStorage.setItem("cbt-favorites", JSON.stringify(favorites));
    toast.success("즐겨찾기에 추가되었습니다!");
  };

  useEffect(() => {
    if (
      step === 4 &&
      alternativeThoughts.length === 0 &&
      !thoughtsLoading &&
      emotionThoughtPairs.length > 0
    ) {
      void generateAlternatives();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, emotionThoughtPairs]);

  useEffect(() => {
    if (!hasSelectedThought || step < 4) {
      autoAdvancedRef.current = false;
      bibleChoiceLockedRef.current = false;

      setWantsBibleVerse(null);
      setBibleVerse(null);
      setBibleError(null);
      setBibleLoading(false);

      setShowFinalIntensity(false);
      setFinalIntensities({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSelectedThought, step]);

  useEffect(() => {
    if (
      isChristian &&
      hasSelectedThought &&
      wantsBibleVerse === false &&
      !bibleChoiceLockedRef.current
    ) {
      setWantsBibleVerse(null);
      setBibleVerse(null);
      setBibleError(null);
      setBibleLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChristian]);

  const generateAlternatives = async () => {
    setThoughtsLoading(true);
    setThoughtsError(null);

    try {
      const emotions = emotionThoughtPairs.map((p) => p.emotion).join(", ");
      const firstPair = emotionThoughtPairs[0];
      const thoughts = await generateContextualAlternativeThoughts(
        userInput,
        emotions,
        firstPair?.thought ?? "",
        selectedCognitiveErrors
      );

      setAlternativeThoughts(thoughts);
    } catch (err) {
      setThoughtsError(
        err instanceof Error ? err.message : "오류가 발생했습니다."
      );
      console.error("대안사고 생성 오류:", err);
    } finally {
      setThoughtsLoading(false);
    }
  };

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

  const handleWantsBible = async () => {
    bibleChoiceLockedRef.current = true;

    setWantsBibleVerse(true);
    setBibleLoading(true);
    setBibleError(null);

    try {
      const emotions = emotionThoughtPairs
        .map((p) =>
          isDeep && p.intensity != null
            ? `${p.emotion}(${p.intensity}/100)`
            : p.emotion
        )
        .join(", ");

      const verse = await generateBibleVerse(userInput, emotions);
      setBibleVerse(verse);

      goNextIfNeeded();
    } catch (err) {
      setBibleError(
        err instanceof Error ? err.message : "오류가 발생했습니다."
      );
    } finally {
      setBibleLoading(false);
    }
  };

  const handleDoesNotWantBible = async () => {
    bibleChoiceLockedRef.current = true;

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
    onComplete();
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

    if (showFinalArea) {
      return {
        badge: "STEP 5 · 마무리",
        title: "세션을 마무리하며 감정 변화를 기록해볼까요?",
        desc: "감정 강도를 남기고 세션을 저장할 수 있어요.",
      };
    }

    return {
      badge: "STEP 4 · 선택 완료",
      title: "선택을 확인하고 다음으로 넘어갈까요?",
      desc: "필요하면 말씀 보기 여부를 선택한 뒤 진행하세요.",
    };
  }, [step, hasSelectedThought, wantsBibleVerse, showFinalArea]);

  return (
    <Card className="bg-slate-50/95 backdrop-blur-sm p-6 shadow-2xl border border-slate-200/50 min-h-[600px] flex flex-col">
      <div className="mb-4 space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
          {header.badge}
        </div>
        <h2 className="text-slate-800 text-xl">{header.title}</h2>
        <p className="text-slate-600 text-sm mt-1">{header.desc}</p>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto">
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
            <SelectedThoughtCard thought={selectedAlternativeThought} />
            <FavoritesAndRetryRow
              onRetry={() => {
                onSetSelectedAlternativeThought("");
                void generateAlternatives();
              }}
              onFavorite={saveQuestionToFavorites}
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
                <PeaceMessage />
                {isDeep ? (
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <Loader2 className="size-4 animate-spin" />
                    마무리 단계로 이동 중...
                  </div>
                ) : (
                  <Button
                    onClick={handleDoesNotWantBible}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    완료하기
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
                <SelectedThoughtCard thought={selectedAlternativeThought} />
                <BibleVerseCard bibleVerse={bibleVerse} />
                <Button
                  onClick={handleFinalComplete}
                  className="w-full py-6 text-lg bg-purple-600 hover:bg-purple-700"
                >
                  완료
                </Button>
              </>
            )}
          </div>
        )}

        {showFinalArea && (
          <div className="space-y-4">
            <SelectedThoughtCard thought={selectedAlternativeThought} />
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

              <PeaceMessage />

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
                  >
                    완료
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

function PeaceMessage({
  className = "text-blue-900 mb-3",
}: {
  className?: string;
}) {
  return (
    <p className={className}>
      세션이 만족스러우셨을지 모르겠습니다. 다만 우리는 진심으로, 당신의 평안을
      바랍니다.
    </p>
  );
}
