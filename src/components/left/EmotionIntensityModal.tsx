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

        <div className="space-y-8 py-6">
          {/* 헤더 */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mb-4">
              <Heart className="size-8 text-white" />
            </div>
            <h2 className="text-slate-900 text-3xl mb-2">감정 강도 조절하기</h2>
            <p className="text-slate-600 text-lg">
              {emotion} 감정을 건강하게 다루어봅시다
            </p>
          </div>

          {/* 설명 섹션 1: 감정 인식의 중요성 */}
          <div className="rounded-lg border border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => setShowEmotionControl((prev) => !prev)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              aria-expanded={showEmotionControl}
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-slate-100 text-slate-600">
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
              <ChevronDown
                className={`size-4 text-slate-500 transition-transform ${
                  showEmotionControl ? "rotate-180" : ""
                }`}
              />
            </button>
            {showEmotionControl && (
              <div className="border-t border-slate-200 px-4 pb-4 pt-3 space-y-2">
                <p className="text-slate-700 leading-relaxed">
                  많은 사람들이 부정적인 감정에 압도되어{" "}
                  <strong>"나는 이 감정을 어쩔 수 없어"</strong>라고 생각합니다.
                  하지만 심리학자 앨버트 엘리스(Albert Ellis)의 연구에 따르면,
                  <strong className="text-slate-900">
                    {" "}
                    감정이 조절 가능하다는 것을 인식하는 순간 이미 변화가 시작
                  </strong>
                  됩니다.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  감정의 강도를 스스로 설정해보는 것은{" "}
                  <strong>"내가 이 감정의 주인"</strong>이라는
                  자기효능감(Self-efficacy)을 높여줍니다. 실제로 목표 강도를
                  설정한 사람들은 그렇지 않은 사람들보다{" "}
                  <strong>감정 조절에 2배 이상 성공률</strong>이 높다는 연구
                  결과가 있습니다.
                </p>
              </div>
            )}
          </div>

          {/* 설명 섹션 2: 강도 조절의 효과 */}
          <div className="rounded-lg border border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => setShowEmotionValue((prev) => !prev)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              aria-expanded={showEmotionValue}
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-slate-100 text-slate-600">
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
              <ChevronDown
                className={`size-4 text-slate-500 transition-transform ${
                  showEmotionValue ? "rotate-180" : ""
                }`}
              />
            </button>
            {showEmotionValue && (
              <div className="border-t border-slate-200 px-4 pb-4 pt-3 space-y-2">
                <p className="text-slate-700 leading-relaxed">
                  부정적인 감정을 완전히 없애려고 하면 오히려 역효과가 납니다.
                  감정은 우리에게 중요한 신호를 보내주는 <strong>정보</strong>
                  이기 때문입니다.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  예를 들어, 100점 만점의 분노를 30-40점 정도로 낮추면,
                  <strong> 여전히 문제를 인식하면서도 이성적으로 대처</strong>할
                  수 있게 됩니다. 감정이 너무 높으면 판단력이 흐려지지만, 적절한
                  수준이면 오히려 <strong>동기부여와 문제해결의 에너지</strong>
                  가 됩니다.
                </p>
              </div>
            )}
          </div>

          {/* 현재 감정 강도 */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6">
            <p className="text-slate-700 text-lg mb-4">
              당신이 측정한<strong> "{emotion}" </strong>의 강도
            </p>
            <div className="flex items-center justify-center">
              <div className="text-6xl font-bold text-red-600">
                {currentIntensity}
                <span className="text-3xl text-slate-500">/100</span>
              </div>
            </div>
          </div>

          {/* 목표 감정 강도 설정 */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
            <p className="text-slate-700 text-lg mb-2">
              <strong>얼마나 낮추면 편하실까요?</strong>
            </p>
            <div className="mb-6 rounded-lg border border-emerald-200/70 bg-white/70 px-4 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-emerald-600">
                여기 가상의 다이얼이 있습니다.
              </p>
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
                <div className="text-5xl font-bold text-green-600 mb-2">
                  {targetIntensity}
                  <span className="text-2xl text-slate-500">/100</span>
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
                className="w-full"
              />

              <div className="flex justify-between text-sm text-slate-500">
                <span>0 (완전히 해소)</span>
                <span>{currentIntensity} (현재 상태)</span>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 py-6 text-lg border-slate-300"
            >
              취소
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 py-6 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
            >
              이 목표로 계속하기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
