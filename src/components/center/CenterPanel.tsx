// src/components/center/CenterPanel.tsx
import {
  Bookmark,
  Check,
  Loader2,
  RefreshCw,
  Shuffle,
  Star,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { generateExtendedAutomaticThoughts } from "../../lib/ai";
import type { EmotionThoughtPair } from "../../types";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { EMOTIONS } from "./constants/emotions";
import { ALL_EXAMPLES } from "./constants/examples";
import { FirstEmotionIntensityModal } from "./FirstEmotionIntensityModal";

interface CenterPanelProps {
  step: number;
  userInput: string;
  emotionThoughtPairs: EmotionThoughtPair[];
  onInputChange: (input: string) => void;
  onSetEmotionThoughtPairs: (pairs: EmotionThoughtPair[]) => void;
  onNext: () => void;
}

interface EmotionData {
  id: string;
  label: string;
  description: string;
  physical: string;
  color: string;
  positive: string[];
  caution: string[];
}

type PrefetchKey = string;

function makePrefetchKey(emotion: string, input: string): PrefetchKey {
  // input이 길어서 부담되면 slice/해시로 바꿔도 됨
  return `${emotion}::${input.trim()}`;
}

export function CenterPanel({
  step,
  userInput,
  emotionThoughtPairs,
  onInputChange,
  onSetEmotionThoughtPairs,
  onNext,
}: CenterPanelProps) {
  // ref for scrolling
  const containerRef = useRef<HTMLDivElement>(null);

  // 랜덤 예시 8개
  const [randomExamples, setRandomExamples] = useState(() => {
    const shuffled = [...ALL_EXAMPLES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 8);
  });

  const refreshExamples = () => {
    const shuffled = [...ALL_EXAMPLES].sort(() => Math.random() - 0.5);
    setRandomExamples(shuffled.slice(0, 8));
  };

  // 현재 선택된 감정
  const [selectedEmotion, setSelectedEmotion] = useState<string>("");
  const [emotionIntensity, setEmotionIntensity] = useState(50);
  const [emotionSet, setEmotionSet] = useState(false);
  const [showIntensityModal, setShowIntensityModal] = useState(false);

  // 감정 상세 뷰 상태
  const [showEmotionDetail, setShowEmotionDetail] = useState(false);
  const [selectedEmotionData, setSelectedEmotionData] =
    useState<EmotionData | null>(null);

  // “확인 체크”
  const [emotionDetailConfirmed, setEmotionDetailConfirmed] = useState(false);

  // AI가 생성한 자동사고
  const [generatedThoughts, setGeneratedThoughts] = useState<string[]>([]);
  const [selectedThoughtIndex, setSelectedThoughtIndex] = useState<
    number | null
  >(null);

  // 사용자 직접 입력 자동사고
  const [customThought, setCustomThought] = useState<string>("");

  // 즐겨찾기
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);

  // 로딩/에러
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * ✅ 프리페치 캐시
   * - “강도 측정 직후” 바로 호출해서 시간을 벌고,
   * - 모달 마지막 Confirm에서는 “프리페치가 있으면 그걸 기다리고 / 없으면 fallback 호출”
   */
  const prefetchPromiseRef = useRef<Promise<void> | null>(null);
  const prefetchKeyRef = useRef<PrefetchKey | null>(null);

  const currentPrefetchKey = useMemo(() => {
    if (!selectedEmotion) return null;
    if (!userInput.trim()) return null;
    return makePrefetchKey(selectedEmotion, userInput);
  }, [selectedEmotion, userInput]);

  // 예시 클릭
  const handleExampleClick = (example: string) => {
    onInputChange(example);
  };

  // 감정 선택 → 상세 화면
  const handleEmotionSelect = (emotionData: EmotionData) => {
    setSelectedEmotionData(emotionData);
    setSelectedEmotion(emotionData.label);

    // 상세 확인 체크 초기화
    setEmotionDetailConfirmed(false);

    // 감정 바뀌면 이전 프리페치 무효화
    prefetchPromiseRef.current = null;
    prefetchKeyRef.current = null;

    setShowEmotionDetail(true);
  };

  // 상세 확인 후 강도 모달로
  const handleSelectThisEmotion = () => {
    if (!selectedEmotionData) return;
    if (!emotionDetailConfirmed) return;

    setShowEmotionDetail(false);
    setShowIntensityModal(true);
  };

  /**
   * ✅ 프리페치 시작: “강도 측정 끝나는 순간”에 호출됨
   * - 같은 key로 이미 돌고 있으면 재사용
   * - 완료되면 generatedThoughts를 미리 채워둠(단, UI 노출은 emotionSet 이후)
   */
  const startPrefetchThoughts = () => {
    if (!selectedEmotion || !userInput.trim()) return;

    const key = makePrefetchKey(selectedEmotion, userInput);

    // 동일 키로 이미 프리페치가 진행 중이면 재사용
    if (prefetchKeyRef.current === key && prefetchPromiseRef.current) return;

    prefetchKeyRef.current = key;
    setLoading(true);
    setError(null);

    const p = (async () => {
      const result = await generateExtendedAutomaticThoughts(
        userInput,
        selectedEmotion
      );

      // ✅ SDT 3개만 사용 (기존 흐름 유지)
      const thoughts = result.sdtThoughts.map((st) => st.thought);

      // key 유지될 때만 반영
      if (prefetchKeyRef.current === key) {
        setGeneratedThoughts(thoughts);
        setSelectedThoughtIndex(null);
        setCustomThought("");
        setShowFavorites(false);
      }
    })()
      .catch((err) => {
        if (prefetchKeyRef.current === key) {
          setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
        }
      })
      .finally(() => {
        if (prefetchKeyRef.current === key) {
          setLoading(false);
        }
      });

    prefetchPromiseRef.current = p;
  };

  /**
   * ✅ 모달 최종 Confirm (줄이고 싶나요 선택까지 끝난 시점)
   * - 프리페치가 있으면 기다림
   * - 없거나 무효면 fallback 호출
   * - 이후 emotionSet=true로 “자동사고 선택 UI” 진입
   */
  const finalizeEmotionAndShowThoughts = async () => {
    if (!selectedEmotion || !userInput.trim()) return;

    const key = makePrefetchKey(selectedEmotion, userInput);

    setEmotionSet(true);
    setError(null);

    // 프리페치가 같은 key로 진행/완료 중이면 기다리기
    if (prefetchKeyRef.current === key && prefetchPromiseRef.current) {
      await prefetchPromiseRef.current;

      // 스크롤
      if (containerRef.current) containerRef.current.scrollTop = 0;
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // fallback: 프리페치가 없거나 무효화된 경우 여기서 호출
    setLoading(true);
    try {
      const result = await generateExtendedAutomaticThoughts(
        userInput,
        selectedEmotion
      );
      const thoughts = result.sdtThoughts.map((st) => st.thought);
      setGeneratedThoughts(thoughts);
      setSelectedThoughtIndex(null);
      setCustomThought("");
      setShowFavorites(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }

    if (containerRef.current) containerRef.current.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 자동사고 선택
  const handleThoughtSelect = (index: number) => {
    setSelectedThoughtIndex(index);
  };

  // 선택 완료 → Step 3로
  const handleComplete = () => {
    if (selectedThoughtIndex === null) return;

    const newPair: EmotionThoughtPair = {
      emotion: selectedEmotion,
      intensity: emotionIntensity,
      thought: generatedThoughts[selectedThoughtIndex],
    };

    onSetEmotionThoughtPairs([...emotionThoughtPairs, newPair]);

    if (containerRef.current) containerRef.current.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "smooth" });

    onNext();
  };

  // 즐겨찾기 불러오기
  const loadFavorites = () => {
    const stored = JSON.parse(
      localStorage.getItem("cbt-thought-favorites") || "[]"
    );
    setFavorites(stored);
    setShowFavorites(true);
  };

  // 자동사고 즐겨찾기 추가
  const addThoughtToFavorites = (
    thought: string,
    emotion: string,
    intensity: number
  ) => {
    const favorites = JSON.parse(
      localStorage.getItem("cbt-thought-favorites") || "[]"
    );

    const exists = favorites.some(
      (f: any) => f.thought === thought && f.emotion === emotion
    );

    if (exists) {
      alert("이미 즐겨찾기에 있습니다.");
      return;
    }

    if (favorites.length >= 20) {
      alert("최대 20개까지 저장할 수 있습니다.");
      return;
    }

    const newFavorite = {
      id: Date.now().toString(),
      thought,
      emotion,
      intensity,
      createdAt: Date.now(),
    };

    favorites.unshift(newFavorite);
    localStorage.setItem("cbt-thought-favorites", JSON.stringify(favorites));
    alert("자동사고가 즐겨찾기에 추가되었습니다!");
  };

  // 즐겨찾기에서 자동사고 불러오기
  const loadFromFavorites = (favorite: any) => {
    setSelectedEmotion(favorite.emotion);
    setEmotionIntensity(favorite.intensity);
    setEmotionSet(true);
    setCustomThought(favorite.thought);
    setSelectedThoughtIndex(999);
    setShowFavorites(false);

    if (containerRef.current) containerRef.current.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 즐겨찾기 삭제
  const removeFromFavorites = (id: string) => {
    const favorites = JSON.parse(
      localStorage.getItem("cbt-thought-favorites") || "[]"
    );
    const filtered = favorites.filter((f: any) => f.id !== id);
    localStorage.setItem("cbt-thought-favorites", JSON.stringify(filtered));
    setFavorites(filtered);
  };

  return (
    <Card className="bg-slate-50/95 backdrop-blur-sm p-6 shadow-2xl border border-slate-200/50 min-h-[600px] flex flex-col">
      <div className="mb-4">
        <h2 className="text-slate-800 text-xl">자동사고 체크</h2>
      </div>

      {/* ✅ 감정 강도 모달
          - Step1(강도 측정) 완료 순간에 onPrefetchThoughts()가 불림
          - 마지막 Confirm에서 onConfirm()이 불리고, 여기서 finalize를 수행 */}
      <FirstEmotionIntensityModal
        open={showIntensityModal}
        emotion={selectedEmotion}
        intensity={emotionIntensity}
        onIntensityChange={setEmotionIntensity}
        onPrefetchThoughts={() => {
          // ✅ 강도 측정 끝나자마자 API 호출 시작
          startPrefetchThoughts();
        }}
        onConfirm={async () => {
          // 모달 닫고, 프리페치가 있으면 기다렸다가 Step2(생성결과)로 전환
          setShowIntensityModal(false);
          await finalizeEmotionAndShowThoughts();
        }}
        onClose={() => setShowIntensityModal(false)}
        isLoading={loading}
      />

      <div className="flex-1 space-y-6 overflow-y-auto" ref={containerRef}>
        {/* Step 1: 사건 기록 */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-900 mb-2 text-lg">
                오늘 당신에게 무슨 일이 있었는지 들려주신다면, 우리는 같이
                감정을 만드는 생각을 다뤄갈 수 있습니다.
              </p>
              <p className="text-slate-700 mb-2 text-base">
                마음이 힘들었던 경험이나 불편했던 상황을 자유롭게 적어주세요.
              </p>
              <p className="text-blue-700 text-base">
                💡 자세한 설명일수록 더욱 효과적입니다.
              </p>
            </div>

            {/* 예시 버튼들 */}
            <div className="space-y-2">
              <p className="text-slate-600 text-base">
                또는 예시를 선택하세요:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {randomExamples.map((example, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <button
                      onClick={() => handleExampleClick(example.text)}
                      className="flex-1 text-left p-3 rounded-lg border border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-all text-sm text-slate-700 leading-relaxed"
                    >
                      <span className="text-lg mr-1">{example.emoji}</span>
                      <span className="text-sm">{example.text}</span>
                    </button>
                    <button
                      onClick={() => {
                        const favorites = JSON.parse(
                          localStorage.getItem("cbt-favorites") || "[]"
                        );
                        const exists = favorites.some(
                          (f: any) => f.text === example.text
                        );

                        if (exists) {
                          alert("이미 즐겨찾기에 있습니다.");
                          return;
                        }

                        if (favorites.length >= 10) {
                          alert("최대 10개까지 저장할 수 있습니다.");
                          return;
                        }

                        const newFavorite = {
                          id: Date.now().toString(),
                          text: example.text,
                          createdAt: Date.now(),
                        };

                        favorites.unshift(newFavorite);
                        localStorage.setItem(
                          "cbt-favorites",
                          JSON.stringify(favorites)
                        );
                        alert("즐겨찾기에 추가되었습니다!");
                      }}
                      className="p-2 rounded-lg border border-yellow-300 hover:border-yellow-500 hover:bg-yellow-50 transition-all text-yellow-600 hover:text-yellow-700 flex-shrink-0"
                      title="즐겨찾기에 추가"
                    >
                      <Star className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={refreshExamples}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-sm text-indigo-700"
              >
                <Shuffle className="size-4" />
                다른 예시 보기
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-700 text-sm">직접 입력:</label>
                <button
                  onClick={() => {
                    if (!userInput.trim()) {
                      alert("먼저 내용을 입력해주세요.");
                      return;
                    }

                    const favorites = JSON.parse(
                      localStorage.getItem("cbt-favorites") || "[]"
                    );
                    const exists = favorites.some(
                      (f: any) => f.text === userInput
                    );

                    if (exists) {
                      alert("이미 즐겨찾기에 있습니다.");
                      return;
                    }

                    if (favorites.length >= 10) {
                      alert("최대 10개까지 저장할 수 있습니다.");
                      return;
                    }

                    const newFavorite = {
                      id: Date.now().toString(),
                      text: userInput,
                      createdAt: Date.now(),
                    };

                    favorites.unshift(newFavorite);
                    localStorage.setItem(
                      "cbt-favorites",
                      JSON.stringify(favorites)
                    );
                    alert("즐겨찾기에 추가되었습니다!");
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-yellow-300 hover:border-yellow-500 hover:bg-yellow-50 transition-all text-yellow-600 hover:text-yellow-700 text-sm"
                  title="즐겨찾기에 추가"
                >
                  <Star className="size-4" />
                  즐겨찾기 추가
                </button>
              </div>
              <Textarea
                value={userInput}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder="여기에 직접 입력하세요..."
                className="min-h-[120px] resize-none"
              />
            </div>

            <Button
              onClick={onNext}
              disabled={!userInput.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              다음: 감정 선택하기
            </Button>

            {/* 면책 조항 */}
            <div className="text-center mt-4">
              <p className="text-slate-400 text-xs">
                이 치료기법은 일반적인 인지행동치료 원리를 기반으로 AI를
                활용하여 생성되었음을 알려드립니다.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: 감정 선택 (목록) */}
        {step === 2 && !emotionSet && !showEmotionDetail && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200">
              <h3 className="text-blue-900 mb-2 text-lg">
                당신이 느낀 감정을 <strong>1가지</strong> 선택해주세요
              </h3>
              <p className="text-slate-700 text-sm mb-1">
                감정을 누르면, 해당 감정의 의미(긍정/주의)를 확인한 뒤 강도
                설정으로 넘어갑니다.
              </p>
              <p className="text-blue-600 text-xs">
                💡 강도 측정이 끝나는 즉시 자동사고를 미리 생성해둡니다.
              </p>
            </div>

            {selectedEmotion && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl text-center text-green-900 border-2 border-green-300 shadow-sm">
                <span className="text-lg">
                  선택된 감정:{" "}
                  <strong className="text-xl">{selectedEmotion}</strong> ✓
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 max-h-[550px] overflow-y-auto pr-2">
              {EMOTIONS.map((emotion) => {
                const isSelected = selectedEmotion === emotion.label;

                return (
                  <button
                    key={emotion.id}
                    onClick={() => handleEmotionSelect(emotion as EmotionData)}
                    className={`text-left p-3 rounded-xl border-2 transition-all hover:shadow-lg hover:scale-[1.02] ${
                      isSelected
                        ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg scale-[1.02]"
                        : emotion.color + " border-2 hover:border-blue-300"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-slate-900 font-semibold">
                          {emotion.label}
                        </h3>
                        {isSelected && (
                          <Check className="size-4 text-blue-600" />
                        )}
                      </div>
                      <p className="text-slate-700 text-xs leading-relaxed">
                        {emotion.description}
                      </p>
                      <p className="text-slate-500 text-xs">
                        💭 {emotion.physical}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: 감정 상세 */}
        {step === 2 &&
          !emotionSet &&
          showEmotionDetail &&
          selectedEmotionData && (
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-lg border-2 border-indigo-300">
                <h2 className="text-indigo-900 text-base mb-1">
                  지금 이 순간의 감정 인식하기: {selectedEmotionData.label}
                </h2>
                <p className="text-slate-700 text-xs">
                  {selectedEmotionData.description}
                </p>
                <p className="text-slate-600 text-xs mt-1">
                  💭 {selectedEmotionData.physical}
                </p>
              </div>

              {/* 긍정적 측면 */}
              <div className="rounded-lg border border-green-300 bg-green-50 p-3">
                <h3 className="text-green-900 text-sm font-semibold">
                  ✨ 그러나 {selectedEmotionData.label}의 긍정적인 측면도
                  있습니다.
                </h3>
                <ul className="mt-2 space-y-2 list-disc pl-5">
                  {selectedEmotionData.positive.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-slate-700 text-sm leading-relaxed"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 주의할 점 (✅ caution 사용) */}
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
                <h3 className="text-amber-900 text-sm font-semibold">
                  ⚠️ {selectedEmotionData.label}의 주의할 점
                </h3>
                <ul className="mt-2 space-y-2 list-disc pl-5">
                  {selectedEmotionData.caution.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-slate-700 text-sm leading-relaxed"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 확인 체크 */}
              <div
                className={`rounded-lg border-2 p-3 transition-all ${
                  emotionDetailConfirmed
                    ? "bg-green-50 border-green-300"
                    : "bg-slate-50 border-slate-300"
                }`}
              >
                <label className="flex items-center justify-between cursor-pointer select-none">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={emotionDetailConfirmed}
                      onChange={(e) =>
                        setEmotionDetailConfirmed(e.target.checked)
                      }
                      className="h-4 w-4 accent-green-600"
                    />
                    <span
                      className={`text-sm ${
                        emotionDetailConfirmed
                          ? "text-green-900"
                          : "text-slate-700"
                      }`}
                    >
                      위 내용을 확인했습니다
                    </span>
                  </span>

                  <span className="text-xs text-slate-500">
                    {emotionDetailConfirmed ? "확인됨" : "체크 필요"}
                  </span>
                </label>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowEmotionDetail(false);
                    setSelectedEmotionData(null);
                    setEmotionDetailConfirmed(false);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  다른 감정 보기
                </Button>
                <Button
                  onClick={handleSelectThisEmotion}
                  disabled={!emotionDetailConfirmed}
                  className={`flex-1 ${
                    emotionDetailConfirmed
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "bg-slate-300 cursor-not-allowed"
                  }`}
                >
                  이 감정 다루기
                </Button>
              </div>

              {!emotionDetailConfirmed && (
                <p className="text-center text-slate-500 text-xs">
                  💡 긍정적 의미/주의할 점을 확인하셨다면 체크 후 진행할 수
                  있어요.
                </p>
              )}
            </div>
          )}

        {/* Step 2: AI가 자동사고 생성 → 사용자가 1개 선택 */}
        {step === 2 && emotionSet && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-blue-900 mb-2">
                <strong>{selectedEmotion}</strong> (강도: {emotionIntensity})
              </p>
              <p className="text-slate-700">
                이 감정 뒤에 숨어있을 수 있는 생각들입니다.{" "}
                <strong>가장 잘 맞는 것을 1개 골라주세요.</strong>
                <br />
                만약 없으면 <strong>다시 만들기</strong>를 누르시거나{" "}
                <strong>직접 적어주세요.</strong>
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="size-8 animate-spin text-blue-600 mb-4" />
                <p className="text-slate-600">
                  당신의 마음을 분석하고 있습니다...
                </p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
                <p className="mb-2">{error}</p>
                <Button
                  onClick={() => {
                    // 다시 만들기: 캐시 리셋 후 새로 프리페치/호출
                    prefetchPromiseRef.current = null;
                    prefetchKeyRef.current = null;
                    startPrefetchThoughts();
                  }}
                  variant="outline"
                  size="sm"
                >
                  다시 시도
                </Button>
              </div>
            ) : generatedThoughts.length > 0 ? (
              <>
                {/* 재생성 버튼 */}
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      prefetchPromiseRef.current = null;
                      prefetchKeyRef.current = null;
                      startPrefetchThoughts();
                    }}
                    variant="outline"
                    size="sm"
                    className="gap-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                    title={
                      currentPrefetchKey
                        ? `key: ${currentPrefetchKey}`
                        : undefined
                    }
                  >
                    <RefreshCw className="size-4" />
                    다시 만들기
                  </Button>
                </div>

                {/* 즐겨찾기 목록 보기 */}
                {!showFavorites ? (
                  <Button
                    onClick={loadFavorites}
                    variant="outline"
                    className="w-full gap-2 border-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                  >
                    <Bookmark className="size-4" />
                    저장한 자동사고 불러오기
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-yellow-50 p-3 rounded-lg border border-yellow-300">
                      <h3 className="text-yellow-900 font-semibold">
                        저장한 자동사고 목록
                      </h3>
                      <Button
                        onClick={() => setShowFavorites(false)}
                        variant="ghost"
                        size="sm"
                        className="text-yellow-700"
                      >
                        닫기
                      </Button>
                    </div>

                    {favorites.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <Bookmark className="size-12 mx-auto mb-2 opacity-30" />
                        <p>저장된 자동사고가 없습니다.</p>
                        <p className="text-sm mt-1">
                          마음에 드는 자동사고를 저장해보세요.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {favorites.map((fav: any) => (
                          <div
                            key={fav.id}
                            className="bg-white p-3 rounded-lg border-2 border-yellow-200 hover:border-yellow-400 transition-all"
                          >
                            <div className="flex items-start gap-2 mb-2">
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {fav.emotion} (강도: {fav.intensity})
                              </span>
                              <span className="text-xs text-slate-400">
                                {new Date(fav.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-slate-700 text-sm mb-3">
                              {fav.thought}
                            </p>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => loadFromFavorites(fav)}
                                size="sm"
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                              >
                                이 생각으로 진행하기
                              </Button>
                              <Button
                                onClick={() => removeFromFavorites(fav.id)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:bg-red-50"
                              >
                                삭제
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 자동사고 리스트 */}
                <div className="space-y-3">
                  {generatedThoughts.map((thought, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <button
                        onClick={() => handleThoughtSelect(index)}
                        className={`flex-1 text-left p-4 rounded-lg border-2 transition-all relative ${
                          selectedThoughtIndex === index
                            ? "border-blue-600 bg-blue-50"
                            : "border-slate-200 hover:border-blue-300 bg-white"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`flex-shrink-0 w-6 h-6 rounded-full text-white flex items-center justify-center text-sm ${
                              selectedThoughtIndex === index
                                ? "bg-blue-600"
                                : "bg-slate-400"
                            }`}
                          >
                            {index + 1}
                          </span>
                          <p className="text-slate-800 flex-1">{thought}</p>
                          {selectedThoughtIndex === index && (
                            <Check className="size-5 text-blue-600 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                      <button
                        onClick={() =>
                          addThoughtToFavorites(
                            thought,
                            selectedEmotion,
                            emotionIntensity
                          )
                        }
                        className="p-3 rounded-lg border-2 border-yellow-300 hover:border-yellow-500 hover:bg-yellow-50 transition-all text-yellow-600 hover:text-yellow-700 flex-shrink-0"
                        title="즐겨찾기에 추가"
                      >
                        <Bookmark className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* 직접 입력 칸 */}
                <div className="border-t-2 border-slate-300 pt-4">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200 mb-3">
                    <p className="text-indigo-900 mb-2">
                      ✍️ 또는 당신의 생각을 직접 적어보세요
                    </p>
                    <p className="text-slate-600 text-sm">
                      제안한 생각 중에 딱 맞는 것이 없다면, 당신의 진짜 생각을
                      그대로 적어주세요.
                    </p>
                  </div>
                  <Textarea
                    value={customThought}
                    onChange={(e) => {
                      setCustomThought(e.target.value);
                      if (
                        e.target.value &&
                        selectedThoughtIndex !== null &&
                        selectedThoughtIndex !== 999
                      ) {
                        setSelectedThoughtIndex(null);
                      }
                    }}
                    placeholder="예: 나는 이렇게 하면 안 된다고 생각해..."
                    className="min-h-[80px] resize-none"
                  />
                  {customThought.trim() && (
                    <Button
                      onClick={() => setSelectedThoughtIndex(999)}
                      className={`w-full mt-3 ${
                        selectedThoughtIndex === 999
                          ? "bg-purple-600 hover:bg-purple-700"
                          : "bg-indigo-600 hover:bg-indigo-700"
                      }`}
                    >
                      {selectedThoughtIndex === 999 && (
                        <Check className="size-4 mr-2" />
                      )}
                      이 생각 선택하기
                    </Button>
                  )}
                </div>

                <Button
                  onClick={() => {
                    if (selectedThoughtIndex === 999 && customThought.trim()) {
                      const newPair: EmotionThoughtPair = {
                        emotion: selectedEmotion,
                        intensity: emotionIntensity,
                        thought: customThought.trim(),
                      };
                      onSetEmotionThoughtPairs([
                        ...emotionThoughtPairs,
                        newPair,
                      ]);
                      onNext();
                    } else {
                      handleComplete();
                    }
                  }}
                  disabled={selectedThoughtIndex === null}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  선택 완료 → 인지오류 검토로 이동
                </Button>
              </>
            ) : null}
          </div>
        )}

        {/* Step 3 이상: 완료 */}
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
                    <strong>{pair.emotion}</strong> (강도: {pair.intensity})
                  </p>
                  <p className="text-xs text-slate-600">"{pair.thought}"</p>
                </div>
              ))}
            </div>
            <p className="text-emerald-600 mt-3 text-base">
              → 좌측 패널에서 인지오류를 검토해주세요.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
