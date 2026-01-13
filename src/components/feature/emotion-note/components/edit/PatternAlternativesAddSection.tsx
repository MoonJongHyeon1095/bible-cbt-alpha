import { Check, Lightbulb, Loader2, Save, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { generateContextualAlternativeThoughts } from "../../../../../lib/ai";
import { Button } from "../../../../ui/button";
import { Textarea } from "../../../../ui/textarea";
import type { PatternDetail, PatternErrorDetail } from "../../types";

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
  const generateTimerRef = useRef<number | null>(null);
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

  useEffect(() => {
    return () => {
      if (generateTimerRef.current) {
        window.clearTimeout(generateTimerRef.current);
        generateTimerRef.current = null;
      }
    };
  }, []);

  const formatErrorLabel = (error: PatternErrorDetail) => {
    const label = error.errorLabel?.trim() || "인지오류";
    return label.length > 24 ? `${label.slice(0, 24)}…` : label;
  };

  const startAiSelection = () => {
    if (!triggerText.trim()) {
      toast.error("먼저 트리거 내용을 입력해주세요.");
      return;
    }
    if (details.length === 0) {
      toast.error("자동사고를 먼저 추가해주세요.");
      return;
    }
    if (errorDetails.length === 0) {
      toast.error("인지오류를 먼저 추가해주세요.");
      return;
    }
    if (generateTimerRef.current) {
      window.clearTimeout(generateTimerRef.current);
      generateTimerRef.current = null;
    }
    setSelectedDetailId("");
    setSelectedErrorIds([]);
    setAiCandidates([]);
    setAiError(null);
    setAiStep("select-thought");
  };

  const handleSelectDetail = (detailId: string) => {
    if (generateTimerRef.current) {
      window.clearTimeout(generateTimerRef.current);
      generateTimerRef.current = null;
    }
    setSelectedDetailId(detailId);
    setSelectedErrorIds([]);
    setAiStep("select-errors");
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

  const scheduleGenerate = (detailId: string, errorIds: string[]) => {
    if (generateTimerRef.current) {
      window.clearTimeout(generateTimerRef.current);
    }
    if (errorIds.length === 0) return;
    generateTimerRef.current = window.setTimeout(() => {
      void handleGenerateCandidates(detailId, errorIds);
    }, 300);
  };

  const handleToggleError = (errorId: string) => {
    setSelectedErrorIds((prev) => {
      if (prev.includes(errorId)) {
        const next = prev.filter((id) => id !== errorId);
        if (selectedDetailId) {
          scheduleGenerate(selectedDetailId, next);
        }
        return next;
      }
      if (prev.length >= 2) {
        toast.error("인지오류는 최대 2개까지 선택할 수 있어요.");
        return prev;
      }
      const next = [...prev, errorId];
      if (selectedDetailId) {
        scheduleGenerate(selectedDetailId, next);
      }
      return next;
    });
  };

  const handleGenerateCandidates = async (
    detailId: string,
    errorIds: string[]
  ) => {
    if (!triggerText.trim()) {
      toast.error("먼저 트리거 내용을 입력해주세요.");
      return;
    }
    if (details.length === 0) {
      toast.error("자동사고를 먼저 추가해주세요.");
      return;
    }
    if (errorDetails.length === 0) {
      toast.error("인지오류를 먼저 추가해주세요.");
      return;
    }
    const detail = details.find((item) => item.id === detailId) ?? null;
    if (!detail) {
      toast.error("자동사고를 1개 선택해주세요.");
      return;
    }
    const errors = errorDetails.filter((error) => errorIds.includes(error.id));
    if (errors.length === 0) {
      toast.error("인지오류를 1~2개 선택해주세요.");
      return;
    }

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
      if (result.length === 0) {
        toast.info("추천할 대안사고 후보가 없습니다.");
      }
      setAiStep("suggestions");
    } catch (error) {
      console.error(error);
      setAiError("AI 제안을 불러오지 못했습니다.");
      toast.error("AI 제안을 불러오지 못했습니다.");
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

  return (
    <div className="border border-green-200 rounded-xl bg-white shadow-sm">
      <div className="border-b border-green-200 px-4 py-3 text-sm font-semibold text-slate-800 flex items-center gap-2">
        <Lightbulb className="size-4" />
        대안적 접근 추가
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
            <div className="rounded-xl border border-green-200 bg-white/95 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-green-900">
                    자동사고 선택
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    대안사고를 만들 기준이 되는 자동사고를 골라주세요.
                  </p>
                </div>
                <span className="rounded-full border border-green-200 bg-green-50 px-2 py-1 text-[11px] font-semibold text-green-800">
                  {details.length}개
                </span>
              </div>
              {details.length === 0 ? (
                <p className="text-xs text-slate-500 mt-3">
                  아직 자동사고가 없습니다. 먼저 자동사고를 추가해주세요.
                </p>
              ) : (
                <div className="mt-3 flex flex-col gap-2">
                  {details.map((detail) => {
                    const isSelected = selectedDetailId === detail.id;
                    const emotionLabel =
                      detail.emotion?.trim() || "감정 미선택";
                    const thoughtText = detail.automaticThought?.trim() || "-";
                    const isExpanded = expandedDetailIds.includes(detail.id);
                    const isExpandable = thoughtText.length > 0;
                    return (
                      <div
                        key={detail.id}
                        onClick={() => handleSelectDetail(detail.id)}
                        className={[
                          "group flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left transition",
                          "bg-white hover:border-green-300 hover:bg-green-50/70",
                          isSelected
                            ? "border-green-400 bg-green-50/80"
                            : "border-green-100",
                        ].join(" ")}
                        aria-pressed={isSelected}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleSelectDetail(detail.id);
                          }
                        }}
                      >
                        <div className="flex-1 space-y-1">
                          <span className="inline-flex items-center rounded-full border border-green-100 bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                            {emotionLabel}
                          </span>
                          <p
                            className={[
                              "text-sm text-slate-700 leading-relaxed",
                              isExpanded
                                ? "whitespace-pre-line"
                                : "line-clamp-2",
                            ].join(" ")}
                          >
                            {thoughtText}
                          </p>
                          {isExpandable && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                toggleDetailExpanded(detail.id);
                              }}
                              className="text-xs font-semibold text-green-700 hover:underline"
                            >
                              {isExpanded ? "접기" : "더보기"}
                            </button>
                          )}
                        </div>
                        <span
                          className={[
                            "mt-0.5 text-xs font-semibold",
                            isSelected
                              ? "text-green-700"
                              : "text-slate-400 group-hover:text-green-700",
                          ].join(" ")}
                        >
                          {isSelected ? "선택됨" : "선택"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {aiStep === "select-errors" && (
            <div className="rounded-xl border border-green-200 bg-white/95 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-green-900">
                    인지오류 선택
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    1~2개를 선택하면 제안을 바로 생성합니다.
                  </p>
                </div>
                <span className="rounded-full border border-green-200 bg-green-50 px-2 py-1 text-[11px] font-semibold text-green-800">
                  {errorDetails.length}개
                </span>
              </div>
              {errorDetails.length === 0 ? (
                <p className="text-xs text-slate-500 mt-3">
                  아직 인지오류가 없습니다. 먼저 인지오류를 추가해주세요.
                </p>
              ) : (
                <div className="mt-3 flex flex-col gap-2">
                  {errorDetails.map((error) => {
                    const isSelected = selectedErrorIds.includes(error.id);
                    const description =
                      error.errorDescription || "설명이 없습니다.";
                    const isExpanded = expandedErrorIds.includes(error.id);
                    return (
                      <button
                        key={error.id}
                        type="button"
                        onClick={() => handleToggleError(error.id)}
                        className={[
                          "group flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left transition",
                          "bg-white hover:border-green-300 hover:bg-green-50/70",
                          isSelected
                            ? "border-green-400 bg-green-50/80"
                            : "border-green-100",
                        ].join(" ")}
                        aria-pressed={isSelected}
                      >
                        <span
                          className={[
                            "mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold",
                            isSelected
                              ? "bg-green-500 text-white"
                              : "bg-green-100 text-green-800",
                          ].join(" ")}
                        >
                          {isSelected ? <Check className="size-3" /> : ""}
                        </span>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-semibold text-slate-800">
                            {formatErrorLabel(error)}
                          </p>
                          <p
                            className={[
                              "text-sm text-slate-600 leading-relaxed",
                              isExpanded
                                ? "whitespace-pre-line"
                                : "line-clamp-2",
                            ].join(" ")}
                          >
                            {description}
                          </p>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleErrorExpanded(error.id);
                            }}
                            className="text-xs font-semibold text-green-700 hover:underline"
                          >
                            {isExpanded ? "접기" : "더보기"}
                          </button>
                        </div>
                        <span
                          className={[
                            "mt-0.5 text-xs font-semibold",
                            isSelected
                              ? "text-green-700"
                              : "text-slate-400 group-hover:text-green-700",
                          ].join(" ")}
                        >
                          {isSelected ? "선택됨" : "선택"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        <Textarea
          ref={textareaRef}
          value={alternativeText}
          onChange={(e) => onChangeAlternativeText(e.target.value)}
          placeholder="대안적 사고를 적어주세요."
          className="min-h-[120px] border-green-200 bg-white/90 px-3 py-2 text-[16px] leading-[1.85]"
        />
        <div className="space-y-2">
          {aiLoading && (
            <div className="rounded-2xl border border-green-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <Loader2 className="size-5 animate-spin text-green-500" />
                <div>
                  <p className="text-slate-900 font-semibold">
                    대안사고 생성 중
                  </p>
                  <p className="text-sm text-slate-500">
                    선택한 자동사고와 인지오류를 반영하고 있어요.
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2 animate-pulse">
                <div className="h-3 rounded-full bg-green-100 w-5/6" />
                <div className="h-3 rounded-full bg-green-100 w-4/6" />
                <div className="h-3 rounded-full bg-green-100 w-3/6" />
              </div>
            </div>
          )}
          {!aiLoading && aiError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {aiError}
            </div>
          )}
          {!aiLoading && hasCandidates && (
            <div className="rounded-xl border border-green-200 bg-white/95 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-green-900">
                    AI 대안사고 후보
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    클릭하면 입력창에 바로 적용됩니다.
                  </p>
                </div>
                <span className="rounded-full border border-green-200 bg-green-50 px-2 py-1 text-[11px] font-semibold text-green-800">
                  {aiCandidates.length}개 추천
                </span>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {aiCandidates.map((candidate, index) => {
                  const isSelected =
                    alternativeText.trim().length > 0 &&
                    alternativeText.trim() === candidate.thought.trim();
                  return (
                    <button
                      key={`${candidate.thought}-${index}`}
                      type="button"
                      onClick={() => handleSelectCandidate(candidate.thought)}
                      className={[
                        "group flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left transition",
                        "bg-white hover:border-green-300 hover:bg-green-50/70",
                        isSelected
                          ? "border-green-400 bg-green-50/80"
                          : "border-green-100",
                      ].join(" ")}
                      aria-pressed={isSelected}
                    >
                      <span
                        className={[
                          "mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold",
                          isSelected
                            ? "bg-green-500 text-white"
                            : "bg-green-100 text-green-800",
                        ].join(" ")}
                      >
                        {index + 1}
                      </span>
                      <div className="flex-1 space-y-2">
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
                      </div>
                      <span
                        className={[
                          "mt-0.5 inline-flex items-center gap-1 text-xs font-semibold",
                          isSelected
                            ? "text-green-700"
                            : "text-slate-400 group-hover:text-green-700",
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
