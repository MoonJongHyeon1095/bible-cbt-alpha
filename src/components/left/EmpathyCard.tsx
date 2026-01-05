// src/components/left/EmpathyCard.tsx

import { Loader2 } from "lucide-react";
import type { EmotionThoughtPair } from "../../types";
import type { CbtMode } from "../header/ModePicker";
import { Button } from "../ui/button";

type BurnsEmpathyShape = {
  thoughtEmpathy: string;
  emotionEmpathy: string;
  iStatement: string;
  question: string;
  soothing: string;
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

  return (
    <div className="space-y-6">
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <p className="text-green-800 mb-2">
          <strong>{currentPair.emotion}의 문장</strong>
        </p>
        <p className="text-slate-700 italic mb-1">"{currentPair.thought}"</p>
      </div>

      {empathyLoading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="size-8 animate-spin text-green-600 mb-4" />
          <p className="text-slate-600">당신의 마음을 헤아리고 있습니다...</p>
        </div>
      ) : empathyError ? (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
          <p className="mb-2">{empathyError}</p>
          <Button onClick={onRetry} variant="outline" size="sm">
            다시 시도
          </Button>
        </div>
      ) : burnsEmpathy ? (
        <>
          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300 space-y-2">
            <p className="text-slate-800 leading-relaxed text-sm">
              {burnsEmpathy.thoughtEmpathy}
            </p>
            <p className="text-slate-800 leading-relaxed text-sm">
              {burnsEmpathy.emotionEmpathy}
            </p>
            <p className="text-slate-800 leading-relaxed text-sm">
              {burnsEmpathy.iStatement}
            </p>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-900 text-sm mb-1">
                💝 제가 발견한 당신의 모습
              </p>
              <p className="text-blue-800 text-sm leading-relaxed">
                {burnsEmpathy.soothing ?? ""}
              </p>
            </div>
          </div>

          {!isLite && (
            <Button
              onClick={onOpenIntensityModal}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-5 text-base shadow-lg"
            >
              감정 강도 조절하기
            </Button>
          )}

          {isLite && (
            <Button
              onClick={onLiteNext}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white py-5 text-base shadow-lg"
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
