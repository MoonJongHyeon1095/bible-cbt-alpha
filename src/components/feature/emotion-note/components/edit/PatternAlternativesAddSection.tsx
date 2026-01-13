import { Lightbulb, Loader2, Save, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { generateContextualAlternativeThoughts } from "../../../../../lib/ai";
import { Button } from "../../../../ui/button";
import { DialogClose } from "../../../../ui/dialog";
import { Textarea } from "../../../../ui/textarea";
import type { PatternDetail, PatternErrorDetail } from "../../types";
import { AiCandidatesPanel } from "./common/AiCandidatesPanel";
import { AiLoadingCard } from "./common/AiLoadingCard";
import { ExpandableText } from "./common/ExpandableText";
import { FloatingStepNav } from "./common/FloatingStepNav";
import { SelectionCard } from "./common/SelectionCard";
import { SelectionPanel } from "./common/SelectionPanel";

interface PatternAlternativesAddSectionProps {
  triggerText: string;
  details: PatternDetail[];
  errorDetails: PatternErrorDetail[];
  alternativeText: string;
  loading: boolean;
  onChangeAlternativeText: (value: string) => void;
  onAddAlternative: () => void;
}

export function PatternAlternativesAddSection({
  triggerText,
  details,
  errorDetails,
  alternativeText,
  loading,
  onChangeAlternativeText,
  onAddAlternative,
}: PatternAlternativesAddSectionProps) {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStep, setAiStep] = useState<
    "idle" | "select-thought" | "select-errors" | "loading" | "suggestions"
  >("idle");
  const [aiCandidates, setAiCandidates] = useState<
    Array<{
      thought: string;
      technique: string;
      techniqueDescription: string;
    }>
  >([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [selectedDetailId, setSelectedDetailId] = useState("");
  const [selectedErrorIds, setSelectedErrorIds] = useState<string[]>([]);
  const [expandedDetailIds, setExpandedDetailIds] = useState<string[]>([]);
  const [expandedErrorIds, setExpandedErrorIds] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const hasCandidates = aiCandidates.length > 0;
  const aiButtonLabel = hasCandidates ? "다시 제안" : "AI 제안";

  useEffect(() => {
    if (
      selectedDetailId &&
      !details.some((detail) => detail.id === selectedDetailId)
    ) {
      setSelectedDetailId("");
    }
  }, [details, selectedDetailId]);

  useEffect(() => {
    if (selectedErrorIds.length > 0) {
      setSelectedErrorIds((prev) =>
        prev.filter((id) => errorDetails.some((error) => error.id === id))
      );
    }
  }, [errorDetails, selectedErrorIds.length]);

  useEffect(() => {
    setAiCandidates([]);
    setAiError(null);
  }, [triggerText, selectedDetailId]);


  const formatErrorLabel = (error: PatternErrorDetail) => {
    const label = error.errorLabel?.trim() || "인지오류";
    return label.length > 24 ? `${label.slice(0, 24)}…` : label;
  };

  const startAiSelection = () => {
    setSelectedDetailId("");
    setSelectedErrorIds([]);
    setAiCandidates([]);
    setAiError(null);
    setAiStep("select-thought");
    onChangeAlternativeText("");
  };

  const handleSelectDetail = (detailId: string) => {
    setSelectedDetailId(detailId);
    setSelectedErrorIds([]);
  };

  const toggleDetailExpanded = (detailId: string) => {
    setExpandedDetailIds((prev) =>
      prev.includes(detailId)
        ? prev.filter((id) => id !== detailId)
        : [...prev, detailId]
    );
  };

  const toggleErrorExpanded = (errorId: string) => {
    setExpandedErrorIds((prev) =>
      prev.includes(errorId)
        ? prev.filter((id) => id !== errorId)
        : [...prev, errorId]
    );
  };

  const handleToggleError = (errorId: string) => {
    setSelectedErrorIds((prev) => {
      if (prev.includes(errorId)) {
        return prev.filter((id) => id !== errorId);
      }
      if (prev.length >= 2) {
        return prev;
      }
      return [...prev, errorId];
    });
  };

  const handleGenerateCandidates = async (
    detailId: string,
    errorIds: string[]
  ) => {
    const detail = details.find((item) => item.id === detailId) ?? null;
    if (!detail) return;
    const errors = errorDetails.filter((error) => errorIds.includes(error.id));
    if (errors.length === 0) return;

    setAiLoading(true);
    setAiError(null);
    setAiStep("loading");
    try {
      const result = await generateContextualAlternativeThoughts(
        triggerText,
        detail.emotion,
        detail.automaticThought,
        errors.map((error) => ({
          title: error.errorLabel,
          detail: error.errorDescription,
        }))
      );
      setAiCandidates(result);
      setAiStep("suggestions");
    } catch (error) {
      console.error(error);
      setAiError("AI 제안을 불러오지 못했습니다.");
      setAiStep("select-errors");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSelectCandidate = (thought: string) => {
    onChangeAlternativeText(thought);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  };

  const manualMode = aiStep === "idle";
  const showFloatingNext =
    aiStep === "select-thought" || aiStep === "select-errors";
  const nextDisabled =
    (aiStep === "select-thought" && !selectedDetailId) ||
    (aiStep === "select-errors" && selectedErrorIds.length === 0);
  const showBackButton = aiStep === "select-errors";

  const handleNextStep = () => {
    if (aiStep === "select-thought") {
      if (!selectedDetailId) return;
      setAiStep("select-errors");
      return;
    }
    if (aiStep === "select-errors") {
      if (selectedErrorIds.length === 0) return;
      void handleGenerateCandidates(selectedDetailId, selectedErrorIds);
    }
  };

  const handleBackStep = () => {
    if (aiStep === "select-errors") {
      setAiStep("select-thought");
    }
  };

  return (
    <div className="border border-green-200 rounded-xl bg-white shadow-sm">
      <div className="border-b border-green-200 px-4 py-3 text-sm font-semibold text-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="size-4" />
          대안적 접근 추가
        </div>
        <DialogClose asChild>
          <button
            type="button"
            className="rounded-full border border-green-200 bg-white p-2 text-green-700 transition hover:bg-green-50"
            aria-label="닫기"
          >
            <X className="size-4" />
          </button>
        </DialogClose>
      </div>
      <div className="p-5 space-y-4 bg-green-50/70">
        <div className="flex items-center justify-between gap-2 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={startAiSelection}
              disabled={loading || aiLoading}
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              <Sparkles className="size-4 mr-1" />
              {aiButtonLabel}
            </Button>
            <Button
              size="sm"
              onClick={onAddAlternative}
              disabled={!alternativeText.trim() || loading}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              {loading ? (
                <Loader2 className="size-4 mr-1 animate-spin" />
              ) : (
                <Save className="size-4 mr-1" />
              )}
              {loading ? "저장 중" : "저장"}
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          {aiStep === "select-thought" && (
            <SelectionPanel
              title="자동사고 선택"
              description="대안사고를 만들 기준이 되는 자동사고를 골라주세요."
              countText={`${details.length}개`}
              emptyText={
                details.length === 0
                  ? "아직 자동사고가 없습니다. 먼저 자동사고를 추가해주세요."
                  : undefined
              }
              tone="green"
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
                    tone="green"
                  >
                    <span className="inline-flex items-center rounded-full border border-green-100 bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                      {emotionLabel}
                    </span>
                    <ExpandableText
                      text={thoughtText}
                      expanded={isExpanded}
                      onToggle={() => toggleDetailExpanded(detail.id)}
                      tone="green"
                    />
                  </SelectionCard>
                );
              })}
            </SelectionPanel>
          )}
          {aiStep === "select-errors" && (
            <SelectionPanel
              title="인지오류 선택"
              description="1~2개를 선택한 뒤 다음을 눌러주세요."
              countText={`${errorDetails.length}개`}
              emptyText={
                errorDetails.length === 0
                  ? "아직 인지오류가 없습니다. 먼저 인지오류를 추가해주세요."
                  : undefined
              }
              tone="green"
            >
              {errorDetails.map((error) => {
                const isSelected = selectedErrorIds.includes(error.id);
                const description = error.errorDescription || "설명이 없습니다.";
                const isExpanded = expandedErrorIds.includes(error.id);
                return (
                  <SelectionCard
                    key={error.id}
                    selected={isSelected}
                    onSelect={() => handleToggleError(error.id)}
                    contentClassName="space-y-1"
                    tone="green"
                  >
                    <p className="text-sm font-semibold text-slate-800">
                      {formatErrorLabel(error)}
                    </p>
                    <ExpandableText
                      text={description}
                      expanded={isExpanded}
                      onToggle={() => toggleErrorExpanded(error.id)}
                      tone="green"
                    />
                  </SelectionCard>
                );
              })}
            </SelectionPanel>
          )}
        </div>
        {(manualMode || aiStep === "suggestions") && (
          <Textarea
            ref={textareaRef}
            value={alternativeText}
            onChange={(e) => onChangeAlternativeText(e.target.value)}
            placeholder="대안적 사고를 적어주세요."
            className="min-h-[120px] border-green-200 bg-white/90 px-3 py-2 text-[16px] leading-[1.85]"
          />
        )}
        <div className="space-y-2">
          {aiLoading && (
            <AiLoadingCard
              title="대안사고 생성 중"
              description="선택한 자동사고와 인지오류를 반영하고 있어요."
              tone="green"
            />
          )}
          {!aiLoading && aiError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {aiError}
            </div>
          )}
          {!aiLoading && hasCandidates && (
            <AiCandidatesPanel
              title="AI 대안사고 후보"
              description="클릭하면 입력창에 바로 적용됩니다."
              countText={`${aiCandidates.length}개 추천`}
              tone="green"
            >
              {aiCandidates.map((candidate, index) => {
                const isSelected =
                  alternativeText.trim().length > 0 &&
                  alternativeText.trim() === candidate.thought.trim();
                return (
                  <SelectionCard
                    key={`${candidate.thought}-${index}`}
                    selected={isSelected}
                    onSelect={() => handleSelectCandidate(candidate.thought)}
                    contentClassName="space-y-2"
                    tone="green"
                  >
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {candidate.thought}
                    </p>
                    <div className="rounded-lg border border-green-100 bg-green-50/60 px-3 py-2 text-xs text-green-800">
                      <span className="font-semibold">
                        {candidate.technique}
                      </span>
                      <span className="text-slate-500">
                        {" "}
                        · {candidate.techniqueDescription}
                      </span>
                    </div>
                  </SelectionCard>
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
          tone="green"
        />
      </div>
    </div>
  );
}
