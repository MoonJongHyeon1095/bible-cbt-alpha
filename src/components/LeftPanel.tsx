// src/components/LeftPanel.tsx
import { Check, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import {
  analyzeCognitiveErrors,
  CognitiveErrorAnalysisResult,
  generateBurnsEmpathy,
} from "../lib/ai";
import type { EmotionThoughtPair } from "../types";
import { EmotionIntensityModal } from "./EmotionIntensityModal";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface LeftPanelProps {
  step: number;
  emotionThoughtPairs: EmotionThoughtPair[];
  userInput: string;
  positiveReframes: { [emotion: string]: string };
  onSetPositiveReframes: (reframes: { [emotion: string]: string }) => void;
  onSelectCognitiveErrors: (errors: string[]) => void;
  onNext: () => void;
}

export function LeftPanel({
  step,
  emotionThoughtPairs,
  userInput,
  positiveReframes,
  onSetPositiveReframes,
  onSelectCognitiveErrors,
  onNext,
}: LeftPanelProps) {
  // 현재 처리 중인 감정-자동사고 쌍 (현재는 1개만)
  const currentPair =
    emotionThoughtPairs.length > 0 ? emotionThoughtPairs[0] : null;

  // 번즈식 공감법 결과
  const [burnsEmpathy, setBurnsEmpathy] = useState<{
    thoughtEmpathy: string;
    emotionEmpathy: string;
    iStatement: string;
    question: string;
    soothing: string;
  } | null>(null);
  const [empathyLoading, setEmpathyLoading] = useState(false);
  const [empathyError, setEmpathyError] = useState<string | null>(null);

  // 목표 감정 강도
  const [targetIntensity, setTargetIntensity] = useState(30);
  const [intensitySet, setIntensitySet] = useState(false);
  const [showIntensityModal, setShowIntensityModal] = useState(false);

  // 인지오류 분석 결과
  const [cognitiveErrors, setCognitiveErrors] =
    useState<CognitiveErrorAnalysisResult | null>(null);
  const [errorsLoading, setErrorsLoading] = useState(false);
  const [errorsError, setErrorsError] = useState<string | null>(null);

  // 인지오류 선택 (10개 중 2개 직접 선택)
  const [selectedErrors2, setSelectedErrors2] = useState<number[]>([]);

  // Step 3일 때 번즈식 공감법 생성
  // useEffect(() => {
  //   if (step === 3 && currentPair && !burnsEmpathy && !empathyLoading) {
  //     generateEmpathy();
  //   }
  // }, [step, currentPair]);
  useEffect(() => {
    if (step === 3 && currentPair && !burnsEmpathy && !empathyLoading) {
      generateEmpathy();
    }
  }, [step, currentPair, burnsEmpathy, empathyLoading]);

  // 번즈식 공감법 생성
  const generateEmpathy = async () => {
    if (!currentPair) return;

    setEmpathyLoading(true);
    setEmpathyError(null);

    try {
      const result = await generateBurnsEmpathy(
        userInput,
        currentPair.emotion,
        currentPair.thought,
        currentPair.intensity
      );
      setBurnsEmpathy(result);

      // 목표 강도 초기화 (현재 강도의 60%로 설정)
      setTargetIntensity(Math.round(currentPair.intensity * 0.6));
    } catch (err) {
      setEmpathyError(
        err instanceof Error ? err.message : "오류가 발생했습니다."
      );
    } finally {
      setEmpathyLoading(false);
    }
  };

  // 목표 강도 설정 완료 후 인지오류 분석
  const handleIntensitySet = async () => {
    setIntensitySet(true);
    await analyzeErrors();
  };

  // 인지오류 분석
  const analyzeErrors = async () => {
    if (!currentPair) return;

    setErrorsLoading(true);
    setErrorsError(null);

    try {
      const result = await analyzeCognitiveErrors(
        userInput,
        currentPair.thought
      );
      setCognitiveErrors(result);
    } catch (err) {
      setErrorsError(
        err instanceof Error ? err.message : "오류가 발생했습니다."
      );
      console.error("인지오류 분석 오류:", err);
    } finally {
      setErrorsLoading(false);
    }
  };

  // 인지오류 2개 선택 토글
  const toggleError2 = (index: number) => {
    if (selectedErrors2.includes(index)) {
      setSelectedErrors2(selectedErrors2.filter((i) => i !== index));
    } else if (selectedErrors2.length < 2) {
      setSelectedErrors2([...selectedErrors2, index]);
    }
  };

  // 최종 2개 선택 완료 → Step 4로
  const handleConfirm2Errors = () => {
    if (cognitiveErrors) {
      const finalErrors = selectedErrors2.map(
        (i) => cognitiveErrors.errors[i].title
      );
      onSelectCognitiveErrors(finalErrors);
      onNext();
    }
  };

  return (
    <Card className="bg-slate-50/95 backdrop-blur-sm p-6 shadow-2xl border border-slate-200/50 min-h-[600px] flex flex-col">
      <div className="mb-4">
        <div className="inline-block bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-1.5 rounded-full mb-3 shadow-lg text-sm">
          좌측 (3) 🔍
        </div>
        <h2 className="text-slate-800 text-xl">인지오류 검토</h2>
        <p className="text-slate-600 text-sm mt-2">
          우리가 만약 우리 생각의 오류를 찾을 수 있다면, 굉장히 빠르게 우리의
          감정이 달라지는 것을 볼 수 있습니다.
        </p>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto">
        {step < 3 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500">
              중앙 패널에서 감정과 자동사고를 선택해주세요.
            </p>
          </div>
        )}

        {/* Step 3: 번즈식 공감법 + 목표 강도 설정 */}
        {step === 3 && currentPair && !intensitySet && (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-green-800 mb-2">
                <strong>{currentPair.emotion}</strong> (강도:{" "}
                {currentPair.intensity})
              </p>
              <p className="text-slate-700 italic mb-1">
                "{currentPair.thought}"
              </p>
            </div>

            {/* 번즈식 공감법 */}
            {empathyLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="size-8 animate-spin text-green-600 mb-4" />
                <p className="text-slate-600">
                  당신의 마음을 헤아리고 있습니다...
                </p>
              </div>
            ) : empathyError ? (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
                <p className="mb-2">{empathyError}</p>
                <Button onClick={generateEmpathy} variant="outline" size="sm">
                  다시 시도
                </Button>
              </div>
            ) : burnsEmpathy ? (
              <>
                {/* 번즈식 공감법 표시 - compact 버전 */}
                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300 space-y-2">
                  {/* 생각 공감 */}
                  <p className="text-slate-800 leading-relaxed text-sm">
                    {burnsEmpathy.thoughtEmpathy}
                  </p>

                  {/* 감정 공감 */}
                  <p className="text-slate-800 leading-relaxed text-sm">
                    {burnsEmpathy.emotionEmpathy}
                  </p>

                  {/* 나 전달 */}
                  <p className="text-slate-800 leading-relaxed text-sm">
                    {burnsEmpathy.iStatement}
                  </p>

                  {/* 달래기 - 간결 버전 */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-900 text-sm mb-1">
                      💝 제가 발견한 당신의 모습
                    </p>

                    {(() => {
                      const soothing = burnsEmpathy.soothing ?? "";
                      const hasBullets = /\(1\)|\(2\)|\(3\)/.test(soothing);

                      // ✅ (1)(2)(3) 포맷이면 기존 파서 사용
                      if (hasBullets) {
                        return (
                          <div className="text-slate-700 leading-snug space-y-1 text-sm">
                            {soothing
                              .split(/\(1\)|\(2\)|\(3\)/)
                              .map((part, idx) => {
                                if (idx === 0) {
                                  const mainText = part
                                    .split("제 생각은,")[1]
                                    ?.trim();
                                  return mainText ? (
                                    <p key={idx} className="text-blue-800">
                                      <strong>제 생각은,</strong>
                                    </p>
                                  ) : null;
                                } else if (idx <= 3) {
                                  const content = part
                                    .split("그 증거가")[0]
                                    ?.trim();
                                  if (!content) return null;
                                  return (
                                    <p key={idx} className="pl-3">
                                      <strong className="text-blue-600">
                                        ({idx})
                                      </strong>{" "}
                                      {content}
                                    </p>
                                  );
                                } else {
                                  const evidenceMatch =
                                    part.match(/그 증거가 바로[^.]*\./);
                                  return evidenceMatch ? (
                                    <p key={idx} className="text-blue-800 mt-1">
                                      <strong>{evidenceMatch[0]}</strong>
                                    </p>
                                  ) : null;
                                }
                              })}
                          </div>
                        );
                      }

                      // ✅ 일반 문장형 soothing이면 그냥 통째로 출력
                      return (
                        <p className="text-blue-800 text-sm leading-relaxed">
                          {soothing}
                        </p>
                      );
                    })()}
                  </div>

                  {/* 질문법 */}
                  <p className="text-slate-800 leading-relaxed text-sm">
                    {burnsEmpathy.question}
                  </p>
                </div>

                {/* 목표 강도 설정 - 눈에 띄게 */}
                <Button
                  onClick={() => setShowIntensityModal(true)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-5 text-base shadow-lg"
                >
                  💭 감정 강도 조절하기
                </Button>
              </>
            ) : null}
          </div>
        )}

        {/* Step 3: 인지오류 10개 중 2개 선택 */}
        {step === 3 && intensitySet && (
          <div className="space-y-4">
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-green-800 text-sm mb-1">
                <strong>{currentPair?.emotion}</strong> (현재:{" "}
                {currentPair?.intensity} → 목표: {targetIntensity})
              </p>
              <p className="text-slate-700 text-sm">
                이 생각에 담긴 인지오류를 찾아봅시다.{" "}
                <strong>2가지를 선택</strong>해주세요.
              </p>
            </div>

            {errorsLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="size-8 animate-spin text-green-600 mb-4" />
                <p className="text-slate-600">
                  인지오류를 분석하고 있습니다...
                </p>
              </div>
            ) : errorsError ? (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
                <p className="mb-2">{errorsError}</p>
                <Button onClick={analyzeErrors} variant="outline" size="sm">
                  다시 도
                </Button>
              </div>
            ) : cognitiveErrors ? (
              <>
                <div className="space-y-3 max-h-[350px] overflow-y-auto">
                  {cognitiveErrors.errors.map((error, index) => (
                    <button
                      key={index}
                      onClick={() => toggleError2(index)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all relative ${
                        selectedErrors2.includes(index)
                          ? "border-green-600 bg-green-50"
                          : "border-slate-200 hover:border-green-300 bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`flex-shrink-0 w-6 h-6 rounded-full text-white flex items-center justify-center text-sm ${
                            selectedErrors2.includes(index)
                              ? "bg-green-600"
                              : "bg-slate-400"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-slate-800 mb-1">{error.title}</p>
                          <p className="text-slate-500 text-sm mb-2">
                            {error.description}
                          </p>

                          {/* 사용자 원본 글 인용 */}
                          <div className="bg-blue-50 border-l-4 border-blue-400 p-2 rounded mb-2">
                            <p className="text-xs text-blue-600 mb-1">
                              📝 당신이 쓴 글:
                            </p>
                            <p className="text-sm text-blue-900 italic">
                              "{error.userQuote}"
                            </p>
                          </div>

                          {/* 구체적 분석 */}
                          <div className="bg-amber-50 border-l-4 border-amber-400 p-2 rounded">
                            <p className="text-xs text-amber-600 mb-1">
                              🔍 분석:
                            </p>
                            <p className="text-sm text-amber-900">
                              {error.analysis}
                            </p>
                          </div>
                        </div>
                        {selectedErrors2.includes(index) && (
                          <Check className="size-5 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedErrors2.length > 0 && (
                  <div className="bg-green-50 p-3 rounded-lg text-center text-green-800">
                    {selectedErrors2.length} / 2개 선택됨
                  </div>
                )}

                {/* 여기에 없다 - 재생성 버튼 */}
                <Button
                  onClick={() => {
                    setSelectedErrors2([]);
                    analyzeErrors();
                  }}
                  variant="outline"
                  className="w-full gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  <RefreshCw className="size-4" />
                  여기에 없다 (다른 인지오류 분석)
                </Button>

                <Button
                  onClick={handleConfirm2Errors}
                  disabled={selectedErrors2.length !== 2}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  인지오류 검토 완료 → 대안사고 구성
                </Button>
              </>
            ) : null}
          </div>
        )}

        {/* Step 4 이상: 완료 */}
        {step >= 4 && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <p className="text-green-800 mb-2">✓ 인지오류 검토 완료</p>
            <p className="text-slate-700 mb-2">
              감정과 생각을 깊이 다루었습니다.
            </p>
            <p className="text-emerald-600">
              → 우측 패널에서 대안사고를 구성해주세요.
            </p>
          </div>
        )}
      </div>

      {/* 감정 강도 모달 */}
      {currentPair && (
        <EmotionIntensityModal
          open={showIntensityModal}
          emotion={currentPair.emotion}
          currentIntensity={currentPair.intensity}
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
