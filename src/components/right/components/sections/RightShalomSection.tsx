import { Loader2, Sparkles } from "lucide-react";
import { Button } from "../../../ui/button";
import { ShalomCard } from "../ShalomCard";

interface RightShalomSectionProps {
  isDeep: boolean;
  isBehaviorGenerating: boolean;
  onComplete: () => void;
}

export function RightShalomSection({
  isDeep,
  isBehaviorGenerating,
  onComplete,
}: RightShalomSectionProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-sky-50 p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-blue-500">
            마무리
          </p>
          <h3 className="text-base font-semibold text-blue-900">
            평안의 마침
          </h3>
        </div>
        <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <Sparkles className="size-4" />
        </div>
      </div>

      <ShalomCard className="text-sm leading-relaxed text-blue-900" />

      <div className="mt-4 border-t border-blue-100 pt-4">
        {isDeep ? (
          <div className="flex items-center gap-2 text-slate-600 text-sm">
            <Loader2 className="size-4 animate-spin" />
            마무리 단계로 이동 중...
          </div>
        ) : (
          <Button
            onClick={onComplete}
            className="w-full rounded-full bg-indigo-600 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md"
            disabled={isBehaviorGenerating}
          >
            {isBehaviorGenerating ? "행동 제안 생성중" : "완료하기"}
          </Button>
        )}
      </div>
    </div>
  );
}
