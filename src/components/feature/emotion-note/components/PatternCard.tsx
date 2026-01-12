import {
  AlertCircle,
  Brain,
  ChevronDown,
  ChevronRight,
  Edit2,
  Footprints,
  Lightbulb,
  Trash2,
} from "lucide-react";
import { Button } from "../../../ui/button";
import { Card } from "../../../ui/card";
import type { Pattern } from "../types";

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
  setExpandedErrors: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  expandedBehaviors: Record<string, boolean>;
  setExpandedBehaviors: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  getFrequencyBadgeStyle: (frequency: number) => React.CSSProperties;
  onIncrementFrequency: (id: string) => void;
  onDecrementFrequency: (id: string) => void;
  onEdit: (pattern: Pattern) => void;
  onRequestDelete: (id: string) => void;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
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
  onEdit,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}: PatternCardProps) {
  return (
    <Card
      id={`pattern-${pattern.id}`}
      className="p-6 hover:shadow-lg transition-shadow bg-white border-indigo-100"
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
          </div>
        </div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-xl text-slate-900 mb-2">{pattern.title}</h3>
            <p className="text-xs text-slate-400">
              최초 기록: {formatDate(pattern.timestamp)}
            </p>
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                <AlertCircle className="size-4" />
                트리거 텍스트
              </p>
              <p className="text-sm text-slate-800 whitespace-pre-wrap">
                {pattern.trigger}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(pattern)}
              className="text-indigo-600 hover:text-indigo-700 p-1"
              title="수정"
            >
              <Edit2 className="size-4" />
            </button>
            <button
              onClick={() => onRequestDelete(pattern.id)}
              className="text-red-600 hover:text-red-700 p-1"
              title="삭제"
            >
              <Trash2 className="size-4" />
            </button>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pattern.details.length > 0 ? (
          <div className="md:col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                <Brain className="size-4" />
                배후의 자동 사고
              </div>
              <span className="text-xs text-amber-800">
                {pattern.details.length}개
              </span>
            </div>
            <div className="space-y-2">
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
                        <span
                          className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 font-semibold text-blue-700"
                          style={{ fontSize: "14px", lineHeight: "1" }}
                        >
                          {detail.emotion || "-"}
                        </span>
                        <span
                          className="text-slate-400"
                          style={{ fontSize: "14px", lineHeight: "1" }}
                        >
                          {detail.createdAt
                            ? new Date(detail.createdAt).toLocaleDateString(
                                "ko-KR"
                              )
                            : ""}
                        </span>
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
                          {formatThoughtTitle(detail.automaticThought || "-")}
                        </span>
                      </button>
                    </div>
                    {isExpanded && (
                      <p className="mt-3 text-slate-800 text-sm whitespace-pre-wrap break-words">
                        {detail.automaticThought || "-"}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="md:col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
              <Brain className="size-4" />
              배후의 자동 사고
            </div>
            <p className="mt-2 text-sm text-amber-900">
              아직 배후의 자동 사고가 저장되지 않았습니다.
            </p>
          </div>
        )}

        <div className="alternatives-card rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-900">
              <Lightbulb className="size-4" />
              대안적 접근
            </div>
            <span className="text-xs text-green-800">
              {pattern.alternatives.length}개
            </span>
          </div>
          {pattern.alternatives.length ? (
            <div className="space-y-2">
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
                      <span
                        className="text-slate-400"
                        style={{ fontSize: "14px", lineHeight: "1" }}
                      >
                        {alt.createdAt
                          ? new Date(alt.createdAt).toLocaleDateString("ko-KR")
                          : ""}
                      </span>
                    </div>
                    {isExpanded && (
                      <p className="mt-3 text-slate-800 text-sm whitespace-pre-wrap break-words">
                        {alt.alternative || "-"}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-green-800 whitespace-pre-wrap">
              아직 대안이 작성되지 않았습니다.
            </p>
          )}
        </div>

        <div className="error-card rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-900">
              <AlertCircle className="size-4 text-rose-700" />
              인지오류
            </div>
            <span className="text-xs text-rose-800">
              {(pattern.errorDetails ?? []).length}개
            </span>
          </div>
          {(pattern.errorDetails ?? []).length ? (
            <div className="space-y-2">
              {(pattern.errorDetails ?? []).map((detail) => {
                const errorKey = `${pattern.id}-${detail.id}`;
                const isExpanded = Boolean(expandedErrors[errorKey]);
                const label = detail.errorLabel || detail.errorDescription || "-";
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
                        title={isExpanded ? "인지오류 접기" : "인지오류 펼치기"}
                      >
                        {isExpanded ? (
                          <ChevronDown className="size-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="size-4 text-slate-400" />
                        )}
                        <span className="min-w-0 flex-1 text-sm text-slate-600">
                          {formatErrorTitle(label)}
                        </span>
                      </button>
                      <span
                        className="text-slate-400"
                        style={{ fontSize: "14px", lineHeight: "1" }}
                      >
                        {detail.createdAt
                          ? new Date(detail.createdAt).toLocaleDateString(
                              "ko-KR"
                            )
                          : ""}
                      </span>
                    </div>
                    {isExpanded && (
                      <p className="mt-3 text-slate-800 text-sm whitespace-pre-wrap break-words">
                        {detail.errorDescription || detail.errorLabel || "-"}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-rose-800 whitespace-pre-wrap">
              아직 인지오류가 저장되지 않았습니다.
            </p>
          )}
        </div>

        <div className="behavior-card rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-900">
              <Footprints className="size-4 text-blue-700" />
              행동 반응
            </div>
            <span className="text-xs text-blue-800">
              {(pattern.behaviorDetails ?? []).length}개
            </span>
          </div>
          {(pattern.behaviorDetails ?? []).length ? (
            <div className="space-y-2">
              {(pattern.behaviorDetails ?? []).map((detail) => {
                const behaviorKey = `${pattern.id}-${detail.id}`;
                const isExpanded = Boolean(expandedBehaviors[behaviorKey]);
                const label =
                  detail.behaviorLabel || detail.behaviorDescription || "-";
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
                        <span className="min-w-0 flex-1 text-sm text-slate-600">
                          {formatBehaviorTitle(label)}
                        </span>
                      </button>
                      <span
                        className="text-slate-400"
                        style={{ fontSize: "14px", lineHeight: "1" }}
                      >
                        {detail.createdAt
                          ? new Date(detail.createdAt).toLocaleDateString(
                              "ko-KR"
                            )
                          : ""}
                      </span>
                    </div>
                    {detail.errorTags?.length ? (
                      <div className="mt-2 flex flex-wrap gap-4">
                        {detail.errorTags.map((tag) => (
                          <span
                            key={`${detail.id}-${tag}`}
                            className="inline-flex font-normal text-blue-700"
                            style={{
                              fontSize: "10px",
                              lineHeight: "1",
                              transform: "scale(1.2)",
                              transformOrigin: "left center",
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {isExpanded && (
                      <p className="mt-3 text-slate-800 text-sm whitespace-pre-wrap break-words">
                        {detail.behaviorDescription ||
                          detail.behaviorLabel ||
                          "-"}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : pattern.behavior ? (
            <p className="text-sm text-slate-800 whitespace-pre-wrap">
              {pattern.behavior}
            </p>
          ) : (
            <p className="text-sm text-blue-800 whitespace-pre-wrap">
              아직 행동 반응이 저장되지 않았습니다.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
