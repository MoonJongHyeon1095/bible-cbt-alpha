// src/components/left/EmpathyCard.tsx

import { Loader2 } from "lucide-react";
import type { EmotionThoughtPair } from "../../types";
import type { CbtMode } from "../header/navigation/ModePicker";
import { Button } from "../ui/button";

type BurnsEmpathyShape = {
  thoughtEmpathy: string;
  emotionEmpathy: string;
  iStatement: string;
  soothing: string;
  observedSelf: string;
};

type Props = {
  currentPair: EmotionThoughtPair;
  mode: CbtMode;

  burnsEmpathy: BurnsEmpathyShape | null;
  empathyLoading: boolean;
  empathyError: string | null;

  // actions
  onRetry: () => void;
  onOpenIntensityModal: () => void;
  onLiteNext: () => void;

  // optional hint
  showCognitivePreparingHint?: boolean;
};

export function EmpathyCard({
  currentPair,
  mode,
  burnsEmpathy,
  empathyLoading,
  empathyError,
  onRetry,
  onOpenIntensityModal,
  onLiteNext,
  showCognitivePreparingHint,
}: Props) {
  const isLite = mode.detailMode === "lite";
  const empathyBlocks = burnsEmpathy
    ? [
        {
          key: "thought",
          title: "생각을 이해해요",
          body: burnsEmpathy.thoughtEmpathy,
        },
        {
          key: "emotion",
          title: "감정을 인정해요",
          body: burnsEmpathy.emotionEmpathy,
        },
        {
          key: "statement",
          title: "나에게 이렇게 말해요",
          body: burnsEmpathy.iStatement,
        },
        {
          key: "soothing",
          title: "마음을 진정시키는 문장",
          body: burnsEmpathy.soothing,
        },
      ].filter((item) => Boolean(item.body && item.body.trim()))
    : [];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-100 p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              현재 감정
            </p>
            <p className="text-emerald-900 font-semibold text-lg">
              {currentPair.emotion}
            </p>
          </div>
        </div>
        <div className="mt-3 rounded-xl border border-emerald-200 bg-white p-3">
          <p className="text-xs font-semibold text-emerald-700 mb-1">
            자동사고 문장
          </p>
          <p className="text-slate-700 italic">“{currentPair.thought}”</p>
        </div>
      </div>

      {empathyLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Loader2 className="size-6 animate-spin text-emerald-600" />
            <div>
              <p className="text-slate-900 font-semibold">
                공감 메시지 생성 중
              </p>
              <p className="text-sm text-slate-500">
                당신의 마음을 세심하게 살피고 있어요.
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-3 animate-pulse">
            <div className="h-3 rounded-full bg-slate-200 w-5/6" />
            <div className="h-3 rounded-full bg-slate-200 w-4/6" />
            <div className="h-3 rounded-full bg-slate-200 w-3/6" />
          </div>
        </div>
      ) : empathyError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
          <p className="text-rose-900 font-semibold mb-1">
            공감 메시지를 가져오지 못했어요.
          </p>
          <p className="text-rose-700 text-sm mb-3">{empathyError}</p>
          <Button onClick={onRetry} variant="outline" size="sm">
            다시 시도
          </Button>
        </div>
      ) : burnsEmpathy ? (
        <>
          <div className="space-y-4">
            {empathyBlocks.map((item) => (
              <div
                key={item.key}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                  {item.title}
                </p>
                <p className="text-slate-800 leading-relaxed text-sm">
                  {item.body}
                </p>
              </div>
            ))}

            {burnsEmpathy.observedSelf?.trim() && (
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 shadow-sm">
                <p className="text-indigo-900 text-sm font-semibold mb-2">
                  발견한 당신의 모습
                </p>
                <p className="text-indigo-900 text-sm leading-relaxed">
                  {burnsEmpathy.observedSelf}
                </p>
              </div>
            )}
          </div>

          {!isLite && (
            <Button
              onClick={onOpenIntensityModal}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 text-base shadow-lg"
            >
              감정 강도 조절하기
            </Button>
          )}

          {isLite && (
            <Button
              onClick={onLiteNext}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 text-base shadow-lg"
            >
              다음 단계로 이동
            </Button>
          )}

          {showCognitivePreparingHint && (
            <p className="text-xs text-slate-500 text-center">
              인지오류 분석을 준비 중...
            </p>
          )}
        </>
      ) : // burnsEmpathy가 아직 없더라도(전환 순간), 아래 힌트만 보여주고 싶을 때
      showCognitivePreparingHint ? (
        <p className="text-xs text-slate-500 text-center">
          인지오류 분석을 준비 중...
        </p>
      ) : null}
    </div>
  );
}
