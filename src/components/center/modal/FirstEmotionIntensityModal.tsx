// src/components/center/FirstEmotionIntensityModal.tsx
import { Check, ChevronDown, Heart, Sparkles } from "lucide-react";
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
        className="!w-[720px] !min-w-[720px] !max-w-none bg-white border-2 border-pink-200 shadow-2xl rounded-2xl max-h-[95vh] overflow-y-auto p-0"
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

        <div className="space-y-6 pb-6">
          <div className="flex items-start justify-between px-6 pt-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-xs text-pink-700">
                STEP 2 · 감정 강도
              </div>
              <h2 className="text-slate-900 text-xl font-semibold">
                감정 강도 확인
              </h2>
              <p className="text-slate-600 text-sm">
                감정을 숫자로 표현하면 마음의 무게가 정돈되기 시작합니다.
              </p>
            </div>
          </div>

          <div className="px-6 flex justify-center">
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/70 px-6 py-5 shadow-sm shadow-rose-100/70 text-center max-w-md w-full">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-md">
                <Heart className="size-6" />
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 text-xs font-semibold">
                  선택한 감정
                </p>
                <p className="text-slate-900 text-2xl font-semibold">
                  {emotion}
                </p>
                <p className="text-slate-600 text-sm">
                  지금의 감정을 있는 그대로 기록해보세요.
                </p>
              </div>
            </div>
          </div>

          {/* Step 0: 설명 + 강도 측정 */}
          {modalStep === 0 && (
            <div className="space-y-6 px-6">
              <div className="rounded-2xl border border-rose-200 bg-white shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowIntro((prev) => !prev)}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                    showIntro ? "bg-rose-50/60" : "bg-white"
                  }`}
                  aria-expanded={showIntro}
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex size-9 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                      <Sparkles className="size-4" />
                    </span>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-500">
                        감정 인식
                      </p>
                      <h3 className="text-slate-900 text-sm font-semibold">
                        왜 강도를 측정하나요?
                      </h3>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-rose-600">
                    {showIntro ? "닫기" : "자세히"}
                    <ChevronDown
                      className={`size-4 text-rose-500 transition-transform ${
                        showIntro ? "rotate-180" : ""
                      }`}
                    />
                  </span>
                </button>
                {showIntro && (
                  <div className="border-t border-rose-200 px-4 pb-4 pt-3 space-y-4 bg-rose-50/40">
                    <div className="rounded-xl border border-rose-100 bg-white/80 px-4 py-3 shadow-sm">
                      <p className="text-sm font-semibold text-rose-700">
                        왜 숫자로 표현하나요?
                      </p>
                      <p className="mt-2 text-slate-700 leading-relaxed text-sm">
                        감정이 올라올 때 우리는 종종{" "}
                        <span className="font-semibold text-slate-900">
                          "그냥 기분이 안 좋아"
                        </span>
                        라고만 느낍니다. 하지만 심리학 연구에 따르면,{" "}
                        <span className="font-semibold text-slate-900">
                          감정을 구체적으로 인식하고 숫자로 표현하는 순간, 뇌의
                          편도체(감정 중추)가 진정되기 시작
                        </span>
                        합니다.
                      </p>
                    </div>

                    <div className="rounded-xl border border-rose-200 bg-rose-100/60 px-4 py-3 mb-2">
                      <p className="text-slate-800 leading-relaxed text-sm">
                        💡{" "}
                        <span className="font-semibold text-rose-700">
                          "{emotion}"의 강도를 측정한다는 것은
                        </span>
                        , 그것을 관찰의 대상으로 삼는다는 뜻입니다.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border-2 border-rose-300/80 bg-gradient-to-br from-rose-50 via-pink-50 to-white p-6 shadow-sm">
                <p className="text-slate-800 text-lg sm:text-xl mb-6 text-center leading-snug max-w-2xl mx-auto">
                  <strong>지금 이 순간,</strong>{" "}
                  <span className="font-semibold text-slate-900">
                    "{emotion}"
                  </span>
                  <strong>의 강도는 얼마인가요?</strong>
                </p>

                <div className="space-y-6">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-3 rounded-2xl border-2 border-rose-300 bg-white px-8 py-6 shadow-lg shadow-rose-200/60">
                      <div className="text-5xl font-semibold text-slate-900">
                        {intensity}
                      </div>
                      <div className="text-lg text-slate-500">/ 100</div>
                    </div>

                    <div className="mt-3 text-slate-700 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
                      {getIntensityDescription()}
                    </div>
                  </div>

                  <div>
                    <Slider
                      value={[intensity]}
                      onValueChange={(values: number[]) =>
                        onIntensityChange(values[0])
                      }
                      max={100}
                      min={0}
                      step={5}
                      className="[&_[data-slot=slider-track]]:h-3 [&_[data-slot=slider-track]]:bg-rose-100 [&_[data-slot=slider-range]]:bg-gradient-to-r [&_[data-slot=slider-range]]:from-rose-500 [&_[data-slot=slider-range]]:via-pink-500 [&_[data-slot=slider-range]]:to-rose-300 [&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-thumb]]:border-white [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:shadow-md [&_[data-slot=slider-thumb]]:shadow-rose-300/70"
                    />

                    <div className="flex justify-between text-xs text-slate-500 mt-3">
                      <span>0 · 전혀 안 느껴짐</span>
                      <span>50 · 중간</span>
                      <span>100 · 매우 강함</span>
                    </div>
                  </div>

                  <div className="rounded-xl border-2 border-rose-200 bg-rose-50 px-4 py-3 text-center">
                    <p className="text-rose-900 text-sm sm:text-base">
                      💡 <strong>정답은 없습니다.</strong> 지금 이 순간 당신이
                      느끼는 그대로를 표현해주세요.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleNext}
                disabled={intensity === 0}
                className="w-full py-6 text-lg rounded-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white disabled:opacity-40"
              >
                {intensity === 0
                  ? "강도를 선택해주세요"
                  : `${emotion} ${intensity}점으로 계속하기`}
              </Button>
            </div>
          )}

          {/* Step 1 */}
          {modalStep === 1 && (
            <div className="space-y-6 px-6">
              <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-slate-900 text-lg font-semibold mb-2">
                  마지막으로 한 가지 더 물어볼게요.
                </h3>
                <p className="text-slate-700 text-sm sm:text-base mb-4">
                  지금 느끼는 <strong>{emotion}</strong>을(를) 조금이라도 줄이고
                  싶나요?
                </p>

                <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setWantsToReduce(true)}
                    className={`relative rounded-2xl border-2 p-4 text-left transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-200/70 hover:bg-rose-50/50 ${
                      wantsToReduce === true
                        ? "border-rose-500 bg-rose-100/80 shadow-md"
                        : "border-rose-200 bg-white hover:border-rose-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-slate-900">예</div>
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      지금은 조금 가라앉히고 싶어요
                    </div>
                    {wantsToReduce === true && (
                      <span className="absolute right-4 top-4 inline-flex size-7 items-center justify-center rounded-full bg-red-600 text-white shadow-md ring-2 ring-white">
                        <Check className="size-4" />
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setWantsToReduce(false)}
                    className={`relative rounded-2xl border-2 p-4 text-left transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-200/70 hover:bg-rose-50/50 ${
                      wantsToReduce === false
                        ? "border-rose-500 bg-rose-100/80 shadow-md"
                        : "border-rose-200 bg-white hover:border-rose-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-slate-900">아니오</div>
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      줄이기보단 이해하고 싶어요
                    </div>
                    {wantsToReduce === false && (
                      <span className="absolute right-4 top-4 inline-flex size-7 items-center justify-center rounded-full bg-red-600 text-white shadow-md ring-2 ring-white">
                        <Check className="size-4" />
                      </span>
                    )}
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
                    className="flex-1 rounded-full border-rose-200 text-rose-700 hover:bg-rose-50"
                    onClick={onClose}
                  >
                    닫기
                  </Button>
                )}

                <Button
                  onClick={handleNext}
                  disabled={wantsToReduce === null}
                  className="flex-1 py-6 text-lg rounded-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white disabled:opacity-40"
                >
                  확인하고 계속하기
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
