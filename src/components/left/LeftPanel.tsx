// // // src/components/left/LeftPanel.tsx
// // import { Check, Loader2, RefreshCw } from "lucide-react";
// // import { useEffect, useMemo, useRef, useState } from "react";
// // import {
// //   analyzeCognitiveErrors,
// //   CognitiveErrorAnalysisResult,
// //   generateBurnsEmpathy,
// // } from "../../lib/ai";
// // import type { EmotionThoughtPair } from "../../types";
// // import { CbtMode } from "../header/ModePicker";
// // import { Button } from "../ui/button";
// // import { Card } from "../ui/card";
// // import { EmotionIntensityModal } from "./EmotionIntensityModal";

// // interface LeftPanelProps {
// //   step: number;
// //   emotionThoughtPairs: EmotionThoughtPair[];
// //   userInput: string;
// //   positiveReframes: { [emotion: string]: string };
// //   onSetPositiveReframes: (reframes: { [emotion: string]: string }) => void;
// //   onSelectCognitiveErrors: (errors: string[]) => void;
// //   onNext: () => void;
// //   mode: CbtMode;
// // }

// // type BurnsEmpathyShape = {
// //   thoughtEmpathy: string;
// //   emotionEmpathy: string;
// //   iStatement: string;
// //   question: string;
// //   soothing: string;
// // };

// // function splitToSentences(text: string): string[] {
// //   if (!text) return [];

// //   const decoded = text
// //     .replace(/\\r\\n/g, "\n")
// //     .replace(/\\n/g, "\n")
// //     .replace(/\\t/g, "\t");

// //   const normalized = decoded
// //     .replace(/\r\n/g, "\n")
// //     .replace(/\u00a0/g, " ")
// //     .replace(/[ \t]+/g, " ")
// //     .replace(/ *\n */g, "\n")
// //     .trim();

// //   const parts = normalized
// //     .split(/(?<=[.!?])\s+(?=[^)\]"'”’\s])/g)
// //     .map((s) => s.trim())
// //     .filter(Boolean);

// //   return parts.length ? parts : [normalized];
// // }

// // export function LeftPanel({
// //   step,
// //   emotionThoughtPairs,
// //   userInput,
// //   positiveReframes,
// //   onSetPositiveReframes,
// //   onSelectCognitiveErrors,
// //   onNext,
// // }: LeftPanelProps) {
// //   // 현재 처리 중인 감정-자동사고 쌍 (현재는 1개만)
// //   const currentPair =
// //     emotionThoughtPairs.length > 0 ? emotionThoughtPairs[0] : null;

// //   // 번즈식 공감법 결과
// //   const [burnsEmpathy, setBurnsEmpathy] = useState<BurnsEmpathyShape | null>(
// //     null
// //   );
// //   const [empathyLoading, setEmpathyLoading] = useState(false);
// //   const [empathyError, setEmpathyError] = useState<string | null>(null);

// //   // 목표 감정 강도
// //   const [targetIntensity, setTargetIntensity] = useState(30);
// //   const [intensitySet, setIntensitySet] = useState(false);
// //   const [showIntensityModal, setShowIntensityModal] = useState(false);

// //   // 인지오류 분석 결과
// //   const [cognitiveErrors, setCognitiveErrors] =
// //     useState<CognitiveErrorAnalysisResult | null>(null);
// //   const [errorsLoading, setErrorsLoading] = useState(false);
// //   const [errorsError, setErrorsError] = useState<string | null>(null);

// //   // 인지오류 선택 (10개 중 2개 직접 선택)
// //   const [selectedErrors2, setSelectedErrors2] = useState<number[]>([]);

// //   /**
// //    * ✅ "현재 페어"가 바뀌면 기존 결과를 리셋
// //    */
// //   const pairKey = useMemo(() => {
// //     if (!currentPair) return "";
// //     return `${currentPair.emotion}::${currentPair.thought}::${currentPair.intensity}`;
// //   }, [currentPair]);

// //   const lastPairKeyRef = useRef<string>("");

// //   useEffect(() => {
// //     if (!pairKey) return;

// //     if (lastPairKeyRef.current && lastPairKeyRef.current !== pairKey) {
// //       // 페어가 바뀌었다면 전체 리셋
// //       setBurnsEmpathy(null);
// //       setEmpathyError(null);
// //       setEmpathyLoading(false);

// //       setTargetIntensity(30);
// //       setIntensitySet(false);
// //       setShowIntensityModal(false);

// //       setCognitiveErrors(null);
// //       setErrorsError(null);
// //       setErrorsLoading(false);

// //       setSelectedErrors2([]);
// //     }
// //     lastPairKeyRef.current = pairKey;
// //   }, [pairKey]);

// //   /**
// //    * ✅ Step 3 진입 시:
// //    * - 공감문 생성 API 호출
// //    * - 공감문 생성이 성공하면 인지오류 분석도 "프리페치"로 같이 호출
// //    */
// //   useEffect(() => {
// //     if (step === 3 && currentPair && !burnsEmpathy && !empathyLoading) {
// //       void generateEmpathyAndPrefetchErrors();
// //     }
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [step, currentPair, burnsEmpathy, empathyLoading]);

// //   const generateEmpathyAndPrefetchErrors = async () => {
// //     if (!currentPair) return;

// //     setEmpathyLoading(true);
// //     setEmpathyError(null);

// //     try {
// //       const result = await generateBurnsEmpathy(
// //         userInput,
// //         currentPair.emotion,
// //         currentPair.thought,
// //         currentPair.intensity
// //       );
// //       setBurnsEmpathy(result);

// //       // 목표 강도 초기화 (현재 강도의 60%로 설정)
// //       setTargetIntensity(Math.round(currentPair.intensity * 0.6));

// //       // ✅ 공감문이 뜬 직후, 인지오류도 미리 분석 시작 (모달 동안 뒤에서 돌리기)
// //       if (!cognitiveErrors && !errorsLoading) {
// //         void analyzeErrors();
// //       }
// //     } catch (err) {
// //       setEmpathyError(
// //         err instanceof Error ? err.message : "오류가 발생했습니다."
// //       );
// //     } finally {
// //       setEmpathyLoading(false);
// //     }
// //   };

// //   // ✅ 목표 강도 설정 완료: 이제는 API 호출 없이 "표시 단계"만 전환
// //   const handleIntensitySet = () => {
// //     setIntensitySet(true);
// //     // 프리페치가 이미 돌고 있다는 전제
// //     // (안 돌았으면 아래 안전장치 주석 해제)
// //     // if (!cognitiveErrors && !errorsLoading) void analyzeErrors();
// //   };

// //   // 인지오류 분석 (프리페치/재생성 버튼에서 재사용)
// //   const analyzeErrors = async () => {
// //     if (!currentPair) return;

// //     setErrorsLoading(true);
// //     setErrorsError(null);

// //     try {
// //       const result = await analyzeCognitiveErrors(
// //         userInput,
// //         currentPair.thought
// //       );
// //       setCognitiveErrors(result);
// //     } catch (err) {
// //       setErrorsError(
// //         err instanceof Error ? err.message : "오류가 발생했습니다."
// //       );
// //       console.error("인지오류 분석 오류:", err);
// //     } finally {
// //       setErrorsLoading(false);
// //     }
// //   };

// //   // 인지오류 2개 선택 토글
// //   const toggleError2 = (index: number) => {
// //     if (selectedErrors2.includes(index)) {
// //       setSelectedErrors2(selectedErrors2.filter((i) => i !== index));
// //     } else if (selectedErrors2.length < 2) {
// //       setSelectedErrors2([...selectedErrors2, index]);
// //     }
// //   };

// //   // 최종 2개 선택 완료 → Step 4로
// //   const handleConfirm2Errors = () => {
// //     if (cognitiveErrors) {
// //       const finalErrors = selectedErrors2.map(
// //         (i) => cognitiveErrors.errors[i].title
// //       );
// //       onSelectCognitiveErrors(finalErrors);
// //       onNext();
// //     }
// //   };

// //   return (
// //     <Card className="bg-slate-50/95 backdrop-blur-sm p-6 shadow-2xl border border-slate-200/50 min-h-[600px] flex flex-col text-[15px] leading-6">
// //       <div className="mb-4">
// //         <h2 className="text-slate-800 text-xl">인지오류 검토</h2>
// //         <p className="text-slate-600 text-sm mt-2">
// //           우리가 만약 우리 생각의 오류를 찾을 수 있다면, 굉장히 빠르게 우리의
// //           감정이 달라지는 것을 볼 수 있습니다.
// //         </p>
// //       </div>

// //       <div className="flex-1 space-y-6 overflow-y-auto">
// //         {step < 3 && (
// //           <div className="flex items-center justify-center h-full">
// //             <p className="text-slate-500">
// //               중앙 패널에서 감정과 자동사고를 선택해주세요.
// //             </p>
// //           </div>
// //         )}

// //         {/* Step 3: 번즈식 공감법 + 목표 강도 설정 */}
// //         {step === 3 && currentPair && !intensitySet && (
// //           <div className="space-y-6">
// //             <div className="bg-green-50 p-4 rounded-lg border border-green-200">
// //               <p className="text-green-800 mb-2">
// //                 <strong>{currentPair.emotion}</strong> (강도:{" "}
// //                 {currentPair.intensity})
// //               </p>
// //               <p className="text-slate-700 italic mb-1">
// //                 "{currentPair.thought}"
// //               </p>
// //             </div>

// //             {empathyLoading ? (
// //               <div className="flex flex-col items-center justify-center py-8">
// //                 <Loader2 className="size-8 animate-spin text-green-600 mb-4" />
// //                 <p className="text-slate-600">
// //                   당신의 마음을 헤아리고 있습니다...
// //                 </p>
// //               </div>
// //             ) : empathyError ? (
// //               <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
// //                 <p className="mb-2">{empathyError}</p>
// //                 <Button
// //                   onClick={() => void generateEmpathyAndPrefetchErrors()}
// //                   variant="outline"
// //                   size="sm"
// //                 >
// //                   다시 시도
// //                 </Button>
// //               </div>
// //             ) : burnsEmpathy ? (
// //               <>
// //                 <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300 space-y-2">
// //                   <p className="text-slate-800 leading-relaxed text-sm">
// //                     {burnsEmpathy.thoughtEmpathy}
// //                   </p>
// //                   <p className="text-slate-800 leading-relaxed text-sm">
// //                     {burnsEmpathy.emotionEmpathy}
// //                   </p>
// //                   <p className="text-slate-800 leading-relaxed text-sm">
// //                     {burnsEmpathy.iStatement}
// //                   </p>

// //                   <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
// //                     <p className="text-blue-900 text-sm mb-1">
// //                       💝 제가 발견한 당신의 모습
// //                     </p>
// //                     <p className="text-blue-800 text-sm leading-relaxed">
// //                       {burnsEmpathy.soothing ?? ""}
// //                     </p>
// //                   </div>
// //                 </div>

// //                 <Button
// //                   onClick={() => setShowIntensityModal(true)}
// //                   className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-5 text-base shadow-lg"
// //                 >
// //                   💭 감정 강도 조절하기
// //                 </Button>
// //               </>
// //             ) : null}
// //           </div>
// //         )}

// //         {/* Step 3: 인지오류 10개 중 2개 선택 */}
// //         {step === 3 && intensitySet && (
// //           <div className="space-y-4">
// //             <div className="bg-green-50 p-3 rounded-lg border border-green-200">
// //               <p className="text-green-800 text-sm mb-1">
// //                 <strong>{currentPair?.emotion}</strong> (현재:{" "}
// //                 {currentPair?.intensity} → 목표: {targetIntensity})
// //               </p>
// //               <p className="text-slate-700 text-sm">
// //                 이 생각에 담긴 인지오류를 찾아봅시다.{" "}
// //                 <strong>2가지를 선택</strong>해주세요.
// //               </p>
// //             </div>

// //             {errorsLoading ? (
// //               <div className="flex flex-col items-center justify-center py-8">
// //                 <Loader2 className="size-8 animate-spin text-green-600 mb-4" />
// //                 <p className="text-slate-600">
// //                   인지오류를 분석하고 있습니다...
// //                 </p>
// //               </div>
// //             ) : errorsError ? (
// //               <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
// //                 <p className="mb-2">{errorsError}</p>
// //                 <Button
// //                   onClick={() => void analyzeErrors()}
// //                   variant="outline"
// //                   size="sm"
// //                 >
// //                   다시 시도
// //                 </Button>
// //               </div>
// //             ) : cognitiveErrors ? (
// //               <>
// //                 <div className="space-y-3 max-h-[350px] overflow-y-auto">
// //                   {cognitiveErrors.errors.map((error, index) => (
// //                     <button
// //                       key={index}
// //                       onClick={() => toggleError2(index)}
// //                       className={`w-full text-left p-4 rounded-lg border-2 transition-all relative ${
// //                         selectedErrors2.includes(index)
// //                           ? "border-green-600 bg-green-50"
// //                           : "border-slate-200 hover:border-green-300 bg-white"
// //                       }`}
// //                     >
// //                       <div className="flex items-start gap-3">
// //                         <span
// //                           className={`flex-shrink-0 w-6 h-6 rounded-full text-white flex items-center justify-center text-sm ${
// //                             selectedErrors2.includes(index)
// //                               ? "bg-green-600"
// //                               : "bg-slate-400"
// //                           }`}
// //                         >
// //                           {index + 1}
// //                         </span>

// //                         <div className="flex-1">
// //                           <p className="text-slate-800 mb-1">{error.title}</p>
// //                           <p className="text-slate-500 text-sm mb-2">
// //                             {error.description}
// //                           </p>
// //                           <br />
// //                           {/* 사용자 원본 글 인용 */}
// //                           <div className="bg-blue-50 border-l-4 border-blue-400 p-2 rounded mb-2">
// //                             <p className="text-xs text-blue-600 mb-1">
// //                               📝 당신이 쓴 글
// //                             </p>
// //                             <p className="text-sm text-blue-900 italic whitespace-pre-line">
// //                               "{error.userQuote}"
// //                             </p>
// //                           </div>
// //                           <br />
// //                           {/* 구체적 분석 (문장 단위 개행) */}
// //                           <div className="text-base text-amber-950 leading-7">
// //                             <p className="text-xs text-amber-600 mb-1">
// //                               🔍 분석
// //                             </p>

// //                             <div className="text-base text-amber-950 leading-7 space-y-2">
// //                               {splitToSentences(error.analysis).map(
// //                                 (line, idx) => (
// //                                   <p key={idx} className="whitespace-pre-line">
// //                                     {line}
// //                                   </p>
// //                                 )
// //                               )}
// //                             </div>
// //                           </div>
// //                         </div>

// //                         {selectedErrors2.includes(index) && (
// //                           <Check className="size-5 text-green-600 flex-shrink-0" />
// //                         )}
// //                       </div>
// //                     </button>
// //                   ))}
// //                 </div>

// //                 {selectedErrors2.length > 0 && (
// //                   <div className="bg-green-50 p-3 rounded-lg text-center text-green-800">
// //                     {selectedErrors2.length} / 2개 선택됨
// //                   </div>
// //                 )}

// //                 <Button
// //                   onClick={() => {
// //                     setSelectedErrors2([]);
// //                     void analyzeErrors();
// //                   }}
// //                   variant="outline"
// //                   className="w-full gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
// //                 >
// //                   <RefreshCw className="size-4" />
// //                   여기에 없습니다. (다른 인지오류 분석)
// //                 </Button>

// //                 <Button
// //                   onClick={handleConfirm2Errors}
// //                   disabled={selectedErrors2.length !== 2}
// //                   className="w-full bg-green-600 hover:bg-green-700"
// //                 >
// //                   인지오류 검토 완료 → 대안사고 구성
// //                 </Button>
// //               </>
// //             ) : (
// //               <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 text-slate-700">
// //                 <p className="text-sm mb-3">
// //                   인지오류 분석 결과가 아직 없습니다. 아래 버튼으로 분석을
// //                   시작할 수 있습니다.
// //                 </p>
// //                 <Button onClick={() => void analyzeErrors()} className="w-full">
// //                   인지오류 분석 시작
// //                 </Button>
// //               </div>
// //             )}
// //           </div>
// //         )}

// //         {/* Step 4 이상: 완료 */}
// //         {step >= 4 && (
// //           <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
// //             <p className="text-green-800 mb-2">✓ 인지오류 검토 완료</p>
// //             <p className="text-emerald-600">
// //               → 우측 패널에서 대안사고를 구성해주세요.
// //             </p>ve
// //           </div>
// //         )}
// //       </div>

// //       {/* 감정 강도 모달 */}
// //       {currentPair && (
// //         <EmotionIntensityModal
// //           open={showIntensityModal}
// //           emotion={currentPair.emotion}
// //           currentIntensity={currentPair.intensity}
// //           targetIntensity={targetIntensity}
// //           onTargetIntensityChange={setTargetIntensity}
// //           onConfirm={() => {
// //             setShowIntensityModal(false);
// //             handleIntensitySet();
// //           }}
// //           onCancel={() => setShowIntensityModal(false)}
// //         />
// //       )}
// //     </Card>
// //   );
// // }

// // src/components/left/LeftPanel.tsx
// import { Check, Loader2, RefreshCw } from "lucide-react";
// import { useEffect, useMemo, useRef, useState } from "react";
// import {
//   analyzeCognitiveErrors,
//   CognitiveErrorAnalysisResult,
//   generateBurnsEmpathy,
// } from "../../lib/ai";
// import type { EmotionThoughtPair } from "../../types";
// import { CbtMode } from "../header/ModePicker";
// import { Button } from "../ui/button";
// import { Card } from "../ui/card";
// import { EmotionIntensityModal } from "./EmotionIntensityModal";

// interface LeftPanelProps {
//   step: number;
//   emotionThoughtPairs: EmotionThoughtPair[];
//   userInput: string;
//   positiveReframes: { [emotion: string]: string };
//   onSetPositiveReframes: (reframes: { [emotion: string]: string }) => void;
//   onSelectCognitiveErrors: (errors: string[]) => void;
//   onNext: () => void;
//   mode: CbtMode;
// }

// type BurnsEmpathyShape = {
//   thoughtEmpathy: string;
//   emotionEmpathy: string;
//   iStatement: string;
//   question: string;
//   soothing: string;
// };

// function splitToSentences(text: string): string[] {
//   if (!text) return [];

//   const decoded = text
//     .replace(/\\r\\n/g, "\n")
//     .replace(/\\n/g, "\n")
//     .replace(/\\t/g, "\t");

//   const normalized = decoded
//     .replace(/\r\n/g, "\n")
//     .replace(/\u00a0/g, " ")
//     .replace(/[ \t]+/g, " ")
//     .replace(/ *\n */g, "\n")
//     .trim();

//   const parts = normalized
//     .split(/(?<=[.!?])\s+(?=[^)\]"'”’\s])/g)
//     .map((s) => s.trim())
//     .filter(Boolean);

//   return parts.length ? parts : [normalized];
// }

// export function LeftPanel({
//   step,
//   emotionThoughtPairs,
//   userInput,
//   positiveReframes,
//   onSetPositiveReframes,
//   onSelectCognitiveErrors,
//   onNext,
//   mode,
// }: LeftPanelProps) {
//   // 현재 처리 중인 감정-자동사고 쌍 (현재는 1개만)
//   const currentPair =
//     emotionThoughtPairs.length > 0 ? emotionThoughtPairs[0] : null;

//   const isLite = mode.detailMode === "lite";

//   // 번즈식 공감법 결과
//   const [burnsEmpathy, setBurnsEmpathy] = useState<BurnsEmpathyShape | null>(
//     null
//   );
//   const [empathyLoading, setEmpathyLoading] = useState(false);
//   const [empathyError, setEmpathyError] = useState<string | null>(null);

//   // 목표 감정 강도
//   const [targetIntensity, setTargetIntensity] = useState(30);
//   const [intensitySet, setIntensitySet] = useState(false);
//   const [showIntensityModal, setShowIntensityModal] = useState(false);

//   // 인지오류 분석 결과
//   const [cognitiveErrors, setCognitiveErrors] =
//     useState<CognitiveErrorAnalysisResult | null>(null);
//   const [errorsLoading, setErrorsLoading] = useState(false);
//   const [errorsError, setErrorsError] = useState<string | null>(null);

//   // 인지오류 선택 (10개 중 2개 직접 선택)
//   const [selectedErrors2, setSelectedErrors2] = useState<number[]>([]);

//   /**
//    * ✅ "현재 페어"가 바뀌면 기존 결과를 리셋
//    */
//   const pairKey = useMemo(() => {
//     if (!currentPair) return "";
//     return `${currentPair.emotion}::${currentPair.thought}::${currentPair.intensity}`;
//   }, [currentPair]);

//   const lastPairKeyRef = useRef<string>("");

//   useEffect(() => {
//     if (!pairKey) return;

//     if (lastPairKeyRef.current && lastPairKeyRef.current !== pairKey) {
//       // 페어가 바뀌었다면 전체 리셋
//       setBurnsEmpathy(null);
//       setEmpathyError(null);
//       setEmpathyLoading(false);

//       setTargetIntensity(30);
//       setIntensitySet(false);
//       setShowIntensityModal(false);

//       setCognitiveErrors(null);
//       setErrorsError(null);
//       setErrorsLoading(false);

//       setSelectedErrors2([]);
//     }
//     lastPairKeyRef.current = pairKey;
//   }, [pairKey]);

//   /**
//    * ✅ Step 3 진입 시:
//    * - 공감문 생성 API 호출
//    * - 공감문 생성이 성공하면 인지오류 분석도 "프리페치"로 같이 호출
//    */
//   useEffect(() => {
//     if (step === 3 && currentPair && !burnsEmpathy && !empathyLoading) {
//       void generateEmpathyAndPrefetchErrors();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [step, currentPair, burnsEmpathy, empathyLoading]);

//   const generateEmpathyAndPrefetchErrors = async () => {
//     if (!currentPair) return;

//     setEmpathyLoading(true);
//     setEmpathyError(null);

//     try {
//       const result = await generateBurnsEmpathy(
//         userInput,
//         currentPair.emotion,
//         currentPair.thought,
//         currentPair.intensity
//       );
//       setBurnsEmpathy(result);

//       // 목표 강도 초기화 (현재 강도의 60%로 설정)
//       setTargetIntensity(Math.round(currentPair.intensity * 0.6));

//       // ✅ 공감문이 뜬 직후, 인지오류도 미리 분석 시작 (모달 동안 뒤에서 돌리기)
//       if (!cognitiveErrors && !errorsLoading) {
//         void analyzeErrors();
//       }

//       // ✅ LITE 모드면 "감정 강도 조절" 단계를 스킵하고 바로 다음 UI로 전환
//       if (isLite) {
//         setShowIntensityModal(false);
//         setIntensitySet(true);
//       }
//     } catch (err) {
//       setEmpathyError(
//         err instanceof Error ? err.message : "오류가 발생했습니다."
//       );
//     } finally {
//       setEmpathyLoading(false);
//     }
//   };

//   // ✅ 목표 강도 설정 완료: 이제는 API 호출 없이 "표시 단계"만 전환
//   const handleIntensitySet = () => {
//     setIntensitySet(true);
//   };

//   // 인지오류 분석 (프리페치/재생성 버튼에서 재사용)
//   const analyzeErrors = async () => {
//     if (!currentPair) return;

//     setErrorsLoading(true);
//     setErrorsError(null);

//     try {
//       const result = await analyzeCognitiveErrors(
//         userInput,
//         currentPair.thought
//       );
//       setCognitiveErrors(result);
//     } catch (err) {
//       setErrorsError(
//         err instanceof Error ? err.message : "오류가 발생했습니다."
//       );
//       console.error("인지오류 분석 오류:", err);
//     } finally {
//       setErrorsLoading(false);
//     }
//   };

//   // 인지오류 2개 선택 토글
//   const toggleError2 = (index: number) => {
//     if (selectedErrors2.includes(index)) {
//       setSelectedErrors2(selectedErrors2.filter((i) => i !== index));
//     } else if (selectedErrors2.length < 2) {
//       setSelectedErrors2([...selectedErrors2, index]);
//     }
//   };

//   // 최종 2개 선택 완료 → Step 4로
//   const handleConfirm2Errors = () => {
//     if (cognitiveErrors) {
//       const finalErrors = selectedErrors2.map(
//         (i) => cognitiveErrors.errors[i].title
//       );
//       onSelectCognitiveErrors(finalErrors);
//       onNext();
//     }
//   };

//   return (
//     <Card className="bg-slate-50/95 backdrop-blur-sm p-6 shadow-2xl border border-slate-200/50 min-h-[600px] flex flex-col text-[15px] leading-6">
//       <div className="mb-4">
//         <h2 className="text-slate-800 text-xl">인지오류 검토</h2>
//         <p className="text-slate-600 text-sm mt-2">
//           우리가 만약 우리 생각의 오류를 찾을 수 있다면, 굉장히 빠르게 우리의
//           감정이 달라지는 것을 볼 수 있습니다.
//         </p>
//       </div>

//       <div className="flex-1 space-y-6 overflow-y-auto">
//         {step < 3 && (
//           <div className="flex items-center justify-center h-full">
//             <p className="text-slate-500">
//               중앙 패널에서 감정과 자동사고를 선택해주세요.
//             </p>
//           </div>
//         )}

//         {/* Step 3: 번즈식 공감법 + 목표 강도 설정 */}
//         {step === 3 && currentPair && !intensitySet && (
//           <div className="space-y-6">
//             <div className="bg-green-50 p-4 rounded-lg border border-green-200">
//               <p className="text-green-800 mb-2">
//                 <strong>{currentPair.emotion}</strong> (강도:{" "}
//                 {currentPair.intensity})
//               </p>
//               <p className="text-slate-700 italic mb-1">
//                 "{currentPair.thought}"
//               </p>
//             </div>

//             {empathyLoading ? (
//               <div className="flex flex-col items-center justify-center py-8">
//                 <Loader2 className="size-8 animate-spin text-green-600 mb-4" />
//                 <p className="text-slate-600">
//                   당신의 마음을 헤아리고 있습니다...
//                 </p>
//               </div>
//             ) : empathyError ? (
//               <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
//                 <p className="mb-2">{empathyError}</p>
//                 <Button
//                   onClick={() => void generateEmpathyAndPrefetchErrors()}
//                   variant="outline"
//                   size="sm"
//                 >
//                   다시 시도
//                 </Button>
//               </div>
//             ) : burnsEmpathy ? (
//               <>
//                 <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300 space-y-2">
//                   <p className="text-slate-800 leading-relaxed text-sm">
//                     {burnsEmpathy.thoughtEmpathy}
//                   </p>
//                   <p className="text-slate-800 leading-relaxed text-sm">
//                     {burnsEmpathy.emotionEmpathy}
//                   </p>
//                   <p className="text-slate-800 leading-relaxed text-sm">
//                     {burnsEmpathy.iStatement}
//                   </p>

//                   <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
//                     <p className="text-blue-900 text-sm mb-1">
//                       💝 제가 발견한 당신의 모습
//                     </p>
//                     <p className="text-blue-800 text-sm leading-relaxed">
//                       {burnsEmpathy.soothing ?? ""}
//                     </p>
//                   </div>
//                 </div>

//                 {/* ✅ deep 모드에서만 모달 버튼 노출 */}
//                 {!isLite && (
//                   <Button
//                     onClick={() => setShowIntensityModal(true)}
//                     className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-5 text-base shadow-lg"
//                   >
//                     💭 감정 강도 조절하기
//                   </Button>
//                 )}

//                 {/* ✅ lite 모드면 즉시 넘어가도록 보조 버튼(선택): UX상 “다음”이 필요하면 켜라 */}
//                 {isLite && (
//                   <Button
//                     onClick={handleIntensitySet}
//                     className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white py-5 text-base shadow-lg"
//                   >
//                     인지오류 선택으로 넘어가기
//                   </Button>
//                 )}
//               </>
//             ) : null}
//           </div>
//         )}

//         {/* Step 3: 인지오류 10개 중 2개 선택 */}
//         {step === 3 && intensitySet && (
//           <div className="space-y-4">
//             <div className="bg-green-50 p-3 rounded-lg border border-green-200">
//               <p className="text-green-800 text-sm mb-1">
//                 <strong>{currentPair?.emotion}</strong> (현재:{" "}
//                 {currentPair?.intensity} → 목표: {targetIntensity})
//               </p>
//               <p className="text-slate-700 text-sm">
//                 이 생각에 담긴 인지오류를 찾아봅시다.{" "}
//                 <strong>2가지를 선택</strong>해주세요.
//               </p>
//             </div>

//             {errorsLoading ? (
//               <div className="flex flex-col items-center justify-center py-8">
//                 <Loader2 className="size-8 animate-spin text-green-600 mb-4" />
//                 <p className="text-slate-600">
//                   인지오류를 분석하고 있습니다...
//                 </p>
//               </div>
//             ) : errorsError ? (
//               <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
//                 <p className="mb-2">{errorsError}</p>
//                 <Button
//                   onClick={() => void analyzeErrors()}
//                   variant="outline"
//                   size="sm"
//                 >
//                   다시 시도
//                 </Button>
//               </div>
//             ) : cognitiveErrors ? (
//               <>
//                 <div className="space-y-3 max-h-[350px] overflow-y-auto">
//                   {cognitiveErrors.errors.map((error, index) => (
//                     <button
//                       key={index}
//                       onClick={() => toggleError2(index)}
//                       className={`w-full text-left p-4 rounded-lg border-2 transition-all relative ${
//                         selectedErrors2.includes(index)
//                           ? "border-green-600 bg-green-50"
//                           : "border-slate-200 hover:border-green-300 bg-white"
//                       }`}
//                     >
//                       <div className="flex items-start gap-3">
//                         <span
//                           className={`flex-shrink-0 w-6 h-6 rounded-full text-white flex items-center justify-center text-sm ${
//                             selectedErrors2.includes(index)
//                               ? "bg-green-600"
//                               : "bg-slate-400"
//                           }`}
//                         >
//                           {index + 1}
//                         </span>

//                         <div className="flex-1">
//                           <p className="text-slate-800 mb-1">{error.title}</p>
//                           <p className="text-slate-500 text-sm mb-2">
//                             {error.description}
//                           </p>
//                           <br />
//                           {/* 사용자 원본 글 인용 */}
//                           <div className="bg-blue-50 border-l-4 border-blue-400 p-2 rounded mb-2">
//                             <p className="text-xs text-blue-600 mb-1">
//                               📝 당신이 쓴 글
//                             </p>
//                             <p className="text-sm text-blue-900 italic whitespace-pre-line">
//                               "{error.userQuote}"
//                             </p>
//                           </div>
//                           <br />
//                           {/* 구체적 분석 (문장 단위 개행) */}
//                           <div className="text-base text-amber-950 leading-7">
//                             <p className="text-xs text-amber-600 mb-1">
//                               🔍 분석
//                             </p>

//                             <div className="text-base text-amber-950 leading-7 space-y-2">
//                               {splitToSentences(error.analysis).map(
//                                 (line, idx) => (
//                                   <p key={idx} className="whitespace-pre-line">
//                                     {line}
//                                   </p>
//                                 )
//                               )}
//                             </div>
//                           </div>
//                         </div>

//                         {selectedErrors2.includes(index) && (
//                           <Check className="size-5 text-green-600 flex-shrink-0" />
//                         )}
//                       </div>
//                     </button>
//                   ))}
//                 </div>

//                 {selectedErrors2.length > 0 && (
//                   <div className="bg-green-50 p-3 rounded-lg text-center text-green-800">
//                     {selectedErrors2.length} / 2개 선택됨
//                   </div>
//                 )}

//                 <Button
//                   onClick={() => {
//                     setSelectedErrors2([]);
//                     void analyzeErrors();
//                   }}
//                   variant="outline"
//                   className="w-full gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
//                 >
//                   <RefreshCw className="size-4" />
//                   여기에 없습니다. (다른 인지오류 분석)
//                 </Button>

//                 <Button
//                   onClick={handleConfirm2Errors}
//                   disabled={selectedErrors2.length !== 2}
//                   className="w-full bg-green-600 hover:bg-green-700"
//                 >
//                   인지오류 검토 완료 → 대안사고 구성
//                 </Button>
//               </>
//             ) : (
//               <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 text-slate-700">
//                 <p className="text-sm mb-3">
//                   인지오류 분석 결과가 아직 없습니다. 아래 버튼으로 분석을
//                   시작할 수 있습니다.
//                 </p>
//                 <Button onClick={() => void analyzeErrors()} className="w-full">
//                   인지오류 분석 시작
//                 </Button>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Step 4 이상: 완료 */}
//         {step >= 4 && (
//           <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
//             <p className="text-green-800 mb-2">✓ 인지오류 검토 완료</p>
//             <p className="text-emerald-600">
//               → 우측 패널에서 대안사고를 구성해주세요.
//             </p>
//           </div>
//         )}
//       </div>

//       {/* 감정 강도 모달 (deep 모드에서만 의미 있음) */}
//       {currentPair && !isLite && (
//         <EmotionIntensityModal
//           open={showIntensityModal}
//           emotion={currentPair.emotion}
//           currentIntensity={currentPair.intensity}
//           targetIntensity={targetIntensity}
//           onTargetIntensityChange={setTargetIntensity}
//           onConfirm={() => {
//             setShowIntensityModal(false);
//             handleIntensitySet();
//           }}
//           onCancel={() => setShowIntensityModal(false)}
//         />
//       )}
//     </Card>
//   );
// }

// src/components/left/LeftPanel.tsx
import { Check, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  analyzeCognitiveErrors,
  CognitiveErrorAnalysisResult,
  generateBurnsEmpathy,
} from "../../lib/ai";
import type { EmotionThoughtPair } from "../../types";
import { CbtMode } from "../header/ModePicker";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { EmotionIntensityModal } from "./EmotionIntensityModal";

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

function splitToSentences(text: string): string[] {
  if (!text) return [];

  const decoded = text
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t");

  const normalized = decoded
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .trim();

  const parts = normalized
    .split(/(?<=[.!?])\s+(?=[^)\]"'”’\s])/g)
    .map((s) => s.trim())
    .filter(Boolean);

  return parts.length ? parts : [normalized];
}

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
  // 현재 처리 중인 감정-자동사고 쌍 (현재는 1개만)
  const currentPair =
    emotionThoughtPairs.length > 0 ? emotionThoughtPairs[0] : null;

  const isLite = mode.detailMode === "lite";

  // 번즈식 공감법 결과
  const [burnsEmpathy, setBurnsEmpathy] = useState<BurnsEmpathyShape | null>(
    null
  );
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

  /**
   * ✅ "현재 페어"가 바뀌면 기존 결과를 리셋
   */
  const pairKey = useMemo(() => {
    if (!currentPair) return "";
    return `${currentPair.emotion}::${currentPair.thought}::${currentPair.intensity}`;
  }, [currentPair]);

  const lastPairKeyRef = useRef<string>("");

  useEffect(() => {
    if (!pairKey) return;

    if (lastPairKeyRef.current && lastPairKeyRef.current !== pairKey) {
      // 페어가 바뀌었다면 전체 리셋
      setBurnsEmpathy(null);
      setEmpathyError(null);
      setEmpathyLoading(false);

      setTargetIntensity(30);
      setIntensitySet(false);
      setShowIntensityModal(false);

      setCognitiveErrors(null);
      setErrorsError(null);
      setErrorsLoading(false);

      setSelectedErrors2([]);
    }
    lastPairKeyRef.current = pairKey;
  }, [pairKey]);

  /**
   * ✅ Step 3 진입 시:
   * - 공감문 생성 API 호출
   * - 공감문 생성이 성공하면 인지오류 분석도 "프리페치"로 같이 호출
   */
  useEffect(() => {
    if (step === 3 && currentPair && !burnsEmpathy && !empathyLoading) {
      void generateEmpathyAndPrefetchErrors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, currentPair, burnsEmpathy, empathyLoading]);

  const generateEmpathyAndPrefetchErrors = async () => {
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

      // ✅ 공감문이 뜬 직후, 인지오류도 미리 분석 시작 (모달 동안 뒤에서 돌리기)
      if (!cognitiveErrors && !errorsLoading) {
        void analyzeErrors();
      }

      // ✅ LITE 모드에서도 "자동으로" 다음 UI로 넘기지 않는다.
      // (공감문 먼저 보여주고, 사용자가 버튼으로 넘어가게)
    } catch (err) {
      setEmpathyError(
        err instanceof Error ? err.message : "오류가 발생했습니다."
      );
    } finally {
      setEmpathyLoading(false);
    }
  };

  // ✅ 목표 강도 설정 완료: 이제는 API 호출 없이 "표시 단계"만 전환
  const handleIntensitySet = () => {
    setIntensitySet(true);
  };

  // 인지오류 분석 (프리페치/재생성 버튼에서 재사용)
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
    <Card className="bg-slate-50/95 backdrop-blur-sm p-6 shadow-2xl border border-slate-200/50 min-h-[600px] flex flex-col text-[15px] leading-6">
      <div className="mb-4">
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
                <strong>{currentPair.emotion}의 문장</strong>
              </p>
              <p className="text-slate-700 italic mb-1">
                "{currentPair.thought}"
              </p>
            </div>

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
                <Button
                  onClick={() => void generateEmpathyAndPrefetchErrors()}
                  variant="outline"
                  size="sm"
                >
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

                {/* ✅ deep 모드: 기존대로 모달 */}
                {!isLite && (
                  <Button
                    onClick={() => setShowIntensityModal(true)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-5 text-base shadow-lg"
                  >
                    💭 감정 강도 조절하기
                  </Button>
                )}

                {/* ✅ lite 모드: 모달은 없고, 공감문을 보여준 뒤 사용자가 넘어감 */}
                {isLite && (
                  <Button
                    onClick={handleIntensitySet}
                    className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white py-5 text-base shadow-lg"
                  >
                    인지오류 선택으로 넘어가기
                  </Button>
                )}

                {/* (선택) lite에서 분석 프리페치 상태를 살짝 보여주고 싶으면:
                    {errorsLoading && <p className="text-xs text-slate-500 text-center">인지오류 분석을 준비 중...</p>}
                */}
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
                <Button
                  onClick={() => void analyzeErrors()}
                  variant="outline"
                  size="sm"
                >
                  다시 시도
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
                          <br />
                          {/* 사용자 원본 글 인용 */}
                          <div className="bg-blue-50 border-l-4 border-blue-400 p-2 rounded mb-2">
                            <p className="text-xs text-blue-600 mb-1">
                              📝 당신이 쓴 글
                            </p>
                            <p className="text-sm text-blue-900 italic whitespace-pre-line">
                              "{error.userQuote}"
                            </p>
                          </div>
                          <br />
                          {/* 구체적 분석 (문장 단위 개행) */}
                          <div className="text-base text-amber-950 leading-7">
                            <p className="text-xs text-amber-600 mb-1">
                              🔍 분석
                            </p>

                            <div className="text-base text-amber-950 leading-7 space-y-2">
                              {splitToSentences(error.analysis).map(
                                (line, idx) => (
                                  <p key={idx} className="whitespace-pre-line">
                                    {line}
                                  </p>
                                )
                              )}
                            </div>
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

                <Button
                  onClick={() => {
                    setSelectedErrors2([]);
                    void analyzeErrors();
                  }}
                  variant="outline"
                  className="w-full gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  <RefreshCw className="size-4" />
                  여기에 없습니다. (다른 인지오류 분석)
                </Button>

                <Button
                  onClick={handleConfirm2Errors}
                  disabled={selectedErrors2.length !== 2}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  인지오류 검토 완료 → 대안사고 구성
                </Button>
              </>
            ) : (
              <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 text-slate-700">
                <p className="text-sm mb-3">
                  인지오류 분석 결과가 아직 없습니다. 아래 버튼으로 분석을
                  시작할 수 있습니다.
                </p>
                <Button onClick={() => void analyzeErrors()} className="w-full">
                  인지오류 분석 시작
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 4 이상: 완료 */}
        {step >= 4 && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <p className="text-green-800 mb-2">✓ 인지오류 검토 완료</p>
            <p className="text-emerald-600">
              → 우측 패널에서 대안사고를 구성해주세요.
            </p>
          </div>
        )}
      </div>

      {/* 감정 강도 모달 (deep 모드에서만) */}
      {currentPair && !isLite && (
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
