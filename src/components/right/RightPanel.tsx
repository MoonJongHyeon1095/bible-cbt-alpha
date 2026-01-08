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
import type { CbtMode } from "../header/navigation/ModePicker";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { AlternativeThoughtCard } from "./AlternativeThoughtCard";
import { AlternativeThoughtIntroCard } from "./AlternativeThoughtIntroCard";
import { AlternativeThoughtQuoteCard } from "./AlternativeThoughtQuoteCard";
import { BibleOfferCard } from "./BibleOfferCard";
import { BibleVerseCard } from "./BibleVerseCard";
import { FinalIntensityCard } from "./FinalIntensityCard";
import { SelectedThoughtCard } from "./SelectedThoughtCard";
import type { AlternativeThought, BibleVerseResult } from "./types";
import { createAlternativeAPI } from "./utils/api";

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

  const [alternativeThoughts, setAlternativeThoughts] = useState<
    AlternativeThought[]
  >([]);
  const [thoughtsLoading, setThoughtsLoading] = useState(false);
  const [thoughtsError, setThoughtsError] = useState<string | null>(null);

  const [wantsBibleVerse, setWantsBibleVerse] = useState<boolean | null>(null);
  const [bibleVerse, setBibleVerse] = useState<BibleVerseResult | null>(null);
  const [bibleLoading, setBibleLoading] = useState(false);
  const [bibleError, setBibleError] = useState<string | null>(null);
  const [savingScripture, setSavingScripture] = useState(false);
  const [savingPrayer, setSavingPrayer] = useState(false);
  const [savingAlternative, setSavingAlternative] = useState(false);

  const [finalIntensities, setFinalIntensities] = useState<
    Record<string, number>
  >({});
  const [showFinalIntensity, setShowFinalIntensity] = useState(false);
  const [activeNoteIdState, setActiveNoteIdState] = useState<string | null>(
    null
  );

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
    const key = "cbt_active_note";
    const read = () => {
      try {
        const raw = sessionStorage.getItem(key);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        console.log("읽은 활성 노트 ID:", parsed?.noteId);
        if (parsed?.noteId) setActiveNoteIdState(String(parsed.noteId));
      } catch {
        /* ignore */
        console.log("활성 노트 ID 읽기 실패");
      }
    };
    read();
    const handler = () => read();
    window.addEventListener("cbt-active-note-update", handler as any);
    return () => {
      window.removeEventListener("cbt-active-note-update", handler as any);
    };
  }, []);

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

  const handleSaveAlternative = async () => {
    if (!user || !activeNoteIdState || !selectedAlternativeThought.trim()) {
      toast.error("저장된 상황이 있을 때만 저장할 수 있습니다.");
      return;
    }

    if (savingAlternative) return;
    const altText = selectedAlternativeThought.trim();

    try {
      setSavingAlternative(true);
      const numericId = Number(activeNoteIdState);
      const noteId = Number.isNaN(numericId) ? activeNoteIdState : numericId;
      const { ok, payload } = await createAlternativeAPI({
        noteId,
        alternative: altText,
      });
      if (!ok) throw new Error(payload?.error || "저장에 실패했습니다.");
      toast.success("대안사고가 저장되었습니다.");
    } catch (e) {
      console.error("대안사고 저장 실패:", e);
      toast.error("대안사고를 저장하지 못했습니다.");
    } finally {
      setSavingAlternative(false);
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
          reflection: "",
          favorite: false,
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
        reflection: "",
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
            <SelectedThoughtCard
              thought={selectedAlternativeThought}
              canSave={Boolean(activeNoteIdState)}
              isLoggedIn={Boolean(user)}
              saving={savingAlternative}
              onSave={handleSaveAlternative}
            />
            <Button
              onClick={() => {
                onSetSelectedAlternativeThought("");
                void generateAlternatives();
              }}
              variant="outline"
              className="w-full gap-2 border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              다른 답변 검토하기
            </Button>

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
                <SelectedThoughtCard
                  thought={selectedAlternativeThought}
                  canSave={Boolean(activeNoteIdState)}
                  isLoggedIn={Boolean(user)}
                  saving={savingAlternative}
                  onSave={handleSaveAlternative}
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
                >
                  완료
                </Button>
              </>
            )}
          </div>
        )}

        {showFinalArea && (
          <div className="space-y-4">
            <SelectedThoughtCard
              thought={selectedAlternativeThought}
              canSave={Boolean(activeNoteIdState)}
              isLoggedIn={Boolean(user)}
              saving={savingAlternative}
              onSave={handleSaveAlternative}
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
