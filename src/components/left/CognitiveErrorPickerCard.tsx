// src/components/left/CognitiveErrorPickerCard.tsx
import { Check, Loader2, RefreshCw } from "lucide-react";
import type { ErrorIndex } from "../../lib/ai";
import { Button } from "../ui/button";

type RankItem = {
  index: ErrorIndex;
  reason: string;
  evidenceQuote?: string;
};

type DetailItem = {
  index: ErrorIndex;
  analysis: string;
};

type CognitiveErrorMeta = {
  title: string;
  description: string;
};

function splitToSentences(text: string): string[] {
  if (!text) return [];

  const decoded = text
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t");

  const normalized = decoded
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .trim();

  const parts = normalized
    .split(/(?<=[.!?])\s+(?=[^)\]"'”’\s])/g)
    .map((s) => s.trim())
    .filter(Boolean);

  return parts.length ? parts : [normalized];
}

type Props = {
  emotionLabel: string;
  thoughtText: string;

  COGNITIVE_ERRORS: ReadonlyArray<CognitiveErrorMeta>;

  ranked: RankItem[] | null;
  rankLoading: boolean;
  rankError: string | null;

  detailByIndex: Partial<Record<ErrorIndex, DetailItem>>;
  detailLoading: boolean;
  detailError: string | null;

  uiIndices: ErrorIndex[];
  selected: ErrorIndex[];
  canConfirm: boolean;

  onRetryRank: () => void;
  onReroll: () => void;
  onToggleSelect: (idx: ErrorIndex) => void;
  onConfirm: () => void;
};

export function CognitiveErrorPickerCard({
  emotionLabel,
  thoughtText,
  COGNITIVE_ERRORS,
  ranked,
  rankLoading,
  rankError,
  detailByIndex,
  detailLoading,
  detailError,
  uiIndices,
  selected,
  canConfirm,
  onRetryRank,
  onReroll,
  onToggleSelect,
  onConfirm,
}: Props) {
  const selectedCount = selected.length;

  return (
    <div className="space-y-4">
      {/* ✅ EmpathyCard와 동일한 상단 블록 */}
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <p className="text-green-800 mb-2">
          <strong>{emotionLabel}의 문장</strong>
        </p>
        <p className="text-slate-700 italic mb-1">"{thoughtText}"</p>

        <p className="text-slate-700 text-sm mt-3">
          아래 인지오류 후보 중 <strong>2가지를 선택</strong>해주세요.
        </p>
      </div>

      {rankLoading && !ranked ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="size-8 animate-spin text-green-600 mb-4" />
          <p className="text-slate-600">인지오류 후보를 정리하고 있습니다...</p>
        </div>
      ) : rankError ? (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
          <p className="mb-2">{rankError}</p>
          <Button onClick={onRetryRank} variant="outline" size="sm">
            다시 시도
          </Button>
        </div>
      ) : (
        <>
          {detailError && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
              <p className="mb-2">{detailError}</p>
            </div>
          )}

          <div className="space-y-3 max-h-[380px] overflow-y-auto">
            {uiIndices.map((idx) => {
              const meta = COGNITIVE_ERRORS[idx - 1];
              const selectedOn = selected.includes(idx);

              const rankItem = (ranked ?? []).find((x) => x.index === idx);
              const detail = detailByIndex[idx];

              return (
                <button
                  key={idx}
                  onClick={() => onToggleSelect(idx)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all relative ${
                    selectedOn
                      ? "border-green-600 bg-green-50"
                      : "border-slate-200 hover:border-green-300 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      {/* ✅ 카드 내부 전체를 gap으로 읽기 좋게 */}
                      <div className="space-y-4">
                        {/* 1) 타이틀 + 설명 */}
                        <div className="space-y-1">
                          <p className="text-slate-900 font-medium">
                            {meta?.title ?? "인지오류"}
                          </p>
                          <p className="text-slate-500 text-sm leading-relaxed">
                            {meta?.description ?? ""}
                          </p>
                        </div>

                        {/* 2) 랭킹 근거 박스 (설명과 간격 확보) */}
                        {(rankItem?.reason || rankItem?.evidenceQuote) && (
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
                            {rankItem?.reason && (
                              <div className="space-y-1">
                                <p className="text-xs text-slate-500">
                                  🧾 이 인지오류로 본 이유
                                </p>
                                <p className="text-sm text-slate-700 leading-relaxed">
                                  {rankItem.reason}
                                </p>
                              </div>
                            )}

                            {rankItem?.evidenceQuote && (
                              <div className="bg-blue-50 border-l-4 border-blue-400 p-2 rounded space-y-1">
                                <p className="text-xs text-blue-600">
                                  📝 당신이 쓴 글
                                </p>
                                <p className="text-sm text-blue-900 italic whitespace-pre-line">
                                  "{rankItem.evidenceQuote}"
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 3) 서술 (근거 박스와도 간격 확보) */}
                        {detail ? (
                          <div className="space-y-2">
                            <p className="text-xs text-amber-600">🔍 서술</p>

                            <div className="text-base text-amber-950 leading-7 space-y-2">
                              {splitToSentences(detail.analysis).map(
                                (line, i) => (
                                  <p key={i} className="whitespace-pre-line">
                                    {line}
                                  </p>
                                )
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-100 border border-slate-200 rounded-lg p-3 text-slate-600 text-sm">
                            {detailLoading ? (
                              <div className="flex items-center gap-2">
                                <Loader2 className="size-4 animate-spin" />
                                <span>상세 서술을 불러오는 중...</span>
                              </div>
                            ) : (
                              <span>
                                상세 서술이 준비되는 대로 표시됩니다...
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedOn && (
                      <Check className="size-5 text-green-600 flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedCount > 0 && (
            <div className="bg-green-50 p-3 rounded-lg text-center text-green-800">
              {selectedCount} / 2개 선택됨
            </div>
          )}

          <Button
            onClick={onReroll}
            disabled={detailLoading || rankLoading}
            variant="outline"
            className="w-full gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="size-4" />
            다른 인지오류를 검토합니다. (선택한 것은 고정)
          </Button>

          <Button
            onClick={onConfirm}
            disabled={!canConfirm}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {canConfirm
              ? "다음 단계로 이동"
              : "상세 서술이 준비되면 다음 단계로 이동"}
          </Button>
        </>
      )}
    </div>
  );
}
