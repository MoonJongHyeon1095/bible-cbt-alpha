import { AlertCircle, Save, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { COGNITIVE_ERRORS } from "../../../../../constants/errors";
import { analyzeCognitiveErrorDetails } from "../../../../../lib/ai";
import { Button } from "../../../../ui/button";
import { DialogClose } from "../../../../ui/dialog";
import { Textarea } from "../../../../ui/textarea";
import type { PatternDetail } from "../../types";
import { AiCandidatesPanel } from "./common/AiCandidatesPanel";
import { AiLoadingCard } from "./common/AiLoadingCard";
import { ExpandableText } from "./common/ExpandableText";
import { FloatingStepNav } from "./common/FloatingStepNav";
import { SelectionCard } from "./common/SelectionCard";
import { SelectionPanel } from "./common/SelectionPanel";
import { TagSelector } from "./common/TagSelector";

interface PatternErrorAddSectionProps {
  triggerText: string;
  details: PatternDetail[];
  errorLabel: string;
  errorDescription: string;
  loading: boolean;
  onChangeErrorLabel: (value: string) => void;
  onChangeErrorDescription: (value: string) => void;
  onAddErrorDetail: () => void;
}

export function PatternErrorAddSection({
  triggerText,
  details,
  errorLabel,
  errorDescription,
  loading,
  onChangeErrorLabel,
  onChangeErrorDescription,
  onAddErrorDetail,
}: PatternErrorAddSectionProps) {
  const [aiStep, setAiStep] = useState<
    "idle" | "select-error" | "select-thought" | "loading" | "suggestions"
  >("idle");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [selectedDetailId, setSelectedDetailId] = useState("");
  const [expandedDetailIds, setExpandedDetailIds] = useState<string[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setSelectedDetailId("");
    setAiSuggestion(null);
    setAiError(null);
  }, [errorLabel, details]);

  const toggleDetailExpanded = (detailId: string) => {
    setExpandedDetailIds((prev) =>
      prev.includes(detailId)
        ? prev.filter((id) => id !== detailId)
        : [...prev, detailId]
    );
  };

  const startAiSelection = () => {
    setSelectedDetailId("");
    setAiSuggestion(null);
    setAiError(null);
    onChangeErrorDescription("");
    if (errorLabel.trim()) {
      setAiStep("select-thought");
      return;
    }
    setAiStep("select-error");
  };

  const handleAiGenerate = async (detailId: string) => {
    if (aiLoading) return;
    const selected = details.find((detail) => detail.id === detailId);
    const meta = COGNITIVE_ERRORS.find((error) => error.title === errorLabel);
    if (!selected || !meta) return;

    setAiLoading(true);
    setAiError(null);
    setAiStep("loading");
    try {
      const result = await analyzeCognitiveErrorDetails(
        triggerText,
        selected.automaticThought,
        [meta.index]
      );
      const analysis = result.errors[0]?.analysis;
      if (!analysis) {
        throw new Error("인지오류 분석 결과가 없습니다.");
      }
      setAiSuggestion(analysis);
      setAiStep("suggestions");
    } catch (error) {
      console.error(error);
      setAiError("AI 제안을 불러오지 못했습니다.");
      setAiStep("select-thought");
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplySuggestion = () => {
    if (!aiSuggestion) return;
    onChangeErrorDescription(aiSuggestion);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  };

  const manualMode = aiStep === "idle";
  const showFloatingNext =
    aiStep === "select-error" || aiStep === "select-thought";
  const nextDisabled =
    (aiStep === "select-error" && !errorLabel.trim()) ||
    (aiStep === "select-thought" && !selectedDetailId);
  const showBackButton = aiStep === "select-thought";
  const showSelectedError =
    !manualMode &&
    aiStep !== "select-error" &&
    errorLabel.trim();

  const handleNextStep = () => {
    if (aiStep === "select-error") {
      if (!errorLabel.trim()) return;
      setAiStep("select-thought");
      return;
    }
    if (aiStep === "select-thought") {
      if (!selectedDetailId) return;
      void handleAiGenerate(selectedDetailId);
    }
  };

  const handleBackStep = () => {
    if (aiStep === "select-thought") {
      setAiStep("select-error");
    }
  };

  return (
    <div className="border border-rose-200 rounded-xl bg-white shadow-sm">
      <div className="border-b border-rose-200 px-4 py-3 text-sm font-semibold text-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="size-4" />
          인지오류 추가
        </div>
        <DialogClose asChild>
          <button
            type="button"
            className="rounded-full border border-rose-200 bg-white p-2 text-rose-700 transition hover:bg-rose-50"
            aria-label="닫기"
          >
            <X className="size-4" />
          </button>
        </DialogClose>
      </div>
      <div className="p-5 space-y-4 bg-rose-50/70">
        <div className="flex items-center justify-between gap-2 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={startAiSelection}
              disabled={loading || aiLoading}
              className="border-rose-300 text-rose-700 hover:bg-rose-100"
            >
              <Sparkles className="size-4 mr-1" />
              {aiSuggestion ? "다시 제안" : "AI 제안"}
            </Button>
            <Button
              size="sm"
              onClick={onAddErrorDetail}
              disabled={!errorLabel.trim() || loading}
              className="bg-rose-500 text-white hover:bg-rose-600"
            >
              <Save className="size-4 mr-1" />
              {loading ? "저장 중" : "저장"}
            </Button>
          </div>
        </div>
        {(manualMode || aiStep === "select-error") && (
          <div className="space-y-2">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                인지오류 선택
              </p>
              <p className="text-xs text-slate-600">
                인지오류를 선택해주세요.
              </p>
            </div>
            <TagSelector
              options={COGNITIVE_ERRORS.map((error) => ({
                id: error.id,
                label: error.title,
              }))}
              value={errorLabel.trim()}
              onSelect={onChangeErrorLabel}
              selectedClassName="bg-rose-100 text-rose-800 border-rose-300"
              unselectedClassName="bg-white text-slate-700 border-slate-200 hover:border-rose-300 hover:bg-rose-50"
            />
          </div>
        )}
        {showSelectedError && (
          <div>
            <p className="text-xs text-slate-600 mb-2">선택된 인지오류</p>
            <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
              {errorLabel}
            </span>
          </div>
        )}
        {aiStep === "select-thought" && (
          <SelectionPanel
            title="자동사고 선택"
            description="선택한 자동사고를 기준으로 인지오류 설명을 생성합니다."
            countText={`${details.length}개`}
            emptyText={
              details.length === 0
                ? "아직 자동사고가 없습니다. 먼저 자동사고를 추가해주세요."
                : undefined
            }
            tone="rose"
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
                  onSelect={() => setSelectedDetailId(detail.id)}
                  contentClassName="space-y-1"
                  tone="rose"
                >
                  <span className="inline-flex items-center rounded-full border border-rose-100 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                    {emotionLabel}
                  </span>
                  <ExpandableText
                    text={thoughtText}
                    expanded={isExpanded}
                    onToggle={() => toggleDetailExpanded(detail.id)}
                    tone="rose"
                  />
                </SelectionCard>
              );
            })}
          </SelectionPanel>
        )}
        {(manualMode || aiStep === "suggestions") && (
          <Textarea
            ref={textareaRef}
            value={errorDescription}
            onChange={(e) => onChangeErrorDescription(e.target.value)}
            placeholder="인지오류 설명"
            className="min-h-[120px] border-rose-200 bg-white/90 px-3 py-2 text-[16px] leading-[1.85]"
          />
        )}
        {aiLoading && (
          <AiLoadingCard
            title="인지오류 설명 생성 중"
            description="선택한 자동사고를 정교하게 분석하고 있어요."
            tone="rose"
          />
        )}
        {!aiLoading && aiError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {aiError}
          </div>
        )}
        {!aiLoading && aiSuggestion && (
          <AiCandidatesPanel
            title="AI 인지오류 제안"
            description="클릭하면 입력창에 바로 적용됩니다."
            tone="rose"
          >
            <SelectionCard
              selected={errorDescription.trim() === aiSuggestion.trim()}
              onSelect={handleApplySuggestion}
              tone="rose"
            >
              <span className="flex-1 text-sm text-slate-700 leading-relaxed">
                {aiSuggestion}
              </span>
            </SelectionCard>
          </AiCandidatesPanel>
        )}
      </div>
      <FloatingStepNav
        show={showFloatingNext}
        onNext={handleNextStep}
        nextDisabled={nextDisabled}
        showBack={showBackButton}
        onBack={handleBackStep}
        tone="rose"
      />
    </div>
  );
}
