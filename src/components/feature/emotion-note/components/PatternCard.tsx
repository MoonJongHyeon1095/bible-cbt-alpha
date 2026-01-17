import {
  AlertCircle,
  Brain,
  ChevronDown,
  ChevronRight,
  Footprints,
  Info,
  Lightbulb,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAutoCloseOnScroll } from "../../common/utils/useAutoCloseOnScroll";
import { Button } from "../../../ui/button";
import type { Pattern } from "../types";
import {
  BehaviorInfoPopover,
  CognitiveErrorInfoPopover,
  EmotionInfoPopover,
  getBehaviorMeta,
  getCognitiveErrorMeta,
  getEmotionMeta,
} from "./info-popovers";
import {
  PatternContentActions,
  PatternPreviewDialog,
  PatternSectionHeader,
} from "./PatternCardParts";

type OuterSection = "details" | "errors" | "alternatives" | "behaviors";

interface PatternCardProps {
  pattern: Pattern;
  loading: boolean;
  confirmDeleteId: string | null;
  formatDate: (timestamp: string) => string;
  formatThoughtTitle: (content: string) => string;
  formatAlternativeTitle: (content: string) => string;
  formatErrorTitle: (content: string) => string;
  formatBehaviorTitle: (content: string) => string;
  expandedDetails: Record<string, boolean>;
  setExpandedDetails: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  expandedAlternatives: Record<string, boolean>;
  setExpandedAlternatives: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  expandedErrors: Record<string, boolean>;
  setExpandedErrors: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  expandedBehaviors: Record<string, boolean>;
  setExpandedBehaviors: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  getFrequencyBadgeStyle: (frequency: number) => React.CSSProperties;
  onIncrementFrequency: (id: string) => void;
  onDecrementFrequency: (id: string) => void;
  onEditTrigger: (pattern: Pattern) => void;
  onEditDetails: (pattern: Pattern) => void;
  onAddDetails: (pattern: Pattern) => void;
  onEditAlternatives: (pattern: Pattern) => void;
  onAddAlternatives: (pattern: Pattern) => void;
  onEditErrors: (pattern: Pattern) => void;
  onAddErrors: (pattern: Pattern) => void;
  onEditBehaviors: (pattern: Pattern) => void;
  onAddBehaviors: (pattern: Pattern) => void;
  onRequestDelete: (id: string) => void;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
  onDeleteDetail: (patternId: string, detailId: string) => void;
  onDeleteAlternative: (patternId: string, alternativeId: string) => void;
  onDeleteError: (patternId: string, errorId: string) => void;
  onDeleteBehavior: (patternId: string, behaviorId: string) => void;
  deletingDetails: Record<string, boolean>;
  deletingAlternatives: Record<string, boolean>;
  deletingErrors: Record<string, boolean>;
  deletingBehaviors: Record<string, boolean>;
  openOuterSection: OuterSection | null;
  onToggleOuterSection: (section: OuterSection) => void;
}

export function PatternCard({
  pattern,
  loading,
  confirmDeleteId,
  formatDate,
  formatThoughtTitle,
  formatAlternativeTitle,
  formatErrorTitle,
  formatBehaviorTitle,
  expandedDetails,
  setExpandedDetails,
  expandedAlternatives,
  setExpandedAlternatives,
  expandedErrors,
  setExpandedErrors,
  expandedBehaviors,
  setExpandedBehaviors,
  getFrequencyBadgeStyle,
  onIncrementFrequency,
  onDecrementFrequency,
  onEditTrigger,
  onEditDetails,
  onAddDetails,
  onEditAlternatives,
  onAddAlternatives,
  onEditErrors,
  onAddErrors,
  onEditBehaviors,
  onAddBehaviors,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
  onDeleteDetail,
  onDeleteAlternative,
  onDeleteError,
  onDeleteBehavior,
  deletingDetails,
  deletingAlternatives,
  deletingErrors,
  deletingBehaviors,
  openOuterSection,
  onToggleOuterSection,
}: PatternCardProps) {
  const [previewContent, setPreviewContent] = useState<{
    title: string;
    content: string;
    label?: string;
    tone?: "amber" | "rose" | "green" | "blue" | "slate";
  } | null>(null);
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const errorsRef = useRef<HTMLDivElement | null>(null);
  const alternativesRef = useRef<HTMLDivElement | null>(null);
  const behaviorsRef = useRef<HTMLDivElement | null>(null);
  const isDetailsOpen = openOuterSection === "details";
  const isErrorsOpen = openOuterSection === "errors";
  const isAlternativesOpen = openOuterSection === "alternatives";
  const isBehaviorsOpen = openOuterSection === "behaviors";
  const detailCount = pattern.details.filter(
    (detail) =>
      detail.automaticThought?.trim() || detail.emotion?.trim()
  ).length;
  const errorCount = (pattern.errorDetails ?? []).filter(
    (detail) => detail.errorLabel?.trim() || detail.errorDescription?.trim()
  ).length;
  const alternativeCount = pattern.alternatives.filter((alt) =>
    alt.alternative?.trim()
  ).length;
  const behaviorCount = Math.max(
    (pattern.behaviorDetails ?? []).filter(
      (detail) =>
        detail.behaviorLabel?.trim() || detail.behaviorDescription?.trim()
    ).length,
    pattern.behavior?.trim() ? 1 : 0
  );

  useEffect(() => {
    if (!openOuterSection) return;
    const refMap: Record<OuterSection, React.RefObject<HTMLDivElement | null>> = {
      details: detailsRef,
      errors: errorsRef,
      alternatives: alternativesRef,
      behaviors: behaviorsRef,
    };
    const countMap: Record<OuterSection, number> = {
      details: detailCount,
      errors: errorCount,
      alternatives: alternativeCount,
      behaviors: behaviorCount,
    };
    const target = refMap[openOuterSection]?.current;
    if (!target) return;
    requestAnimationFrame(() => {
      if (countMap[openOuterSection] >= 5) {
        const rect = target.getBoundingClientRect();
        const offset = window.innerHeight * 0.2;
        const nextTop = window.scrollY + rect.top - offset;
        window.scrollTo({ top: nextTop, behavior: "smooth" });
        return;
      }
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [openOuterSection]);

  const sectionRefs: Record<
    OuterSection,
    React.RefObject<HTMLDivElement | null>
  > = {
    details: detailsRef,
    errors: errorsRef,
    alternatives: alternativesRef,
    behaviors: behaviorsRef,
  };

  useAutoCloseOnScroll({
    isOpen: Boolean(openOuterSection),
    targetRef: openOuterSection ? sectionRefs[openOuterSection] : detailsRef,
    onClose: () => {
      if (!openOuterSection) return;
      onToggleOuterSection(openOuterSection);
    },
  });

  const handleCopy = async (text: string) => {
    if (!text.trim()) return;
    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch (_error) {
        // Fallback to legacy copy below.
      }
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  };

  return (
    <div
      id={`pattern-${pattern.id}`}
      className="w-full"
    >
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <span
            className="text-sm px-3 py-1 rounded-full font-semibold"
            style={getFrequencyBadgeStyle(pattern.frequency)}
          >
            {pattern.frequency}회 발생
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onIncrementFrequency(pattern.id)}
              className="text-green-600 hover:text-green-700 px-3 py-1 bg-green-50 rounded text-sm"
              disabled={loading}
              title="발생 횟수 +1"
            >
              +1회
            </button>
            <button
              onClick={() => onDecrementFrequency(pattern.id)}
              className="text-red-600 hover:text-red-700 px-3 py-1 bg-red-50 rounded text-sm"
              disabled={loading || pattern.frequency <= 1}
              title="발생 횟수 -1"
            >
              -1회
            </button>
            <button
              onClick={() => onRequestDelete(pattern.id)}
              className="text-red-600 hover:text-red-700 p-1"
              title="삭제"
              aria-label="노트 삭제"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-xl text-slate-900 mb-2">{pattern.title}</h3>
            <p className="text-xs text-slate-400">
              최초 기록: {formatDate(pattern.timestamp)}
            </p>
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <PatternSectionHeader
                tone="slate"
                title="트리거 텍스트"
                icon={<AlertCircle className="size-4" />}
                onEdit={() => onEditTrigger(pattern)}
                editLabel="트리거 텍스트 편집"
              />
              <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {pattern.trigger}
              </p>
            </div>
          </div>
        </div>
        {confirmDeleteId === pattern.id && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
            <span>
              이 노트와 관련된 자동사고, 대안사고, 행동의 기록도 삭제됩니다.
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={() => onConfirmDelete(pattern.id)}
                variant="destructive"
                size="sm"
                disabled={loading}
                className="bg-red-600 text-white hover:bg-red-500"
              >
                삭제
              </Button>
              <Button
                type="button"
                onClick={onCancelDelete}
                variant="outline"
                size="sm"
                disabled={loading}
                className="border-red-200 text-red-700 hover:bg-red-100"
              >
                취소
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:items-start">
        <div
          ref={detailsRef}
          className={`rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm transition-shadow ${
            isDetailsOpen ? "ring-2 ring-amber-300 shadow-md" : ""
          }`}
        >
          <PatternSectionHeader
            tone="amber"
            title="배후의 자동 사고"
            icon={<Brain className="size-4" />}
            editLabel="배후의 자동 사고 편집"
            onToggle={() => onToggleOuterSection("details")}
            isExpanded={isDetailsOpen}
            count={detailCount}
          />
          {isDetailsOpen ? (
            pattern.details.length > 0 ? (
              <div className="mt-3 space-y-2">
                {pattern.details.map((detail) => {
                  const detailKey = `${pattern.id}-${detail.id}`;
                  const isExpanded = Boolean(expandedDetails[detailKey]);
                  return (
                    <div
                      key={detail.id}
                      className="rounded-lg border border-amber-200/80 bg-white p-3 shadow-sm"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 font-semibold text-blue-700"
                              style={{ fontSize: "14px", lineHeight: "1" }}
                            >
                              {detail.emotion || "-"}
                            </span>
                            {getEmotionMeta(detail.emotion) && (
                              <EmotionInfoPopover
                                emotionLabel={detail.emotion}
                                align="start"
                              >
                                <button
                                  type="button"
                                  className="rounded-full p-1 text-blue-500 hover:bg-blue-100"
                                  aria-label={`${detail.emotion} 설명 보기`}
                                >
                                  <Info className="size-4" />
                                </button>
                              </EmotionInfoPopover>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedDetails((prev) => ({
                              ...prev,
                              [detailKey]: !isExpanded,
                            }))
                          }
                          className="flex min-w-0 flex-1 items-center gap-2 text-left"
                          title={
                            isExpanded
                              ? "배후의 자동 사고 접기"
                              : "배후의 자동 사고 펼치기"
                          }
                        >
                          {isExpanded ? (
                            <ChevronDown className="size-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="size-4 text-slate-400" />
                          )}
                          <span className="min-w-0 flex-1 text-sm text-slate-600">
                            {formatThoughtTitle(
                              detail.automaticThought || "-"
                            )}
                          </span>
                        </button>
                      </div>
                      {isExpanded && (
                        <>
                          <p className="mt-3 text-sm text-slate-700 whitespace-pre-wrap break-words leading-relaxed">
                            {detail.automaticThought || "-"}
                          </p>
                          <PatternContentActions
                            tone="amber"
                            onCopy={() =>
                              handleCopy(detail.automaticThought || "-")
                            }
                            onExpand={() =>
                              setPreviewContent({
                                title: "배후의 자동 사고",
                                content: detail.automaticThought || "-",
                                tone: "amber",
                              })
                            }
                            onDelete={() =>
                              onDeleteDetail(pattern.id, detail.id)
                            }
                            deleting={Boolean(deletingDetails[detail.id])}
                            copyLabel="복사"
                            expandLabel="확대"
                            deleteLabel="삭제"
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-3 text-sm text-amber-900 leading-relaxed">
                아직 자동 사고가 저장되지 않았습니다.
              </p>
            )
          ) : null}
        </div>

        <div
          ref={errorsRef}
          className={`error-card rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-sm transition-shadow ${
            isErrorsOpen ? "ring-2 ring-rose-300 shadow-md" : ""
          }`}
        >
          <PatternSectionHeader
            tone="rose"
            title="인지오류"
            icon={<AlertCircle className="size-4 text-rose-700" />}
            editLabel="인지오류 편집"
            onToggle={() => onToggleOuterSection("errors")}
            isExpanded={isErrorsOpen}
            count={errorCount}
          />
          {isErrorsOpen ? (
            (pattern.errorDetails ?? []).length ? (
              <div className="mt-3 space-y-2">
                {(pattern.errorDetails ?? []).map((detail) => {
                  const errorKey = `${pattern.id}-${detail.id}`;
                  const isExpanded = Boolean(expandedErrors[errorKey]);
                  const label =
                    detail.errorLabel || detail.errorDescription || "-";
                  const meta = getCognitiveErrorMeta(detail.errorLabel);
                  return (
                    <div
                      key={detail.id}
                      className="rounded-lg border border-rose-200 bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedErrors((prev) => ({
                              ...prev,
                              [errorKey]: !isExpanded,
                            }))
                          }
                          className="flex min-w-0 flex-1 items-center gap-2 text-left"
                          title={
                            isExpanded ? "인지오류 접기" : "인지오류 펼치기"
                          }
                        >
                          {isExpanded ? (
                            <ChevronDown className="size-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="size-4 text-slate-400" />
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                              {formatErrorTitle(label)}
                              {meta && (
                                <CognitiveErrorInfoPopover
                                  errorLabel={meta.title}
                                  align="end"
                                >
                                  <span
                                    role="button"
                                    tabIndex={0}
                                    onClick={(event) =>
                                      event.stopPropagation()
                                    }
                                    onKeyDown={(event) =>
                                      event.stopPropagation()
                                    }
                                    className="inline-flex rounded-full p-1 text-rose-500 hover:bg-rose-100"
                                    aria-label={`${meta.title} 설명 보기`}
                                  >
                                    <Info className="size-4" />
                                  </span>
                                </CognitiveErrorInfoPopover>
                              )}
                            </span>
                          </span>
                        </button>
                      </div>
                      {isExpanded && (
                        <>
                          <p className="mt-3 text-sm text-slate-700 whitespace-pre-wrap break-words leading-relaxed">
                            {detail.errorDescription ||
                              detail.errorLabel ||
                              "-"}
                          </p>
                          <PatternContentActions
                            tone="rose"
                            onCopy={() =>
                              handleCopy(
                                detail.errorDescription ||
                                  detail.errorLabel ||
                                  "-"
                              )
                            }
                            onExpand={() =>
                              setPreviewContent({
                                title: "인지오류",
                                label: detail.errorLabel || undefined,
                                content:
                                  detail.errorDescription ||
                                  detail.errorLabel ||
                                  "-",
                                tone: "rose",
                              })
                            }
                            onDelete={() =>
                              onDeleteError(pattern.id, detail.id)
                            }
                            deleting={Boolean(deletingErrors[detail.id])}
                            copyLabel="복사"
                            expandLabel="확대"
                            deleteLabel="삭제"
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-3 text-sm text-rose-800 whitespace-pre-wrap leading-relaxed">
                아직 인지오류가 저장되지 않았습니다.
              </p>
            )
          ) : null}
        </div>

        <div
          ref={alternativesRef}
          className={`alternatives-card rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm transition-shadow ${
            isAlternativesOpen ? "ring-2 ring-green-300 shadow-md" : ""
          }`}
        >
          <PatternSectionHeader
            tone="green"
            title="대안적 접근"
            icon={<Lightbulb className="size-4" />}
            editLabel="대안적 접근 편집"
            onToggle={() => onToggleOuterSection("alternatives")}
            isExpanded={isAlternativesOpen}
            count={alternativeCount}
          />
          {isAlternativesOpen ? (
            pattern.alternatives.length ? (
              <div className="mt-3 space-y-2">
                {pattern.alternatives.map((alt) => {
                  const altKey = `${pattern.id}-${alt.id}`;
                  const isExpanded = Boolean(expandedAlternatives[altKey]);
                  return (
                    <div
                      key={alt.id}
                      className="rounded-lg border border-green-200 bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedAlternatives((prev) => ({
                              ...prev,
                              [altKey]: !isExpanded,
                            }))
                          }
                          className="flex min-w-0 flex-1 items-center gap-2 text-left"
                          title={
                            isExpanded ? "대안적 접근 접기" : "대안적 접근 펼치기"
                          }
                        >
                          {isExpanded ? (
                            <ChevronDown className="size-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="size-4 text-slate-400" />
                          )}
                          <span className="min-w-0 flex-1 text-sm text-slate-600">
                            {formatAlternativeTitle(alt.alternative || "-")}
                          </span>
                        </button>
                      </div>
                      {isExpanded && (
                        <>
                          <p className="mt-3 text-sm text-slate-700 whitespace-pre-wrap break-words leading-relaxed">
                            {alt.alternative || "-"}
                          </p>
                          <PatternContentActions
                            tone="green"
                            onCopy={() => handleCopy(alt.alternative || "-")}
                            onExpand={() =>
                              setPreviewContent({
                                title: "대안적 접근",
                                content: alt.alternative || "-",
                                tone: "green",
                              })
                            }
                            onDelete={() =>
                              onDeleteAlternative(pattern.id, alt.id)
                            }
                            deleting={Boolean(deletingAlternatives[alt.id])}
                            copyLabel="복사"
                            expandLabel="확대"
                            deleteLabel="삭제"
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-3 text-sm text-green-800 whitespace-pre-wrap leading-relaxed">
                아직 대안이 작성되지 않았습니다.
              </p>
            )
          ) : null}
        </div>

        <div
          ref={behaviorsRef}
          className={`behavior-card rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm transition-shadow ${
            isBehaviorsOpen ? "ring-2 ring-blue-300 shadow-md" : ""
          }`}
        >
          <PatternSectionHeader
            tone="blue"
            title="행동 반응"
            icon={<Footprints className="size-4 text-blue-700" />}
            editLabel="행동 반응 편집"
            onToggle={() => onToggleOuterSection("behaviors")}
            isExpanded={isBehaviorsOpen}
            count={behaviorCount}
          />
          {isBehaviorsOpen ? (
            (pattern.behaviorDetails ?? []).length ? (
              <div className="mt-3 space-y-2">
                {(pattern.behaviorDetails ?? []).map((detail) => {
                  const behaviorKey = `${pattern.id}-${detail.id}`;
                  const isExpanded = Boolean(expandedBehaviors[behaviorKey]);
                  const label =
                    detail.behaviorLabel || detail.behaviorDescription || "-";
                  const behaviorMeta = getBehaviorMeta(detail.behaviorLabel);
                  return (
                    <div
                      key={detail.id}
                      className="rounded-lg border border-blue-200 bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedBehaviors((prev) => ({
                              ...prev,
                              [behaviorKey]: !isExpanded,
                            }))
                          }
                          className="flex min-w-0 flex-1 items-center gap-2 text-left"
                          title={
                            isExpanded ? "행동 반응 접기" : "행동 반응 펼치기"
                          }
                        >
                          {isExpanded ? (
                            <ChevronDown className="size-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="size-4 text-slate-400" />
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                              {formatBehaviorTitle(label)}
                              {behaviorMeta && (
                                <BehaviorInfoPopover
                                  behaviorLabel={behaviorMeta.replacement_title}
                                  align="end"
                                >
                                  <span
                                    role="button"
                                    tabIndex={0}
                                    onClick={(event) =>
                                      event.stopPropagation()
                                    }
                                    onKeyDown={(event) =>
                                      event.stopPropagation()
                                    }
                                    className="inline-flex rounded-full p-1 text-blue-500 hover:bg-blue-100"
                                    aria-label={`${behaviorMeta.replacement_title} 설명 보기`}
                                  >
                                    <Info className="size-4" />
                                  </span>
                                </BehaviorInfoPopover>
                              )}
                            </span>
                          </span>
                        </button>
                      </div>
                      {detail.errorTags?.length ? (
                        <div className="mt-2 flex flex-wrap gap-4">
                          {detail.errorTags.map((tag) => {
                            const errorMeta = getCognitiveErrorMeta(tag);
                            return errorMeta ? (
                              <CognitiveErrorInfoPopover
                                key={`${detail.id}-${tag}`}
                                errorLabel={errorMeta.title}
                                align="start"
                                caption="태그 설명"
                                tone="blue"
                              >
                                <button
                                  type="button"
                                  className="inline-flex text-[11px] leading-4 font-normal text-blue-700 hover:text-blue-800"
                                  aria-label={`${errorMeta.title} 설명 보기`}
                                >
                                  #{tag}
                                </button>
                              </CognitiveErrorInfoPopover>
                            ) : (
                              <span
                                key={`${detail.id}-${tag}`}
                                className="inline-flex text-[11px] leading-4 font-normal text-blue-700"
                              >
                                #{tag}
                              </span>
                            );
                          })}
                        </div>
                      ) : null}
                      {isExpanded && (
                        <>
                          <p className="mt-3 text-sm text-slate-700 whitespace-pre-wrap break-words leading-relaxed">
                            {detail.behaviorDescription ||
                              detail.behaviorLabel ||
                              "-"}
                          </p>
                          <PatternContentActions
                            tone="blue"
                            onCopy={() =>
                              handleCopy(
                                detail.behaviorDescription ||
                                  detail.behaviorLabel ||
                                  "-"
                              )
                            }
                            onExpand={() =>
                              setPreviewContent({
                                title: "행동 반응",
                                label: detail.behaviorLabel || undefined,
                                content:
                                  detail.behaviorDescription ||
                                  detail.behaviorLabel ||
                                  "-",
                                tone: "blue",
                              })
                            }
                            onDelete={() =>
                              onDeleteBehavior(pattern.id, detail.id)
                            }
                            deleting={Boolean(deletingBehaviors[detail.id])}
                            copyLabel="복사"
                            expandLabel="확대"
                            deleteLabel="삭제"
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : pattern.behavior ? (
              <div className="mt-3">
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {pattern.behavior}
                </p>
                <PatternContentActions
                  tone="blue"
                  onCopy={() => handleCopy(pattern.behavior || "-")}
                  onExpand={() =>
                    setPreviewContent({
                      title: "행동 반응",
                      content: pattern.behavior || "-",
                      tone: "blue",
                    })
                  }
                  copyLabel="복사"
                  expandLabel="확대"
                />
              </div>
            ) : (
              <p className="mt-3 text-sm text-blue-800 whitespace-pre-wrap leading-relaxed">
                아직 행동 반응이 저장되지 않았습니다.
              </p>
            )
          ) : null}
        </div>
      </div>

      {previewContent ? (
        <PatternPreviewDialog
          open={Boolean(previewContent)}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              setPreviewContent(null);
            }
          }}
          tone={previewContent.tone ?? "slate"}
          title={previewContent.title}
          label={previewContent.label}
          trigger={pattern.trigger || "-"}
          content={previewContent.content}
        />
      ) : null}
    </div>
  );
}
