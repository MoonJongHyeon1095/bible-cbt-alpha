import { AlertCircle, Loader2, Save, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { COGNITIVE_ERRORS } from "../../../../../constants/errors";
import { analyzeCognitiveErrorDetails } from "../../../../../lib/ai";
import { Button } from "../../../../ui/button";
import { Textarea } from "../../../../ui/textarea";
import type { PatternDetail } from "../../types";
import { ErrorSelector } from "./PatternSelectors";

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
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSelectingThought, setAiSelectingThought] = useState(false);
  const [selectedDetailId, setSelectedDetailId] = useState("");
  const [expandedDetailIds, setExpandedDetailIds] = useState<string[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setAiSelectingThought(false);
    setSelectedDetailId("");
    setAiSuggestion(null);
  }, [errorLabel, details]);

  const toggleDetailExpanded = (detailId: string) => {
    setExpandedDetailIds((prev) =>
      prev.includes(detailId)
        ? prev.filter((id) => id !== detailId)
        : [...prev, detailId]
    );
  };

  const handleAiSuggest = () => {
    if (!errorLabel.trim()) {
      toast.error("인지오류를 먼저 선택해주세요.");
      return;
    }
    if (details.length === 0) {
      toast.error("자동사고를 먼저 추가해주세요.");
      return;
    }
    if (aiSuggestion && selectedDetailId) {
      handleAiGenerate(selectedDetailId);
      return;
    }
    setAiSelectingThought(true);
  };

  const handleAiGenerate = async (detailId: string) => {
    if (aiLoading) return;
    const selected = details.find((detail) => detail.id === detailId);
    if (!selected) {
      toast.error("자동사고를 선택해주세요.");
      return;
    }

    const meta = COGNITIVE_ERRORS.find((error) => error.title === errorLabel);
    if (!meta) {
      toast.error("인지오류를 먼저 선택해주세요.");
      return;
    }

    setSelectedDetailId(detailId);
    setAiSelectingThought(false);
    setAiLoading(true);
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
    } catch (error) {
      console.error(error);
      toast.error("AI 제안을 불러오지 못했습니다.");
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

  return (
    <div className="border border-rose-200 rounded-xl bg-white shadow-sm">
      <div className="border-b border-rose-200 px-4 py-3 text-sm font-semibold text-slate-800 flex items-center gap-2">
        <AlertCircle className="size-4" />
        인지오류 추가
      </div>
      <div className="p-5 space-y-4 bg-rose-50/70">
        <div className="flex items-center justify-between gap-2 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleAiSuggest}
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
              {loading ? (
                <Loader2 className="size-4 mr-1 animate-spin" />
              ) : (
                <Save className="size-4 mr-1" />
              )}
              {loading ? "저장 중" : "저장"}
            </Button>
          </div>
        </div>
        <div>
          <p className="text-xs text-slate-600 mb-2">인지오류 선택</p>
          <ErrorSelector value={errorLabel} onSelect={onChangeErrorLabel} />
        </div>
        {aiSelectingThought && (
          <div className="rounded-xl border border-rose-200 bg-white/95 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-rose-900">
                  자동사고 선택
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  선택한 자동사고를 기준으로 인지오류 설명을 생성합니다.
                </p>
              </div>
              <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-800">
                {details.length}개
              </span>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {details.map((detail) => {
                const isSelected = selectedDetailId === detail.id;
                const emotionLabel = detail.emotion?.trim() || "감정 미선택";
                const thoughtText = detail.automaticThought?.trim() || "-";
                const isExpanded = expandedDetailIds.includes(detail.id);
                return (
                  <div
                    key={detail.id}
                    onClick={() => handleAiGenerate(detail.id)}
                    className={[
                      "group flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left transition",
                      "bg-white hover:border-rose-300 hover:bg-rose-50/70",
                      isSelected
                        ? "border-rose-400 bg-rose-50/80"
                        : "border-rose-100",
                    ].join(" ")}
                    aria-pressed={isSelected}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleAiGenerate(detail.id);
                      }
                    }}
                  >
                    <div className="flex-1 space-y-1">
                      <span className="inline-flex items-center rounded-full border border-rose-100 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                        {emotionLabel}
                      </span>
                      <p
                        className={[
                          "text-sm text-slate-700 leading-relaxed",
                          isExpanded ? "whitespace-pre-line" : "line-clamp-2",
                        ].join(" ")}
                      >
                        {thoughtText}
                      </p>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleDetailExpanded(detail.id);
                        }}
                        className="text-xs font-semibold text-rose-700 hover:underline"
                      >
                        {isExpanded ? "접기" : "더보기"}
                      </button>
                    </div>
                    <span
                      className={[
                        "mt-0.5 text-xs font-semibold",
                        isSelected
                          ? "text-rose-700"
                          : "text-slate-400 group-hover:text-rose-700",
                      ].join(" ")}
                    >
                      {isSelected ? "선택됨" : "선택"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <Textarea
          ref={textareaRef}
          value={errorDescription}
          onChange={(e) => onChangeErrorDescription(e.target.value)}
          placeholder="인지오류 설명"
          className="min-h-[120px] border-rose-200 bg-white/90 px-3 py-2 text-[16px] leading-[1.85]"
        />
        {!aiLoading && aiSuggestion && (
          <div className="rounded-2xl border border-rose-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-rose-900">
                  AI 인지오류 제안
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  클릭하면 입력창에 바로 적용됩니다.
                </p>
              </div>
            </div>
            <div className="mt-3">
              <button
                type="button"
                onClick={handleApplySuggestion}
                className={[
                  "group flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left transition",
                  "bg-white hover:border-rose-300 hover:bg-rose-50/70",
                  errorDescription.trim() === aiSuggestion.trim()
                    ? "border-rose-400 bg-rose-50/80"
                    : "border-rose-100",
                ].join(" ")}
                aria-pressed={errorDescription.trim() === aiSuggestion.trim()}
              >
                <span className="flex-1 text-sm text-slate-700 leading-relaxed">
                  {aiSuggestion}
                </span>
                <span
                  className={[
                    "mt-0.5 inline-flex items-center gap-1 text-xs font-semibold",
                    errorDescription.trim() === aiSuggestion.trim()
                      ? "text-rose-700"
                      : "text-slate-400 group-hover:text-rose-700",
                  ].join(" ")}
                >
                  {errorDescription.trim() === aiSuggestion.trim()
                    ? "적용됨"
                    : "적용"}
                </span>
              </button>
            </div>
          </div>
        )}
        {aiLoading && (
          <div className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Loader2 className="size-5 animate-spin text-rose-500" />
              <div>
                <p className="text-slate-900 font-semibold">
                  인지오류 설명 생성 중
                </p>
                <p className="text-sm text-slate-500">
                  선택한 자동사고를 정교하게 분석하고 있어요.
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2 animate-pulse">
              <div className="h-3 rounded-full bg-rose-100 w-5/6" />
              <div className="h-3 rounded-full bg-rose-100 w-4/6" />
              <div className="h-3 rounded-full bg-rose-100 w-3/6" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
