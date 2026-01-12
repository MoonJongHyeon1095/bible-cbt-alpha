import { useEffect, useState } from "react";
import type { CognitiveBehaviorId } from "../../../constants/behaviors";
import { getRecommendedBehaviors } from "../../../constants/errorBehaviorMap";
import {
  COGNITIVE_ERRORS,
  COGNITIVE_ERRORS_BY_ID,
  COGNITIVE_ERRORS_BY_INDEX,
} from "../../../constants/errors";
import type { EmotionThoughtPair } from "../../../types";
import type { SelectedCognitiveError } from "../../../types/sessionHistory";
import { useBehaviorSuggestions } from "../hooks/useBehaviorSuggestions";
import { BehaviorReviewHeaderSection } from "./BehaviorReviewHeaderSection";
import { BehaviorReviewListSection } from "./BehaviorReviewListSection";
import type {
  BehaviorReviewItem,
  BehaviorSelection,
} from "./behaviorReviewTypes";

export function BehaviorReviewCard({
  userInput,
  emotionThoughtPairs,
  selectedCognitiveErrors,
  selectedAlternativeThought,
  selectedBehaviorId,
  onSelectBehavior,
  onLoadingChange,
  onSaveBehavior,
  savingBehavior = false,
  isBehaviorSaved,
}: {
  userInput: string;
  emotionThoughtPairs: EmotionThoughtPair[];
  selectedCognitiveErrors: SelectedCognitiveError[];
  selectedAlternativeThought: string;
  selectedBehaviorId: CognitiveBehaviorId | null;
  onSelectBehavior: (
    behavior: BehaviorSelection | null
  ) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onSaveBehavior?: () => void;
  savingBehavior?: boolean;
  isBehaviorSaved?: () => boolean;
}) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const mappedErrors = selectedCognitiveErrors
    .map((error) => {
      const byId = error.id ? COGNITIVE_ERRORS_BY_ID[error.id] : undefined;
      const byIndex = error.index
        ? COGNITIVE_ERRORS_BY_INDEX[error.index]
        : undefined;
      const byTitle = COGNITIVE_ERRORS.find(
        (item) => item.title === error.title
      );

      const meta = byId ?? byIndex ?? byTitle;
      if (!meta) return null;

      return {
        key: meta.id,
        title: meta.title,
        behaviors: getRecommendedBehaviors(meta.id),
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const behaviorMap = new Map<string, BehaviorReviewItem>();

  mappedErrors.forEach((error) => {
    error.behaviors.forEach((behavior) => {
      const existing = behaviorMap.get(behavior.id);
      if (existing) {
        if (!existing.tags.includes(error.title)) {
          existing.tags.push(error.title);
        }
        return;
      }
      behaviorMap.set(behavior.id, {
        behavior,
        tags: [error.title],
      });
    });
  });

  const behaviorList = Array.from(behaviorMap.values());
  const behaviorsForPrompt = behaviorList.map((item) => item.behavior);
  const suggestionsEnabled =
    Boolean(userInput.trim()) &&
    Boolean(selectedAlternativeThought.trim()) &&
    behaviorList.length > 0;
  const { suggestionsById, loadingId, errorAll, errorById, regenerateOne } =
    useBehaviorSuggestions({
      enabled: suggestionsEnabled,
      userInput,
      emotionThoughtPairs,
      selectedCognitiveErrors,
      selectedAlternativeThought,
      behaviors: behaviorsForPrompt,
    });

  useEffect(() => {
    if (loadingId) {
      onSelectBehavior(null);
    }
  }, [loadingId, onSelectBehavior]);

  useEffect(() => {
    onLoadingChange(Boolean(loadingId));
  }, [loadingId, onLoadingChange]);

  useEffect(() => {
    if (!suggestionsEnabled || behaviorList.length === 0) {
      onSelectBehavior(null);
    }
  }, [behaviorList.length, onSelectBehavior, suggestionsEnabled]);

  return (
    <div className="rounded-lg border-2 border-indigo-200 bg-indigo-50 p-4">
      <BehaviorReviewHeaderSection
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed((prev) => !prev)}
      />
      {!isCollapsed && behaviorList.length > 0 ? (
        <div className="mt-4">
          <BehaviorReviewListSection
            behaviorList={behaviorList}
            selectedBehaviorId={selectedBehaviorId}
            onSelectBehavior={onSelectBehavior}
            onSaveBehavior={onSaveBehavior}
            savingBehavior={savingBehavior}
            isBehaviorSaved={isBehaviorSaved}
            suggestionsById={suggestionsById}
            loadingId={loadingId}
            errorAll={errorAll}
            errorById={errorById}
            regenerateOne={regenerateOne}
            suggestionsEnabled={suggestionsEnabled}
          />
        </div>
      ) : (
        !isCollapsed && (
          <p className="mt-3 text-indigo-700 text-sm">
            추천 행동을 표시하려면 인지오류를 선택해주세요.
          </p>
        )
      )}
    </div>
  );
}
