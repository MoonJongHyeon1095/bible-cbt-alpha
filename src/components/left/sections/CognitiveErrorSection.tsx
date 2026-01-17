import { COGNITIVE_ERRORS } from "../../../lib/ai";
import type { ErrorIndex } from "../../../lib/ai";
import type { DetailItem, RankItem } from "../hooks/useLeftPageTypes";
import { CognitiveErrorPickerCard } from "../error-picker/CognitiveErrorPickerCard";

interface CognitiveErrorSectionProps {
  emotionLabel: string;
  thoughtText: string;
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
  onToggleSelect: (index: ErrorIndex) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onConfirm: () => void;
}

export function CognitiveErrorSection({
  emotionLabel,
  thoughtText,
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
}: CognitiveErrorSectionProps) {
  return (
    <CognitiveErrorPickerCard
      emotionLabel={emotionLabel}
      thoughtText={thoughtText}
      COGNITIVE_ERRORS={COGNITIVE_ERRORS}
      ranked={ranked}
      rankLoading={rankLoading}
      rankError={rankError}
      detailByIndex={detailByIndex}
      detailLoading={detailLoading}
      detailError={detailError}
      uiIndices={uiIndices}
      pinnedSelected={pinnedSelected}
      pageIndex={pageIndex}
      totalPages={totalPages}
      selected={selected}
      canConfirm={canConfirm}
      onRetryRank={onRetryRank}
      onReroll={onReroll}
      onToggleSelect={onToggleSelect}
      onPrevPage={onPrevPage}
      onNextPage={onNextPage}
      onConfirm={onConfirm}
    />
  );
}
