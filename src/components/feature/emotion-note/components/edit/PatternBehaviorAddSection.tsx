import {
  Check,
  Footprints,
  Info,
  Loader2,
  Save,
  Sparkles,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { COGNITIVE_BEHAVIORS } from "../../../../../constants/behaviors";
import { getRecommendedBehaviors } from "../../../../../constants/errorBehaviorMap";
import { COGNITIVE_ERRORS } from "../../../../../constants/errors";
import { generateBehaviorSuggestions } from "../../../../../lib/ai";
import { Textarea } from "../../../../ui/textarea";
import { clearTokenSessionStorage } from "../../../../../utils/tokenSessionStorage";
import type {
  PatternAlternative,
  PatternDetail,
  PatternErrorDetail,
} from "../../types";

import { CognitiveErrorInfoPopover } from "../pop-over/CognitiveErrorInfoPopover";
import { getCognitiveErrorMeta } from "../pop-over/InfoPopoverMeta";
import { BehaviorSelector } from "./PatternSelectors";
import { AiActionBar } from "./common/AiActionBar";
import { AiCandidatesPanel } from "./common/AiCandidatesPanel";
import { AiLoadingCard } from "./common/AiLoadingCard";
import { checkAiUsageLimit } from "./common/aiUsageGuard";
import { ExpandableText } from "./common/ExpandableText";
import { FloatingStepNav } from "./common/FloatingStepNav";
import { PatternAddSectionShell } from "./common/PatternAddSectionShell";
import { SelectionCard } from "./common/SelectionCard";
import { SelectionPanel } from "./common/SelectionPanel";

interface PatternBehaviorAddSectionProps {
  triggerText: string;
  details: PatternDetail[];
  errorDetails: PatternErrorDetail[];
  alternatives: PatternAlternative[];
  behaviorLabel: string;
  behaviorDescription: string;
  behaviorErrorTags: string[];
  loading: boolean;
  onChangeBehaviorLabel: (value: string) => void;
  onChangeBehaviorDescription: (value: string) => void;
  onChangeBehaviorErrorTags: (value: string[]) => void;
  onAddBehaviorDetail: () => void;
}

export function PatternBehaviorAddSection({
  triggerText,
  details,
  errorDetails,
  alternatives,
  behaviorLabel,
  behaviorDescription,
  behaviorErrorTags,
  loading,
  onChangeBehaviorLabel,
  onChangeBehaviorDescription,
  onChangeBehaviorErrorTags,
  onAddBehaviorDetail,
}: PatternBehaviorAddSectionProps) {
  const [aiStep, setAiStep] = useState<
    | "idle"
    | "select-thought"
    | "select-errors"
    | "select-alternative"
    | "loading"
    | "suggestions"
  >("idle");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [selectedDetailId, setSelectedDetailId] = useState("");
  const [selectedErrorIds, setSelectedErrorIds] = useState<string[]>([]);
  const [selectedAlternativeId, setSelectedAlternativeId] = useState("");
  const [expandedDetailIds, setExpandedDetailIds] = useState<string[]>([]);
  const [expandedErrorIds, setExpandedErrorIds] = useState<string[]>([]);
  const [expandedAlternativeIds, setExpandedAlternativeIds] = useState<
    string[]
  >([]);
  const [suggestionsById, setSuggestionsById] = useState<
    Record<string, string>
  >({});
  const generateTimerRef = useRef<number | null>(null);

  const selectedDetail = useMemo(
    () => details.find((detail) => detail.id === selectedDetailId) ?? null,
    [details, selectedDetailId],
  );
  const selectedErrors = useMemo(
    () =>
      selectedErrorIds
        .map((id) => errorDetails.find((error) => error.id === id))
        .filter((error): error is PatternErrorDetail => Boolean(error)),
    [errorDetails, selectedErrorIds],
  );

  const behaviorCandidates = useMemo(() => {
    const behaviorMap = new Map<
      string,
      { behavior: (typeof COGNITIVE_BEHAVIORS)[number]; tags: string[] }
    >();
    selectedErrors.forEach((error) => {
      const meta = COGNITIVE_ERRORS.find(
        (item) => item.title === error.errorLabel,
      );
      if (!meta) return;
      const behaviors = getRecommendedBehaviors(meta.id);
      behaviors.forEach((behavior) => {
        const existing = behaviorMap.get(behavior.id);
        if (existing) {
          if (!existing.tags.includes(meta.title)) {
            existing.tags.push(meta.title);
          }
          return;
        }
        behaviorMap.set(behavior.id, {
          behavior,
          tags: [meta.title],
        });
      });
    });
    return Array.from(behaviorMap.values()).slice(0, 6);
  }, [selectedErrors]);

  useEffect(() => {
    if (generateTimerRef.current) {
      window.clearTimeout(generateTimerRef.current);
      generateTimerRef.current = null;
    }
    setAiError(null);
  }, [selectedDetailId, selectedErrorIds, selectedAlternativeId]);

  useEffect(() => {
    return () => {
      if (generateTimerRef.current) {
        window.clearTimeout(generateTimerRef.current);
        generateTimerRef.current = null;
      }
    };
  }, []);

  const startAiSelection = () => {
    setSelectedDetailId("");
    setSelectedErrorIds([]);
    setSelectedAlternativeId("");
    setSuggestionsById({});
    setAiError(null);
    onChangeBehaviorLabel("");
    onChangeBehaviorDescription("");
    onChangeBehaviorErrorTags([]);
    setAiStep("select-thought");
  };

  const handleAiAction = async () => {
    const allowed = await checkAiUsageLimit();
    if (!allowed) return;
    startAiSelection();
  };

  const handleSelectDetail = (detailId: string) => {
    setSelectedDetailId(detailId);
    setSelectedErrorIds([]);
    setSelectedAlternativeId("");
  };

  const handleToggleError = (errorId: string) => {
    setSelectedErrorIds((prev) => {
      if (prev.includes(errorId)) {
        return prev.filter((id) => id !== errorId);
      }
      if (prev.length >= 2) {
        toast.error("인지오류는 최대 2개까지 선택할 수 있어요.");
        return prev;
      }
      return [...prev, errorId];
    });
  };

  const toggleExpanded = (
    setter: Dispatch<SetStateAction<string[]>>,
    id: string,
  ) => {
    setter((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleGenerateSuggestions = async (
    detail: PatternDetail,
    errors: PatternErrorDetail[],
    alternative: PatternAlternative,
  ) => {
    if (!triggerText.trim()) return;
    if (!detail) return;
    if (errors.length === 0) return;
    if (!alternative) return;
    if (behaviorCandidates.length === 0) {
      setAiError("추천 행동이 없습니다.");
      return;
    }

    setAiLoading(true);
    setAiError(null);
    setAiStep("loading");
    try {
      const suggestions = await generateBehaviorSuggestions(
        triggerText,
        [
          {
            emotion: detail.emotion,
            intensity: null,
            thought: detail.automaticThought,
          },
        ],
        alternative.alternative,
        errors.map((error) => ({
          title: error.errorLabel,
          detail: error.errorDescription,
        })),
        behaviorCandidates.map((item) => item.behavior),
      );
      const next: Record<string, string> = {};
      suggestions.forEach((item) => {
        next[item.behaviorId] = item.suggestion;
      });
      setSuggestionsById(next);
      setAiStep("suggestions");
    } catch (error) {
      console.error("행동 제안 생성 오류:", error);
      setAiError("AI 제안을 불러오지 못했습니다.");
      setAiStep("select-alternative");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSelectAlternative = (alternativeId: string) => {
    setSelectedAlternativeId(alternativeId);
  };

  const applySuggestion = (behaviorId: string, suggestion: string) => {
    const behavior = behaviorCandidates.find(
      (item) => item.behavior.id === behaviorId,
    );
    if (!behavior) return;
    onChangeBehaviorLabel(behavior.behavior.replacement_title);
    onChangeBehaviorDescription(suggestion);
    onChangeBehaviorErrorTags(behavior.tags);
  };

  const manualMode = aiStep === "idle";
  const hasAiSuggestions =
    aiStep === "suggestions" && behaviorCandidates.length > 0;
  const showAiSelectionSummary =
    !manualMode && (behaviorLabel.trim() || behaviorErrorTags.length > 0);
  const showFloatingNext =
    aiStep === "select-thought" ||
    aiStep === "select-errors" ||
    aiStep === "select-alternative";

  const handleNextStep = () => {
    if (aiStep === "select-thought") {
      if (!selectedDetailId) {
        toast.error("자동사고를 1개 선택해주세요.");
        return;
      }
      setAiStep("select-errors");
      return;
    }
    if (aiStep === "select-errors") {
      if (selectedErrorIds.length === 0) {
        toast.error("인지오류를 1~2개 선택해주세요.");
        return;
      }
      setAiStep("select-alternative");
      return;
    }
    if (aiStep === "select-alternative") {
      const detail = selectedDetail;
      const alternative =
        alternatives.find((alt) => alt.id === selectedAlternativeId) ?? null;
      if (!detail) {
        toast.error("자동사고를 먼저 선택해주세요.");
        setAiStep("select-thought");
        return;
      }
      if (selectedErrors.length === 0) {
        toast.error("인지오류를 1~2개 선택해주세요.");
        setAiStep("select-errors");
        return;
      }
      if (!alternative) {
        toast.error("대안적 접근을 1개 선택해주세요.");
        return;
      }
      void handleGenerateSuggestions(detail, selectedErrors, alternative);
    }
  };

  const nextDisabled =
    (aiStep === "select-thought" && !selectedDetailId) ||
    (aiStep === "select-errors" && selectedErrorIds.length === 0) ||
    (aiStep === "select-alternative" && !selectedAlternativeId);
  const showBackButton =
    aiStep === "select-errors" || aiStep === "select-alternative";

  const handleBackStep = () => {
    if (aiStep === "select-alternative") {
      setAiStep("select-errors");
      return;
    }
    if (aiStep === "select-errors") {
      setAiStep("select-thought");
    }
  };

  return (
    <PatternAddSectionShell
      tone="blue"
      title="행동 반응 추가"
      icon={Footprints}
      onClose={() => void clearTokenSessionStorage()}
    >
        <AiActionBar
          aiLabel={
            <>
              <Sparkles className="size-4 mr-1" />
              {hasAiSuggestions ? "다시 제안" : "AI 제안"}
            </>
          }
          onAiClick={() => void handleAiAction()}
          aiDisabled={loading || aiLoading}
          aiClassName="border-blue-300 text-blue-700 hover:bg-blue-100"
          saveLabel={loading ? "저장 중" : "저장"}
          onSave={onAddBehaviorDetail}
          saveDisabled={!behaviorLabel.trim() || loading}
          saveClassName="bg-blue-500 text-white hover:bg-blue-600"
          isSaving={loading}
          saveIcon={<Save className="size-4 mr-1" />}
          savingIcon={<Loader2 className="size-4 mr-1 animate-spin" />}
        />
        {!manualMode && (
          <div className="space-y-3">
            {aiStep === "select-thought" && (
              <SelectionPanel
                title="자동사고 선택"
                description="행동 반응 제안을 만들 기준 자동사고를 골라주세요."
                countText={`${details.length}개`}
                emptyText={
                  details.length === 0
                    ? "아직 자동사고가 없습니다. 먼저 자동사고를 추가해주세요."
                    : undefined
                }
              >
                {details.map((detail) => {
                  const isSelected = selectedDetailId === detail.id;
                  const emotionLabel = detail.emotion?.trim() || "감정 미선택";
                  const thoughtText = detail.automaticThought?.trim() || "-";
                  const isExpanded = expandedDetailIds.includes(detail.id);
                  return (
                    <SelectionCard
                      key={detail.id}
                      selected={isSelected}
                      onSelect={() => handleSelectDetail(detail.id)}
                      contentClassName="space-y-1"
                    >
                      <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                        {emotionLabel}
                      </span>
                      <ExpandableText
                        text={thoughtText}
                        expanded={isExpanded}
                        onToggle={() =>
                          toggleExpanded(setExpandedDetailIds, detail.id)
                        }
                      />
                    </SelectionCard>
                  );
                })}
              </SelectionPanel>
            )}
            {aiStep === "select-errors" && (
              <SelectionPanel
                title="인지오류 선택"
                description="1~2개를 선택하고 다음으로 이동해주세요."
                countText={`${errorDetails.length}개`}
                emptyText={
                  errorDetails.length === 0
                    ? "아직 인지오류가 없습니다. 먼저 인지오류를 추가해주세요."
                    : undefined
                }
              >
                {errorDetails.map((error) => {
                  const isSelected = selectedErrorIds.includes(error.id);
                  const description =
                    error.errorDescription || "설명이 없습니다.";
                  const isExpanded = expandedErrorIds.includes(error.id);
                  return (
                    <SelectionCard
                      key={error.id}
                      selected={isSelected}
                      onSelect={() => handleToggleError(error.id)}
                      contentClassName="space-y-1"
                    >
                      <p className="text-sm font-semibold text-slate-800">
                        {error.errorLabel}
                      </p>
                      <ExpandableText
                        text={description}
                        expanded={isExpanded}
                        onToggle={() =>
                          toggleExpanded(setExpandedErrorIds, error.id)
                        }
                      />
                    </SelectionCard>
                  );
                })}
              </SelectionPanel>
            )}
            {aiStep === "select-alternative" && (
              <SelectionPanel
                title="대안적 접근 선택"
                description="1개를 선택한 뒤 다음을 눌러주세요."
                countText={`${alternatives.length}개`}
                emptyText={
                  alternatives.length === 0
                    ? "아직 대안적 접근이 없습니다. 먼저 추가해주세요."
                    : undefined
                }
                emptyTextClassName="text-sm"
              >
                {alternatives.map((alternative) => {
                  const isSelected = selectedAlternativeId === alternative.id;
                  const text = alternative.alternative?.trim() || "-";
                  const isExpanded = expandedAlternativeIds.includes(
                    alternative.id,
                  );
                  return (
                    <SelectionCard
                      key={alternative.id}
                      selected={isSelected}
                      onSelect={() => handleSelectAlternative(alternative.id)}
                      contentClassName="space-y-1"
                    >
                      <ExpandableText
                        text={text}
                        expanded={isExpanded}
                        onToggle={() =>
                          toggleExpanded(
                            setExpandedAlternativeIds,
                            alternative.id,
                          )
                        }
                      />
                    </SelectionCard>
                  );
                })}
              </SelectionPanel>
            )}
          </div>
        )}
        {manualMode && (
          <div>
            <p className="text-xs text-slate-600 mb-2">행동 반응 선택</p>
            <BehaviorSelector
              value={behaviorLabel}
              onSelect={onChangeBehaviorLabel}
            />
          </div>
        )}
        {showAiSelectionSummary && behaviorLabel.trim() && (
          <div>
            <p className="text-xs text-slate-600 mb-2">선택된 행동</p>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              {behaviorLabel}
            </div>
          </div>
        )}
        {(manualMode || hasAiSuggestions) && (
          <Textarea
            value={behaviorDescription}
            onChange={(e) => onChangeBehaviorDescription(e.target.value)}
            placeholder="행동 반응 설명"
            className="min-h-[120px] border-blue-200 bg-white/90 px-3 py-2 text-[16px] leading-[1.85]"
          />
        )}
        {manualMode && (
          <div>
            <p className="text-xs text-slate-600 mb-2">
              인지오류 태그 선택 (복수 가능)
            </p>
            <div className="flex flex-wrap gap-2">
              {COGNITIVE_ERRORS.map((error) => {
                const selected = behaviorErrorTags.includes(error.title);
                const meta = getCognitiveErrorMeta(error.title);
                return (
                  <button
                    key={error.id}
                    type="button"
                    onClick={() => {
                      if (selected) {
                        onChangeBehaviorErrorTags(
                          behaviorErrorTags.filter(
                            (tag) => tag !== error.title,
                          ),
                        );
                        return;
                      }
                      onChangeBehaviorErrorTags([
                        ...behaviorErrorTags,
                        error.title,
                      ]);
                    }}
                    className={`px-3 py-1 text-xs rounded-full border transition-all duration-150 focus-visible:outline-none ${
                      selected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                        : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-sm active:scale-95"
                    }`}
                  >
                    <span className="inline-flex items-center gap-1">
                      <span>{error.title}</span>
                      {selected && meta && (
                        <CognitiveErrorInfoPopover
                          errorLabel={meta.title}
                          align="start"
                          caption="태그 설명"
                          tone="blue"
                        >
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(event) => event.stopPropagation()}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.stopPropagation();
                              }
                            }}
                            className="inline-flex items-center justify-center rounded-full bg-white/20 p-0.5 text-white/90 hover:text-white"
                            aria-label={`${meta.title} 설명 보기`}
                          >
                            <Info className="size-3" />
                          </span>
                        </CognitiveErrorInfoPopover>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {showAiSelectionSummary && behaviorErrorTags.length > 0 && (
          <div>
            <p className="text-xs text-slate-600 mb-2">인지오류 태그</p>
            <div className="flex flex-wrap gap-2">
              {behaviorErrorTags.map((tag) => {
                const meta = getCognitiveErrorMeta(tag);
                return (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full border border-indigo-600 bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-md"
                  >
                    <span>{tag}</span>
                    {meta && (
                      <span className="inline-flex items-center justify-center rounded-full bg-white/20 p-0.5 text-white/90">
                        <Info className="size-3" />
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        )}
        <div className="space-y-2">
          {aiLoading && (
            <AiLoadingCard
              title="행동 반응 생성 중"
              description="선택한 내용을 기반으로 행동 제안을 만들고 있어요."
            />
          )}
          {!aiLoading && aiError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {aiError}
            </div>
          )}
          {!aiLoading && hasAiSuggestions && (
            <AiCandidatesPanel
              title="AI 행동 반응 후보"
              description="클릭하면 설명이 입력창에 적용됩니다."
              countText={`${behaviorCandidates.length}개 추천`}
            >
              {behaviorCandidates.map((item, index) => {
                const suggestion = suggestionsById[item.behavior.id] ?? "";
                const isSelected =
                  behaviorLabel.trim() === item.behavior.replacement_title &&
                  behaviorDescription.trim() === suggestion.trim();
                return (
                  <button
                    key={item.behavior.id}
                    type="button"
                    onClick={() =>
                      applySuggestion(item.behavior.id, suggestion)
                    }
                    className={[
                      "group flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left transition",
                      "bg-white hover:border-blue-300 hover:bg-blue-50/70",
                      isSelected
                        ? "border-blue-400 bg-blue-50/80"
                        : "border-blue-100",
                    ].join(" ")}
                    aria-pressed={isSelected}
                  >
                    <span
                      className={[
                        "mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold",
                        isSelected
                          ? "bg-blue-500 text-white"
                          : "bg-blue-100 text-blue-800",
                      ].join(" ")}
                    >
                      {index + 1}
                    </span>
                    <div className="flex-1 space-y-2">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-800">
                          {item.behavior.replacement_title}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {item.tags.map((tag) => (
                            <span
                              key={`${item.behavior.id}-${tag}`}
                              className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {suggestion || "AI 응답을 기다리는 중입니다."}
                      </p>
                    </div>
                    <span
                      className={[
                        "mt-0.5 inline-flex items-center gap-1 text-xs font-semibold",
                        isSelected
                          ? "text-blue-700"
                          : "text-slate-400 group-hover:text-blue-700",
                      ].join(" ")}
                    >
                      {isSelected ? (
                        <>
                          <Check className="size-3" />
                          적용됨
                        </>
                      ) : (
                        "적용"
                      )}
                    </span>
                  </button>
                );
              })}
            </AiCandidatesPanel>
          )}
        </div>
        <FloatingStepNav
          show={showFloatingNext}
          onNext={handleNextStep}
          nextDisabled={nextDisabled}
          showBack={showBackButton}
          onBack={handleBackStep}
          tone="blue"
        />
    </PatternAddSectionShell>
  );
}
