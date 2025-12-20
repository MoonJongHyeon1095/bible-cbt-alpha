// src/components/CBTSessionPage.tsx
import {
  ChevronLeft,
  ChevronRight,
  History,
  Mail,
  RotateCcw,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { EmotionThoughtPair } from "../types";
import { CenterPanel } from "./center/CenterPanel";
import { EmailModal } from "./EmailModal";
import { FavoritesModal } from "./FavoritesModal";
import { HistoryModal } from "./HistoryModal";
import { LeftPanel } from "./left/LeftPanel";
import { RecommendModal } from "./RecommendModal";
import { RightPanel } from "./RightPanel";
import { Button } from "./ui/button";

export function CBTSessionPage() {
  const [step, setStep] = useState<number>(1);
  const [userInput, setUserInput] = useState<string>("");

  const [emotionThoughtPairs, setEmotionThoughtPairs] = useState<
    EmotionThoughtPair[]
  >([]);
  const [selectedCognitiveErrors, setSelectedCognitiveErrors] = useState<
    string[]
  >([]);
  const [selectedAlternativeThought, setSelectedAlternativeThought] =
    useState<string>("");
  const [positiveReframes, setPositiveReframes] = useState<{
    [emotion: string]: string;
  }>({});

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showRecommendModal, setShowRecommendModal] = useState(false);

  const [recommendCount, setRecommendCount] = useState(0);
  const [hasRecommended, setHasRecommended] = useState(false);

  // 음성 입력에서 가져온 텍스트 확인
  useEffect(() => {
    const voiceText = localStorage.getItem("voice_input_text");
    if (voiceText) {
      setUserInput(voiceText);
      localStorage.removeItem("voice_input_text");
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("cbt-recommendations");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRecommendCount(parsed.length);
      } catch (e) {
        console.error("추천 카운트 로드 실패:", e);
      }
    }

    const hasRec = localStorage.getItem("cbt-has-recommended") === "true";
    setHasRecommended(hasRec);
  }, [showRecommendModal]);

  const handleRecommend = () => {
    const url = window.location.href;

    if (hasRecommended) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          alert("링크가 클립보드에 복사되었습니다!");
        })
        .catch(() => {
          alert("링크를 수동으로 복사해주세요: " + url);
        });
      return;
    }

    const comment = prompt(
      "이 도구에 대한 짧은 추천 한마디를 남겨주세요! 😊\n(다른 사용자들에게 큰 도움이 됩니다)"
    );

    if (!comment || comment.trim() === "") {
      alert("추천 메시지가 입력되지 않았습니다.");
      return;
    }

    try {
      const recommendation = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        comment: comment.trim(),
      };

      const saved = localStorage.getItem("cbt-recommendations");
      const recommendations = saved ? JSON.parse(saved) : [];
      recommendations.unshift(recommendation);

      localStorage.setItem(
        "cbt-recommendations",
        JSON.stringify(recommendations)
      );
      localStorage.setItem("cbt-has-recommended", "true");
      setHasRecommended(true);
      setRecommendCount(recommendations.length);

      navigator.clipboard
        .writeText(url)
        .then(() => {
          alert(
            "추천해주셔서 감사합니다! 링크가 클립보드에 복사되었습니다. 😊"
          );
        })
        .catch(() => {
          alert(
            "추천해주셔서 감사합니다! 링크를 수동으로 복사해주세요: " + url
          );
        });
    } catch (e) {
      console.error("추천 저장 실패:", e);
      alert("추천 저장 중 오류가 발생했습니다.");
    }
  };

  const handleNext = () => {
    if (step < 6) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const resetAll = () => {
    setStep(1);
    setUserInput("");
    setEmotionThoughtPairs([]);
    setSelectedCognitiveErrors([]);
    setSelectedAlternativeThought("");
    setPositiveReframes({});
  };

  const restartWithSameInput = () => {
    setStep(2);
    setEmotionThoughtPairs([]);
    setSelectedCognitiveErrors([]);
    setSelectedAlternativeThought("");
    setPositiveReframes({});
  };

  return (
    <div className="max-w-[1800px] mx-auto px-8 py-8">
      {/* Header */}
      <header className="text-center mb-8">
        <h2 className="text-2xl text-slate-900 mb-2">
          간단히 실험해보세요, 정말 기분이 바뀌는지.
        </h2>

        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl px-6 py-3 shadow-lg">
            <p className="text-purple-900 text-sm mb-1">
              ✨ 이 도구를 추천하시나요?
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={handleRecommend}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg shadow-md transition-all hover:scale-105 text-sm"
              >
                👍 추천합니다!
              </button>
              <button
                onClick={() => {
                  setShowRecommendModal(true);
                  // 모달 닫힌 후 댓글 섹션으로 스크롤
                  setTimeout(() => {
                    window.scrollTo({
                      top: document.body.scrollHeight,
                      behavior: "smooth",
                    });
                  }, 300);
                }}
                className="bg-white rounded-lg px-4 py-2 border-2 border-purple-400 shadow-md hover:bg-purple-50 transition-colors cursor-pointer"
              >
                <div className="text-center">
                  <span className="text-purple-700 text-xs block">
                    추천 수:
                  </span>
                  <span className="text-purple-900 text-xl">
                    {recommendCount}
                  </span>
                  <span className="text-purple-600 text-xs ml-1">명</span>
                  <div className="text-purple-600 text-xs">리뷰 보기 →</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 네비게이션 */}
      <div className="flex justify-between items-center mb-6">
        <Button
          onClick={handlePrevious}
          disabled={step === 1}
          variant="outline"
          size="sm"
          className="gap-2 disabled:opacity-30"
        >
          <ChevronLeft className="size-4" />
          이전
        </Button>
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full px-8 py-2 shadow-lg">
          <span className="text-white text-sm">
            단계 <span className="text-lg">{step}</span> / 6
          </span>
        </div>
        <Button
          onClick={handleNext}
          disabled={step === 6}
          variant="outline"
          size="sm"
          className="gap-2 disabled:opacity-30"
        >
          다음
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* 동적 레이아웃 */}
      <div className="mb-8">
        {(step === 1 || step === 2) && (
          <div className="grid grid-cols-[300px_1fr_300px] gap-6">
            <div className="opacity-30">
              <LeftPanel
                step={step}
                emotionThoughtPairs={emotionThoughtPairs}
                userInput={userInput}
                positiveReframes={positiveReframes}
                onSetPositiveReframes={setPositiveReframes}
                onSelectCognitiveErrors={setSelectedCognitiveErrors}
                onNext={handleNext}
              />
            </div>
            <div>
              <CenterPanel
                key={`center-${step}`}
                step={step}
                userInput={userInput}
                emotionThoughtPairs={emotionThoughtPairs}
                onInputChange={setUserInput}
                onSetEmotionThoughtPairs={setEmotionThoughtPairs}
                onNext={handleNext}
              />
            </div>
            <div className="opacity-30">
              <RightPanel
                step={step}
                emotionThoughtPairs={emotionThoughtPairs}
                userInput={userInput}
                positiveReframes={positiveReframes}
                selectedCognitiveErrors={selectedCognitiveErrors}
                selectedAlternativeThought={selectedAlternativeThought}
                onSetSelectedAlternativeThought={setSelectedAlternativeThought}
                onComplete={resetAll}
                onRestartWithSameInput={restartWithSameInput}
                onNext={handleNext}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-[1fr_300px_300px] gap-6">
            <div>
              <LeftPanel
                step={step}
                emotionThoughtPairs={emotionThoughtPairs}
                userInput={userInput}
                positiveReframes={positiveReframes}
                onSetPositiveReframes={setPositiveReframes}
                onSelectCognitiveErrors={setSelectedCognitiveErrors}
                onNext={handleNext}
              />
            </div>
            <div className="opacity-30">
              <CenterPanel
                key={`center-${step}`}
                step={step}
                userInput={userInput}
                emotionThoughtPairs={emotionThoughtPairs}
                onInputChange={setUserInput}
                onSetEmotionThoughtPairs={setEmotionThoughtPairs}
                onNext={handleNext}
              />
            </div>
            <div className="opacity-30">
              <RightPanel
                step={step}
                emotionThoughtPairs={emotionThoughtPairs}
                userInput={userInput}
                positiveReframes={positiveReframes}
                selectedCognitiveErrors={selectedCognitiveErrors}
                selectedAlternativeThought={selectedAlternativeThought}
                onSetSelectedAlternativeThought={setSelectedAlternativeThought}
                onComplete={resetAll}
                onNext={handleNext}
              />
            </div>
          </div>
        )}

        {step >= 4 && (
          <div className="grid grid-cols-[300px_300px_1fr] gap-6">
            <div className="opacity-30">
              <LeftPanel
                step={step}
                emotionThoughtPairs={emotionThoughtPairs}
                userInput={userInput}
                positiveReframes={positiveReframes}
                onSetPositiveReframes={setPositiveReframes}
                onSelectCognitiveErrors={setSelectedCognitiveErrors}
                onNext={handleNext}
              />
            </div>
            <div className="opacity-30">
              <CenterPanel
                key={`center-${step}`}
                step={step}
                userInput={userInput}
                emotionThoughtPairs={emotionThoughtPairs}
                onInputChange={setUserInput}
                onSetEmotionThoughtPairs={setEmotionThoughtPairs}
                onNext={handleNext}
              />
            </div>
            <div>
              <RightPanel
                step={step}
                emotionThoughtPairs={emotionThoughtPairs}
                userInput={userInput}
                positiveReframes={positiveReframes}
                selectedCognitiveErrors={selectedCognitiveErrors}
                selectedAlternativeThought={selectedAlternativeThought}
                onSetSelectedAlternativeThought={setSelectedAlternativeThought}
                onComplete={resetAll}
                onRestartWithSameInput={restartWithSameInput}
                onNext={handleNext}
              />
            </div>
          </div>
        )}
      </div>

      {/* 고정 액션 버튼 */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-2 z-50">
        <Button
          onClick={resetAll}
          className="bg-white hover:bg-red-50 border border-red-200 text-red-600 shadow-lg gap-2 px-4 py-4"
          title="처음부터 다시하기"
        >
          <RotateCcw className="size-4" />
          <span className="text-sm">다시하기</span>
        </Button>
        <Button
          onClick={() => setShowHistoryModal(true)}
          className="bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-lg gap-2 px-4 py-4"
          title="이전 기록"
        >
          <History className="size-4" />
          <span className="text-sm">기록</span>
        </Button>
        <Button
          onClick={() => setShowEmailModal(true)}
          className="bg-white hover:bg-purple-50 border border-purple-200 text-purple-600 shadow-lg gap-2 px-4 py-4"
          title="메일"
        >
          <Mail className="size-4" />
          <span className="text-sm">메일</span>
        </Button>
        <Button
          onClick={() => setShowFavoritesModal(true)}
          className="bg-white hover:bg-yellow-50 border border-yellow-200 text-yellow-600 shadow-lg gap-2 px-4 py-4"
          title="즐겨찾기"
        >
          <Star className="size-4" />
          <span className="text-sm">즐겨찾기</span>
        </Button>
      </div>

      {/* 모달들 */}
      <HistoryModal
        open={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />
      <EmailModal
        open={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        sessionData={{
          userInput,
          emotionThoughtPairs,
          selectedCognitiveErrors,
          selectedAlternativeThought,
          positiveReframes,
        }}
      />
      <FavoritesModal
        open={showFavoritesModal}
        onClose={() => setShowFavoritesModal(false)}
        onSelect={(text) => {
          setUserInput(text);
          setStep(1);
        }}
      />
      <RecommendModal
        open={showRecommendModal}
        onClose={() => {
          setShowRecommendModal(false);
          // 모달 닫힐 때 추천 카운트 다시 로드
          const saved = localStorage.getItem("cbt-recommendations");
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              setRecommendCount(parsed.length);
            } catch (e) {
              console.error("추천 카운트 로드 실패:", e);
            }
          }
          const hasRec = localStorage.getItem("cbt-has-recommended") === "true";
          setHasRecommended(hasRec);
        }}
        onRecommend={handleRecommend}
        recommendCount={recommendCount}
        hasRecommended={hasRecommended}
      />
    </div>
  );
}
