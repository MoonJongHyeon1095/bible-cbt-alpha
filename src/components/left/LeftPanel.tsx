// src/components/left/LeftPanel.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  analyzeCognitiveErrorDetails,
  COGNITIVE_ERRORS,
  type ErrorIndex,
  generateBurnsEmpathy,
  rankCognitiveErrors,
} from "../../lib/ai";
import type { EmotionThoughtPair } from "../../types";
import type { CbtMode } from "../header/ModePicker";
import { Card } from "../ui/card";
import { CognitiveErrorPickerCard } from "./CognitiveErrorPickerCard";
import { EmotionIntensityModal } from "./EmotionIntensityModal";
import { EmpathyCard } from "./EmpathyCard";

interface LeftPanelProps {
  step: number;
  emotionThoughtPairs: EmotionThoughtPair[];
  userInput: string;
  positiveReframes: { [emotion: string]: string };
  onSetPositiveReframes: (reframes: { [emotion: string]: string }) => void;
  onSelectCognitiveErrors: (errors: string[]) => void;
  onNext: () => void;
  mode: CbtMode;
}

type BurnsEmpathyShape = {
  thoughtEmpathy: string;
  emotionEmpathy: string;
  iStatement: string;
  question: string;
  soothing: string;
};

type RankItem = {
  index: ErrorIndex;
  reason: string;
  evidenceQuote?: string;
};

type DetailItem = {
  index: ErrorIndex;
  analysis: string;
};

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
  const currentPair =
    emotionThoughtPairs.length > 0 ? emotionThoughtPairs[0] : null;

  const isLite = mode.detailMode === "lite";

  // 1) Burns 공감
  const [burnsEmpathy, setBurnsEmpathy] = useState<BurnsEmpathyShape | null>(
    null
  );
  const [empathyLoading, setEmpathyLoading] = useState(false);
  const [empathyError, setEmpathyError] = useState<string | null>(null);

  // 2) 목표 감정 강도
  const [targetIntensity, setTargetIntensity] = useState(30);
  const [intensitySet, setIntensitySet] = useState(false);
  const [showIntensityModal, setShowIntensityModal] = useState(false);

  // 2.a 랭킹
  const [ranked, setRanked] = useState<RankItem[] | null>(null);
  const [rankLoading, setRankLoading] = useState(false);
  const [rankError, setRankError] = useState<string | null>(null);

  // 2.b 상세(후보만)
  const [detailByIndex, setDetailByIndex] = useState<
    Partial<Record<ErrorIndex, DetailItem>>
  >({});
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // 후보 3개
  const [candidate3, setCandidate3] = useState<ErrorIndex[]>([]);

  // 선택(최대 2개)
  const [selected, setSelected] = useState<ErrorIndex[]>([]);

  const pairKey = useMemo(() => {
    if (!currentPair) return "";
    return `${currentPair.emotion}::${currentPair.thought}::${currentPair.intensity}`;
  }, [currentPair]);

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
        badge: "STEP 3 · 공감 및 목표",
        title: "생각 속 오류를 함께 찾아볼까요?",
        desc: "AI가 제안한 오류를 검토하고 맞다고 느끼는 것을 선택하세요.",
      };
    }

    if (step === 3 && intensitySet) {
      return {
        badge: "STEP 3 · 인지오류 검토",
        title: "생각 속 오류를 함께 찾아볼까요?",
        desc: "AI가 제안한 오류를 검토하고 맞다고 느끼는 것을 선택하세요.",
      };
    }

    return {
      badge: "STEP 4 · 대안사고 준비",
      title: "이제 대안사고를 만들 준비가 되었어요.",
      desc: "선택한 오류를 바탕으로 오른쪽에서 대안사고를 확인하세요.",
    };
  }, [step, intensitySet]);

  const lastPairKeyRef = useRef<string>("");

  useEffect(() => {
    if (!pairKey) return;

    if (lastPairKeyRef.current && lastPairKeyRef.current !== pairKey) {
      setBurnsEmpathy(null);
      setEmpathyError(null);
      setEmpathyLoading(false);

      setTargetIntensity(30);
      setIntensitySet(false);
      setShowIntensityModal(false);

      setRanked(null);
      setRankLoading(false);
      setRankError(null);

      setDetailByIndex({});
      setDetailLoading(false);
      setDetailError(null);

      setCandidate3([]);
      setSelected([]);
    }

    lastPairKeyRef.current = pairKey;
  }, [pairKey]);

  const isStale = useCallback(
    (keyAtStart: string) => lastPairKeyRef.current !== keyAtStart,
    []
  );

  // Step3 진입: Burns 시작
  useEffect(() => {
    if (step === 3 && currentPair && !burnsEmpathy && !empathyLoading) {
      void generateEmpathy();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, currentPair, burnsEmpathy, empathyLoading]);

  // Step3 진입: 랭킹 시작(독립적으로)
  useEffect(() => {
    if (step === 3 && currentPair && !ranked && !rankLoading) {
      void runRankThenKickoffTop3Details();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, currentPair, ranked, rankLoading]);

  const generateEmpathy = useCallback(async () => {
    if (!currentPair) return;
    const keyAtStart = pairKey;

    setEmpathyLoading(true);
    setEmpathyError(null);

    try {
      const pairIntensity = currentPair.intensity ?? 50;
      const result = await generateBurnsEmpathy(
        userInput,
        currentPair.emotion,
        currentPair.thought,
        pairIntensity
      );
      if (isStale(keyAtStart)) return;

      setBurnsEmpathy(result);
      setTargetIntensity(Math.round(pairIntensity * 0.6));
    } catch (err) {
      if (isStale(keyAtStart)) return;
      setEmpathyError(
        err instanceof Error ? err.message : "오류가 발생했습니다."
      );
    } finally {
      if (isStale(keyAtStart)) return;
      setEmpathyLoading(false);
    }
  }, [currentPair, isStale, pairKey, userInput]);

  const handleIntensitySet = useCallback(() => {
    setIntensitySet(true);
  }, []);

  const runRankThenKickoffTop3Details = useCallback(async () => {
    if (!currentPair) return;
    const keyAtStart = pairKey;

    setRankLoading(true);
    setRankError(null);
    setDetailError(null);

    try {
      const r = await rankCognitiveErrors(userInput, currentPair.thought);
      if (isStale(keyAtStart)) return;

      setRanked(r.ranked);

      setDetailByIndex({});
      setSelected([]);

      const top3 = r.ranked.map((x) => x.index).slice(0, 3);
      setCandidate3(top3);

      if (top3.length > 0) {
        void fetchDetails(top3);
      }
    } catch (err) {
      if (isStale(keyAtStart)) return;
      setRankError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      if (isStale(keyAtStart)) return;
      setRankLoading(false);
    }
  }, [currentPair, isStale, pairKey, userInput]);

  const fetchDetails = useCallback(
    async (candidates: ErrorIndex[]) => {
      if (!currentPair) return;
      if (candidates.length === 0) return;

      const keyAtStart = pairKey;

      setDetailLoading(true);
      setDetailError(null);

      try {
        const detail = await analyzeCognitiveErrorDetails(
          userInput,
          currentPair.thought,
          candidates
        );

        if (isStale(keyAtStart)) return;

        setDetailByIndex((prev) => {
          const next = { ...prev };
          for (const e of detail.errors) {
            next[e.index] = e;
          }
          return next;
        });
      } catch (err) {
        if (isStale(keyAtStart)) return;
        setDetailError(
          err instanceof Error ? err.message : "오류가 발생했습니다."
        );
      } finally {
        if (isStale(keyAtStart)) return;
        setDetailLoading(false);
      }
    },
    [currentPair, isStale, pairKey, userInput]
  );

  const rerollCandidates = useCallback(async () => {
    if (!currentPair) return;

    if (!ranked || ranked.length === 0) {
      await runRankThenKickoffTop3Details();
      return;
    }

    const exclude = new Set<ErrorIndex>();
    for (const idx of selected) exclude.add(idx);
    for (const k of Object.keys(detailByIndex)) {
      exclude.add(Number(k) as ErrorIndex);
    }

    const next: ErrorIndex[] = [];
    for (const item of ranked) {
      if (next.length >= 3) break;
      if (exclude.has(item.index)) continue;
      next.push(item.index);
    }

    if (next.length === 0) {
      setDetailError(
        "더 이상 새로운 후보가 없습니다. 다시 분석하려면 새 랭킹을 만들어야 해요."
      );
      return;
    }

    setCandidate3(next);
    void fetchDetails(next);
  }, [
    currentPair,
    ranked,
    selected,
    detailByIndex,
    fetchDetails,
    runRankThenKickoffTop3Details,
  ]);

  const toggleSelect = useCallback((idx: ErrorIndex) => {
    setSelected((prev) => {
      if (prev.includes(idx)) return prev.filter((x) => x !== idx);
      if (prev.length >= 2) return prev;
      return [...prev, idx];
    });
  }, []);

  const handleConfirm2Errors = useCallback(() => {
    if (selected.length !== 2) return;
    const titles = selected.map((idx) => COGNITIVE_ERRORS[idx - 1].title);
    onSelectCognitiveErrors(titles);
    onNext();
  }, [onNext, onSelectCognitiveErrors, selected]);

  const uiIndices: ErrorIndex[] = useMemo(() => {
    const set = new Set<ErrorIndex>();
    const out: ErrorIndex[] = [];

    for (const idx of selected) {
      if (set.has(idx)) continue;
      set.add(idx);
      out.push(idx);
    }

    for (const idx of candidate3) {
      if (set.has(idx)) continue;
      set.add(idx);
      out.push(idx);
    }

    return out;
  }, [selected, candidate3]);

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
            uiIndices={uiIndices}
            selected={selected}
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
