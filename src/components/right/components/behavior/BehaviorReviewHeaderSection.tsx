import { ChevronDown } from "lucide-react";

export function BehaviorReviewHeaderSection({
  isCollapsed,
  onToggle,
}: {
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-indigo-900">다음의 행동을 추천합니다.</p>
        <p className="text-indigo-700 text-sm mt-1">
          현재의 생각과 감정에 맞는 작은 행동을 하나만 골라보세요.
        </p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className="mt-1"
        aria-expanded={!isCollapsed}
        aria-label={isCollapsed ? "행동 추천 열기" : "행동 추천 접기"}
      >
        <ChevronDown
          className={`size-5 text-indigo-500 transition-transform ${
            isCollapsed ? "" : "rotate-180"
          }`}
        />
      </button>
    </div>
  );
}
