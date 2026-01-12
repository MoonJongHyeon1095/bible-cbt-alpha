// src/components/left/EmotionIntensityModal.tsx
import { ChevronDown, Heart, Info } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import { Slider } from "../ui/slider";

interface EmotionIntensityModalProps {
  open: boolean;
  emotion: string;
  currentIntensity: number;
  targetIntensity: number;
  onTargetIntensityChange: (value: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function EmotionIntensityModal({
  open,
  emotion,
  currentIntensity,
  targetIntensity,
  onTargetIntensityChange,
  onConfirm,
  onCancel,
}: EmotionIntensityModalProps) {
  const [showEmotionControl, setShowEmotionControl] = useState(false);
  const [showEmotionValue, setShowEmotionValue] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen: boolean) => {
        if (!nextOpen) onCancel();
      }}
    >
      <DialogContent
        className="max-w-6xl bg-white border-2 border-indigo-200 shadow-2xl max-h-[90vh] overflow-y-auto"
        aria-describedby="emotion-target-description"
      >
        <DialogTitle className="sr-only">감정 강도 조절하기</DialogTitle>
        <DialogDescription id="emotion-target-description" className="sr-only">
          {emotion} 감정을 {currentIntensity}점에서 목표 강도로 낮추어 건강하게
          조절하는 과정입니다.
        </DialogDescription>

        <div className="space-y-6 pb-6">
          {/* 헤더 */}
          <div className="px-6 pt-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl mb-4 shadow-md">
              <Heart className="size-7 text-white" />
            </div>

            <h2 className="text-slate-900 text-2xl sm:text-3xl font-semibold">
              감정 강도 조절하기
            </h2>
          </div>

          <div className="px-6 flex justify-center">
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-6 py-4 shadow-sm text-center max-w-md w-full">
              <p className="text-xs font-semibold text-indigo-600">
                지금 느끼는 감정
              </p>
              <p className="text-slate-900 text-2xl font-semibold">{emotion}</p>
              <p className="text-slate-600 text-sm">
                강도를 조절해 편안한 지점을 찾아봅니다.
              </p>
            </div>
          </div>

          {/* 설명 섹션 1: 감정 인식의 중요성 */}
          <div className="mx-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setShowEmotionControl((prev) => !prev)}
              className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                showEmotionControl ? "bg-indigo-50/40" : "bg-white"
              }`}
              aria-expanded={showEmotionControl}
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <Info className="size-4" />
                </span>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500">
                    감정의 인식
                  </p>
                  <h3 className="text-slate-800 text-sm font-semibold">
                    감정을 조절할 수 있다는 것은...
                  </h3>
                </div>
              </div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600">
                {showEmotionControl ? "닫기" : "자세히"}
                <ChevronDown
                  className={`size-4 text-indigo-500 transition-transform ${
                    showEmotionControl ? "rotate-180" : ""
                  }`}
                />
              </span>
            </button>
            {showEmotionControl && (
              <div className="border-t border-slate-200 px-4 pb-4 pt-3 space-y-4 bg-indigo-50/30">
                <div className="rounded-xl border border-indigo-100 bg-white/80 px-4 py-3 shadow-sm">
                  <p className="text-sm font-semibold text-indigo-700">
                    감정은 조절 가능합니다
                  </p>
                  <p className="mt-2 text-slate-700 leading-relaxed text-sm">
                    많은 사람들이 부정적인 감정에 압도되어{" "}
                    <span className="font-semibold text-slate-900">
                      "나는 이 감정을 어쩔 수 없어"
                    </span>
                    라고 생각합니다. 하지만 심리학자 앨버트 엘리스(Albert
                    Ellis)의 연구에 따르면,{" "}
                    <span className="font-semibold text-slate-900">
                      감정이 조절 가능하다는 것을 인식하는 순간 이미 변화가 시작
                    </span>
                    됩니다.
                  </p>
                </div>

                <div className="rounded-xl border border-indigo-200 bg-indigo-100/60 px-4 py-3">
                  <p className="text-slate-800 leading-relaxed text-sm">
                    💡{" "}
                    <span className="font-semibold text-indigo-700">
                      강도를 스스로 설정
                    </span>
                    하는 행위는 “내가 이 감정의 주인”이라는 자기효능감을
                    높여줍니다.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 설명 섹션 2: 강도 조절의 효과 */}
          <div className="mx-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setShowEmotionValue((prev) => !prev)}
              className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                showEmotionValue ? "bg-emerald-50/40" : "bg-white"
              }`}
              aria-expanded={showEmotionValue}
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Info className="size-4" />
                </span>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500">
                    감정의 조절
                  </p>
                  <h3 className="text-slate-800 text-sm font-semibold">
                    하지만 그 감정 역시도 소중합니다.
                  </h3>
                </div>
              </div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600">
                {showEmotionValue ? "닫기" : "자세히"}
                <ChevronDown
                  className={`size-4 text-emerald-500 transition-transform ${
                    showEmotionValue ? "rotate-180" : ""
                  }`}
                />
              </span>
            </button>
            {showEmotionValue && (
              <div className="border-t border-slate-200 px-4 pb-4 pt-3 space-y-4 bg-emerald-50/30">
                <div className="rounded-xl border border-emerald-100 bg-white/80 px-4 py-3 shadow-sm">
                  <p className="text-sm font-semibold text-emerald-700">
                    감정은 중요한 신호입니다
                  </p>
                  <p className="mt-2 text-slate-700 leading-relaxed text-sm">
                    부정적인 감정을 완전히 없애려고 하면 오히려 역효과가 납니다.
                    감정은 우리에게 중요한 신호를 보내주는{" "}
                    <span className="font-semibold text-slate-900">정보</span>
                    이기 때문입니다.
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-100/60 px-4 py-3">
                  <p className="text-slate-800 leading-relaxed text-sm">
                    💡 예를 들어, 100점 만점의 분노를 30-40점 정도로 낮추면{" "}
                    <span className="font-semibold text-emerald-700">
                      이성적으로 대처하면서도 문제를 인식
                    </span>
                    할 수 있습니다.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 현재 감정 강도 */}
          <div className="mx-6 bg-gradient-to-br from-red-50 via-rose-50 to-white border-2 border-red-200 rounded-2xl p-6 shadow-sm">
            <p className="text-slate-700 text-base sm:text-lg mb-4">
              당신이 측정한<strong> "{emotion}" </strong>의 강도
            </p>
            <div className="flex items-center justify-center">
              <div className="text-5xl sm:text-6xl font-bold text-red-600">
                {currentIntensity}
                <span className="text-2xl sm:text-3xl text-slate-500">
                  /100
                </span>
              </div>
            </div>
          </div>

          {/* 목표 감정 강도 설정 */}
          <div className="mx-6 bg-gradient-to-br from-emerald-50 via-green-50 to-white border-2 border-emerald-200 rounded-2xl p-6 shadow-sm">
            <p className="text-slate-700 text-base sm:text-lg mb-2">
              <strong>얼마나 낮추면 편하실까요?</strong>
            </p>
            <div className="mb-6 rounded-xl border border-emerald-200/70 bg-white/80 px-4 py-3 shadow-sm">
              <div className="flex items-start gap-2 text-xs uppercase tracking-wide text-emerald-600">
                <span className="mt-1 size-2 rounded-full bg-emerald-500" />
                <span>여기 가상의 다이얼이 있습니다.</span>
              </div>
              <ul className="mt-2 space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="mt-1 size-2 rounded-full bg-emerald-500" />
                  <span>
                    다이얼을 돌려 <strong>{emotion}</strong>의 강도를 조절할 수
                    있다면, 몇 점으로 맞추고 싶으신가요?
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 size-2 rounded-full bg-emerald-500" />
                  <span>
                    그 감정은 당신의 장점이기도 하니, 적절한 수준으로만 낮춰보면
                    좋겠습니다.
                  </span>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-emerald-600 mb-2">
                  {targetIntensity}
                  <span className="text-xl sm:text-2xl text-slate-500">
                    /100
                  </span>
                </div>
                <p className="text-slate-600">
                  {targetIntensity < currentIntensity * 0.3 && "크게 낮추기"}
                  {targetIntensity >= currentIntensity * 0.3 &&
                    targetIntensity < currentIntensity * 0.6 &&
                    "중간 정도 낮추기"}
                  {targetIntensity >= currentIntensity * 0.6 && "조금만 낮추기"}
                </p>
              </div>

              <Slider
                value={[targetIntensity]}
                onValueChange={(values) => onTargetIntensityChange(values[0])}
                max={currentIntensity}
                min={0}
                step={5}
                className="[&_[data-slot=slider-track]]:h-3 [&_[data-slot=slider-track]]:bg-emerald-100 [&_[data-slot=slider-range]]:bg-gradient-to-r [&_[data-slot=slider-range]]:from-emerald-500 [&_[data-slot=slider-range]]:to-emerald-300 [&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-thumb]]:border-white [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:shadow-md [&_[data-slot=slider-thumb]]:shadow-emerald-200/70"
              />

              <div className="flex justify-between text-sm text-slate-500">
                <span>0 (완전히 해소)</span>
                <span>{currentIntensity} (현재 상태)</span>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-2 px-6">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 py-6 text-lg rounded-full border-slate-300"
            >
              취소
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 py-6 text-lg rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
            >
              이 목표로 계속하기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
