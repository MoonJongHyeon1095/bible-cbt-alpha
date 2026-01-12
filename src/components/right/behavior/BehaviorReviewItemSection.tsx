import { Bookmark, Check, Loader2, RefreshCw } from "lucide-react";
import type { CognitiveBehaviorId } from "../../../constants/behaviors";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion";
import { Button } from "../../ui/button";
import type {
  BehaviorErrorMap,
  BehaviorReviewItem,
  BehaviorSelection,
  BehaviorSuggestionMap,
} from "./behaviorReviewTypes";

export function BehaviorReviewItemSection({
  item,
  selectedBehaviorId,
  onSelectBehavior,
  onSaveBehavior,
  savingBehavior,
  isBehaviorSaved,
  suggestionsById,
  loadingId,
  errorAll,
  errorById,
  regenerateOne,
  suggestionsEnabled,
}: {
  item: BehaviorReviewItem;
  selectedBehaviorId: CognitiveBehaviorId | null;
  onSelectBehavior: (behavior: BehaviorSelection | null) => void;
  onSaveBehavior?: () => void;
  savingBehavior?: boolean;
  isBehaviorSaved?: () => boolean;
  suggestionsById: BehaviorSuggestionMap;
  loadingId: "all" | CognitiveBehaviorId | null;
  errorAll: string | null;
  errorById: BehaviorErrorMap;
  regenerateOne: (behaviorId: CognitiveBehaviorId) => void;
  suggestionsEnabled: boolean;
}) {
  const suggestion = suggestionsById[item.behavior.id];
  const hasSuggestion = Boolean(suggestion);
  const isSelected = selectedBehaviorId === item.behavior.id;

  return (
    <AccordionItem
      value={item.behavior.id}
      className="group rounded-md border border-indigo-200 bg-white/70 px-3 pt-2 pb-4 mb-4 last:mb-0"
    >
      <AccordionTrigger className="py-2 text-indigo-900 text-sm items-start gap-2">
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex w-full items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">
                {item.behavior.replacement_title}
              </span>
              {isSelected && (
                <span className="inline-flex h-6 items-center rounded-full bg-indigo-600 px-2 text-[10px] font-medium uppercase tracking-wide text-white">
                  선택됨
                </span>
              )}
            </div>
            {isSelected && onSaveBehavior && hasSuggestion ? (
              <div className="group-data-[state=closed]:hidden">
                {(() => {
                  const behaviorSaved = isBehaviorSaved?.() ?? false;
                  return (
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="h-6 gap-1 rounded-full border-yellow-400 px-2 text-[10px] font-medium text-yellow-700 hover:bg-yellow-50"
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
                          <Loader2 className="size-3 animate-spin" />
                        ) : behaviorSaved ? (
                          <Bookmark className="size-3 text-indigo-600" />
                        ) : (
                          <Bookmark className="size-3" />
                        )}
                        {savingBehavior
                          ? "저장 중..."
                          : behaviorSaved
                          ? "저장됨"
                          : "감정노트에 저장"}
                      </span>
                    </Button>
                  );
                })()}
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2 group-data-[state=closed]:hidden">
            {item.tags.map((tag) => (
              <span
                key={`${item.behavior.id}-${tag}`}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-slate-500"
              >
                #{tag}
              </span>
            ))}
          </div>

        </div>
      </AccordionTrigger>
      <AccordionContent className="text-indigo-800">
        <div className="flex items-center gap-2 mt-2 mb-2">
          <span className="rounded-full border border-indigo-200 bg-white px-2 py-0.5 text-[10px] font-medium text-indigo-700">
            {item.behavior.category}
          </span>
        </div>
        <p className="text-sm">{item.behavior.description}</p>
        <div className="mt-6">
          <span className="rounded-full border border-indigo-200 bg-white px-2 py-0.5 text-[10px] font-medium text-indigo-700">
            사용방법
          </span>
        </div>
        <p className="text-sm mt-2">{item.behavior.usage_description}</p>
        <div className="mt-6 flex items-center gap-2">
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
          !suggestion &&
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
              {suggestion ?? "행동 제안을 준비하지 못했습니다."}
            </p>
            <div className="mt-6 mb-1 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!suggestion) return;
                  if (isSelected) {
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
                  !suggestion
                }
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                    : "border-indigo-200 bg-white text-indigo-800 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-900"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <span
                  className={`flex size-4 items-center justify-center rounded-full border ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-500 text-white"
                      : "border-indigo-200 bg-white text-indigo-700"
                  }`}
                  aria-hidden="true"
                >
                  {isSelected && <Check className="size-3" />}
                </span>
                {isSelected
                  ? "이 행동을 시도해보겠습니다."
                  : "이 행동을 시도해보겠습니다."}
              </button>
            </div>
          </>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
