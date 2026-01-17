// src/components/left/error-picker/CognitiveErrorPickerCard.tsx
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ErrorIndex } from "../../../lib/ai";
import { Button } from "../../ui/button";
import { EmotionThoughtSummaryCard } from "../EmotionThoughtSummaryCard";
import { CognitiveErrorCandidateCard } from "./CognitiveErrorCandidateCard";
import { FloatingErrorPickerToolbar } from "./FloatingErrorPickerToolbar";
import { PinnedSelectionSection } from "./PinnedSelectionSection";
import { RecommendationSection } from "./RecommendationSection";
import type { CognitiveErrorMeta, DetailItem, RankItem } from "./types";

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
  pinnedSelected: ErrorIndex[];
  pageIndex: number;
  totalPages: number;
  selected: ErrorIndex[];
  canConfirm: boolean;

  onRetryRank: () => void;
  onReroll: () => void;
  onToggleSelect: (idx: ErrorIndex) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
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
  pinnedSelected,
  pageIndex,
  totalPages,
  selected,
  canConfirm,
  onRetryRank,
  onReroll,
  onToggleSelect,
  onPrevPage,
  onNextPage,
  onConfirm,
}: Props) {
  const selectedCount = selected.length;
  const canPrev = pageIndex > 0;
  const canNext = pageIndex < totalPages - 1;
  const [hasRerolled, setHasRerolled] = useState(false);
  const topRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!topRef.current) return;
    topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    topRef.current.focus({ preventScroll: true });
    const scroller = topRef.current.closest<HTMLElement>(".overflow-y-auto");
    if (scroller) {
      requestAnimationFrame(() => {
        scroller.scrollBy({ top: -24, behavior: "smooth" });
      });
    }
  }, []);

  const renderCard = (idx: ErrorIndex) => {
    const meta = COGNITIVE_ERRORS.find((item) => item.index === idx);
    const selectedOn = selected.includes(idx);

    const rankItem = (ranked ?? []).find((x) => x.index === idx);
    const detail = detailByIndex[idx];

    return (
      <CognitiveErrorCandidateCard
        key={idx}
        idx={idx}
        meta={meta}
        selectedOn={selectedOn}
        rankItem={rankItem}
        detail={detail}
        detailLoading={detailLoading}
        onToggleSelect={onToggleSelect}
      />
    );
  };

  return (
    <div ref={topRef} tabIndex={-1} className="space-y-5 focus:outline-none">
      <EmotionThoughtSummaryCard
        emotionLabel={emotionLabel}
        thoughtText={thoughtText}
      />

      {rankLoading && !ranked ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Loader2 className="size-6 animate-spin text-emerald-600" />
            <div>
              <p className="text-slate-900 font-semibold">
                인지오류 후보 정리 중
              </p>
              <p className="text-sm text-slate-500">
                생각의 패턴을 천천히 살펴보고 있어요.
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-3 animate-pulse">
            <div className="h-3 rounded-full bg-slate-200 w-5/6" />
            <div className="h-3 rounded-full bg-slate-200 w-4/6" />
            <div className="h-3 rounded-full bg-slate-200 w-3/6" />
          </div>
        </div>
      ) : rankError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
          <p className="text-rose-900 font-semibold mb-1">
            인지오류 후보를 불러오지 못했어요.
          </p>
          <p className="text-rose-700 text-sm mb-3">{rankError}</p>
          <Button onClick={onRetryRank} variant="outline" size="sm">
            다시 시도
          </Button>
        </div>
      ) : (
        <>
          {detailError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 shadow-sm">
              <p>{detailError}</p>
            </div>
          )}

          <div className="space-y-4">
            <PinnedSelectionSection
              pinnedSelected={pinnedSelected}
              renderCard={renderCard}
            />
            <RecommendationSection
              uiIndices={uiIndices}
              renderCard={renderCard}
            />
          </div>

          <FloatingErrorPickerToolbar
            isVisible={hasRerolled || selectedCount > 0}
            selectedCount={selectedCount}
            pageIndex={pageIndex}
            totalPages={totalPages}
            canPrev={canPrev}
            canNext={canNext}
            onPrevPage={onPrevPage}
            onNextPage={onNextPage}
            onReroll={() => {
              setHasRerolled(true);
              onReroll();
            }}
            isRerollDisabled={detailLoading || rankLoading}
            canConfirm={canConfirm}
            onConfirm={onConfirm}
          />

        </>
      )}
    </div>
  );
}
