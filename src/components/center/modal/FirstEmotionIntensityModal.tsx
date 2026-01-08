// src/components/center/FirstEmotionIntensityModal.tsx
import { ChevronDown, Heart, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../ui/dialog";
import { Slider } from "../../ui/slider";

interface FirstEmotionIntensityModalProps {
  open: boolean;
  emotion: string;
  intensity: number;
  onIntensityChange: (value: number) => void;

  /**
   * ✅ 강도 측정 직후, 자동사고 생성 prefetch를 "딱 1번" 시작
   */
  onPrefetchThoughts?: () => void;

  /**
   * ✅ 마지막 단계 Confirm
   */
  onConfirm: () => void;

  onClose?: () => void;
  isLoading?: boolean;
}

export function FirstEmotionIntensityModal({
  open,
  emotion,
  intensity,
  onIntensityChange,
  onPrefetchThoughts,
  onConfirm,
  onClose,
  isLoading,
}: FirstEmotionIntensityModalProps) {
  // 0: 설명 + 강도 측정, 1: 줄이기 선택
  const [modalStep, setModalStep] = useState(0);
  const [wantsToReduce, setWantsToReduce] = useState<boolean | null>(null);
  const [showIntro, setShowIntro] = useState(false);

  // ✅ 강도 측정 완료 순간에 프리페치를 “딱 1번만” 호출
  const prefetchFiredRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    setModalStep(0);
    setWantsToReduce(null);
    setShowIntro(false);
    prefetchFiredRef.current = false;
  }, [open, emotion]);

  const getIntensityDescription = () => {
    if (intensity === 0) return "감정을 측정해주십시오.";
    if (intensity <= 20) return "약한 정도 - 다소 불편을 느낍니다.";
    if (intensity <= 40) return "조금 느껴지는 정도 - 불편을 느낍니다.";
    if (intensity <= 60) return "중간 정도 - 상당히 불편합니다.";
    if (intensity <= 80) return "상당히 강한 정도 - 매우 고통스럽습니다.";
    return "매우 강렬한 정도 - 극심하게 고통스럽습니다.";
  };

  const handleNext = () => {
    if (modalStep === 0) {
      if (intensity <= 0) return;

      // ✅ 여기서 prefetch 시작
      if (!prefetchFiredRef.current) {
        prefetchFiredRef.current = true;
        onPrefetchThoughts?.();
      }

      setModalStep(1);
      return;
    }

    // step 1 -> confirm
    if (modalStep === 1) {
      if (wantsToReduce === null) return;
      onConfirm();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen: boolean) => {
        if (!nextOpen) onClose?.();
      }}
    >
      <DialogContent
        className="max-w-[98vw] w-[2000px] bg-white border-2 border-pink-200 shadow-2xl max-h-[95vh] overflow-y-auto"
        onPointerDownOutside={(e: { preventDefault: () => any }) =>
          e.preventDefault()
        }
        onEscapeKeyDown={(e: { preventDefault: () => any }) =>
          e.preventDefault()
        }
        aria-describedby="emotion-intensity-description"
      >
        <DialogTitle className="sr-only">감정 강도 측정하기</DialogTitle>
        <DialogDescription
          id="emotion-intensity-description"
          className="sr-only"
        >
          {emotion} 감정의 강도를 0부터 100까지 측정하여 감정을 인식하는 중요한
          과정입니다.
        </DialogDescription>

        <div className="space-y-6 py-4 px-2">
          {/* 헤더 */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full mb-4 animate-pulse">
              <Heart className="size-10 text-white" />
            </div>
            <p className="text-slate-600 text-lg">
              선택한 감정:{" "}
              <strong className="text-pink-600 text-2xl">{emotion}</strong>
            </p>
          </div>

          {/* Step 0: 설명 + 강도 측정 */}
          {modalStep === 0 && (
            <div className="space-y-6">
              <div className="rounded-lg border border-slate-200 bg-white">
                <button
                  type="button"
                  onClick={() => setShowIntro((prev) => !prev)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                  aria-expanded={showIntro}
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex size-7 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      <Sparkles className="size-4" />
                    </span>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-500">
                        감정 인식
                      </p>
                      <h3 className="text-slate-800 text-sm font-semibold">
                        왜 강도를 측정하나요?
                      </h3>
                    </div>
                  </div>
                  <ChevronDown
                    className={`size-4 text-slate-500 transition-transform ${
                      showIntro ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {showIntro && (
                  <div className="border-t border-slate-200 px-4 pb-4 pt-3 space-y-3">
                    <p className="text-slate-700 leading-relaxed">
                      많은 사람들이 부정적인 감정을 느낄 때{" "}
                      <strong>"그냥 기분이 안 좋아"</strong>라고만 생각합니다.
                      하지만 심리학 연구에 따르면,{" "}
                      <strong className="text-slate-900">
                        감정을 구체적으로 인식하고 숫자로 표현하는 순간, 뇌의
                        편도체(감정 중추)가 진정되기 시작
                      </strong>
                      합니다.
                    </p>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-slate-800 leading-relaxed text-sm">
                        💡 "{emotion}"의 강도를 측정한다는 것은, 그것을 관찰의
                        대상으로 삼는다는 뜻입니다.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-r from-rose-50 to-pink-50 border-2 border-rose-300 rounded-xl p-8">
                <p className="text-slate-800 text-xl sm:text-2xl mb-6 text-center leading-snug max-w-2xl mx-auto">
                  <strong>지금 이 순간,</strong>{" "}
                  <span className="font-semibold text-slate-900">
                    "{emotion}"
                  </span>
                  <strong>의 강도는 얼마인가요?</strong>
                </p>

                <div className="space-y-6">
                  <div className="text-center">
                    <div className="inline-block bg-white rounded-2xl px-12 py-8 shadow-lg border-2 border-rose-400">
                      <div className="text-7xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                        {intensity}
                      </div>
                      <div className="text-2xl text-slate-600 mt-2">/ 100</div>
                    </div>

                    <div className="mt-4 text-slate-700 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
                      {getIntensityDescription()}
                    </div>
                  </div>

                  <div className="px-4">
                    <Slider
                      value={[intensity]}
                      onValueChange={(values: number[]) =>
                        onIntensityChange(values[0])
                      }
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />

                    <div className="flex justify-between text-xs sm:text-sm text-slate-500 mt-3">
                      <span>0 (전혀 안 느껴짐)</span>
                      <span>50 (중간)</span>
                      <span>100 (최대한 강함)</span>
                    </div>
                  </div>

                  <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-5 text-center">
                    <p className="text-amber-900 text-lg">
                      💡 <strong>정답은 없습니다.</strong> 지금 이 순간 당신이
                      느끼는 그대로를 표현해주세요.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleNext}
                disabled={intensity === 0}
                className="w-full py-7 text-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white disabled:opacity-40"
              >
                {intensity === 0
                  ? "강도를 선택해주세요"
                  : `${emotion} ${intensity}점으로 계속하기 →`}
              </Button>
            </div>
          )}

          {/* Step 1 */}
          {modalStep === 1 && (
            <div className="space-y-6">
              <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-6">
                <h3 className="text-slate-900 text-xl font-semibold mb-2">
                  마지막으로 한 가지 더 물어볼게요.
                </h3>
                <p className="text-slate-700 text-base">
                  지금 느끼는 <strong>{emotion}</strong>을(를) 조금이라도 줄이고
                  싶나요?
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setWantsToReduce(true)}
                    className={`rounded-lg border-2 p-4 text-left transition-all ${
                      wantsToReduce === true
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-blue-300"
                    }`}
                  >
                    <div className="font-semibold text-slate-900">예</div>
                    <div className="text-sm text-slate-600 mt-1">
                      지금은 조금 가라앉히고 싶어요
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWantsToReduce(false)}
                    className={`rounded-lg border-2 p-4 text-left transition-all ${
                      wantsToReduce === false
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-blue-300"
                    }`}
                  >
                    <div className="font-semibold text-slate-900">아니오</div>
                    <div className="text-sm text-slate-600 mt-1">
                      줄이기보단 이해하고 싶어요
                    </div>
                  </button>
                </div>

                {wantsToReduce === null && (
                  <div className="mt-4 text-sm text-slate-500">
                    선택해야 다음으로 진행할 수 있어요.
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {onClose && (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={onClose}
                  >
                    닫기
                  </Button>
                )}

                <Button
                  onClick={handleNext}
                  disabled={wantsToReduce === null}
                  className="flex-1 py-6 text-lg bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white disabled:opacity-40"
                >
                  확인하고 계속하기 →
                </Button>
              </div>

              <div className="text-center text-sm text-slate-500">
                {isLoading
                  ? "자동사고를 준비 중입니다…"
                  : "준비가 끝나면 바로 자동사고 선택으로 넘어가요."}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
