import { Bookmark, Check, Loader2, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { getRecommendedBehaviors } from "../../constants/errorBehaviorMap";
import {
  COGNITIVE_ERRORS,
  COGNITIVE_ERRORS_BY_ID,
  COGNITIVE_ERRORS_BY_INDEX,
} from "../../constants/errors";
import type { EmotionThoughtPair } from "../../types";
import type { SelectedCognitiveError } from "../../types/sessionHistory";
import type { CognitiveBehaviorId } from "../../constants/behaviors";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Button } from "../ui/button";
import { useBehaviorSuggestions } from "./hooks/useBehaviorSuggestions";

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
    behavior: {
      behaviorId: CognitiveBehaviorId;
      behaviorLabel: string;
      behaviorText: string;
    } | null
  ) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onSaveBehavior?: () => void;
  savingBehavior?: boolean;
  isBehaviorSaved?: () => boolean;
}) {
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
  const behaviorMap = new Map<
    string,
    {
      behavior: (typeof mappedErrors)[number]["behaviors"][number];
      tags: string[];
    }
  >();

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
      <p className="text-indigo-900 mb-2">다음의 행동을 추천합니다.</p>
      <p className="text-indigo-700 text-sm mb-4">
        현재의 생각과 감정에 맞는 작은 행동을 하나만 골라보세요.
      </p>
      {behaviorList.length > 0 ? (
        <Accordion type="multiple" className="w-full space-y-3">
          {behaviorList.map((item) => (
            <AccordionItem
              key={item.behavior.id}
              value={item.behavior.id}
              className="rounded-md border border-indigo-200 bg-white/70 px-3 pt-2 pb-6 mb-4 last:mb-0"
            >
              <AccordionTrigger className="py-2 text-indigo-900 text-sm items-center gap-2">
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  <span className="font-medium">
                    {item.behavior.replacement_title}
                  </span>
                  {selectedBehaviorId === item.behavior.id && (
                    <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                      선택됨
                    </span>
                  )}
                  {item.tags.map((tag) => (
                    <span
                      key={`${item.behavior.id}-${tag}`}
                      className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-slate-500"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                {selectedBehaviorId === item.behavior.id &&
                onSaveBehavior &&
                suggestionsById[item.behavior.id] ? (
                  (() => {
                    const behaviorSaved = isBehaviorSaved?.() ?? false;
                    return (
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="gap-1 border-yellow-400 text-yellow-700 hover:bg-yellow-50"
                    disabled={savingBehavior || behaviorSaved}
                  >
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (behaviorSaved || savingBehavior) return;
                        onSaveBehavior();
                      }}
                      onPointerDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          event.stopPropagation();
                          if (behaviorSaved || savingBehavior) return;
                          onSaveBehavior();
                        }
                      }}
                    >
                      {savingBehavior ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : behaviorSaved ? (
                        <Bookmark className="size-4 text-indigo-600" />
                      ) : (
                        <Bookmark className="size-4" />
                      )}
                      {savingBehavior
                        ? "저장 중..."
                        : behaviorSaved
                          ? "저장됨"
                          : "감정노트에 저장"}
                    </span>
                  </Button>
                    );
                  })()
                ) : null}
              </AccordionTrigger>
              <AccordionContent className="text-indigo-800">
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-full border border-indigo-200 bg-white px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                    {item.behavior.category}
                  </span>
                </div>
                <p className="text-sm">{item.behavior.description}</p>
                <div className="mt-3">
                  <span className="rounded-full border border-indigo-200 bg-white px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                    사용방법
                  </span>
                </div>
                <p className="text-sm mt-2">
                  {item.behavior.usage_description}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded-full border border-indigo-200 bg-white px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                    행동 제안
                  </span>
                  <button
                    type="button"
                    onClick={() => void regenerateOne(item.behavior.id)}
                    disabled={loadingId != null || !suggestionsEnabled}
                    className="inline-flex h-4 w-4 items-center justify-center text-indigo-500 transition hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="행동 제안 다시 생성"
                  >
                    <RefreshCw className="size-3" />
                  </button>
                </div>
                {loadingId === "all" ||
                loadingId === item.behavior.id ||
                (suggestionsEnabled &&
                  !suggestionsById[item.behavior.id] &&
                  !errorAll &&
                  !errorById[item.behavior.id]) ? (
                  <div className="mt-2 flex items-center gap-2 text-sm text-indigo-700">
                    <Loader2 className="size-4 animate-spin" />
                    제안을 생성하고 있습니다...
                  </div>
                ) : errorAll || errorById[item.behavior.id] ? (
                  <div className="mt-2 flex items-center gap-2 text-sm text-red-700">
                    {errorById[item.behavior.id] ?? errorAll}
                  </div>
                ) : !suggestionsEnabled ? (
                  <p className="text-sm mt-2 text-indigo-700">
                    행동 제안을 생성하려면 입력을 완료해주세요.
                  </p>
                ) : (
                  <>
                    <p className="text-sm mt-2 italic text-indigo-800">
                      {suggestionsById[item.behavior.id] ??
                        "행동 제안을 준비하지 못했습니다."}
                    </p>
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          const suggestion =
                            suggestionsById[item.behavior.id];
                          if (!suggestion) return;
                          if (selectedBehaviorId === item.behavior.id) {
                            onSelectBehavior(null);
                            return;
                          }
                          onSelectBehavior({
                            behaviorId: item.behavior.id,
                            behaviorLabel: item.behavior.replacement_title,
                            behaviorText: suggestion,
                          });
                        }}
                        disabled={
                          loadingId != null ||
                          !suggestionsEnabled ||
                          Boolean(errorAll || errorById[item.behavior.id]) ||
                          !suggestionsById[item.behavior.id]
                        }
                        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition ${
                          selectedBehaviorId === item.behavior.id
                            ? "border-indigo-300 bg-indigo-50 text-indigo-900"
                            : "border-indigo-200 bg-white text-indigo-800 hover:border-indigo-300 hover:text-indigo-900"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <span
                          className={`flex size-4 items-center justify-center rounded-sm border ${
                            selectedBehaviorId === item.behavior.id
                              ? "border-indigo-300 bg-indigo-200 text-indigo-800"
                              : "border-indigo-200 bg-slate-100 text-indigo-700"
                          }`}
                          aria-hidden="true"
                        >
                          {selectedBehaviorId === item.behavior.id && (
                            <Check className="size-3" />
                          )}
                        </span>
                        {selectedBehaviorId === item.behavior.id
                          ? "이 행동을 시도해보겠습니다."
                          : "이 행동을 시도해보겠습니다."}
                      </button>
                    </div>
                  </>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <p className="mt-3 text-indigo-700 text-sm">
          추천 행동을 표시하려면 인지오류를 선택해주세요.
        </p>
      )}
    </div>
  );
}
