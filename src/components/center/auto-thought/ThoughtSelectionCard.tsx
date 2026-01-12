import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { validateUserText } from "../../../utils/validation";
import { Button } from "../../ui/button";
import type { EmotionData } from "../types";
import { ActionsSection } from "./ActionsSection";
import { CustomThoughtSection } from "./CustomThoughtSection";
import { GeneratedThoughtsSection } from "./GeneratedThoughtsSection";
import { GuidanceSection } from "./GuidanceSection";
import { LoadingInsightCard } from "./LoadingInsightCard";
import { SubmitSection } from "./SubmitSection";

interface ThoughtSelectionCardProps {
  selectedEmotion: string;
  selectedEmotionData: EmotionData | null;
  loading: boolean;
  error: string | null;
  generatedThoughts: string[];
  selectedThoughtIndex: number | null;
  customThought: string;
  currentPrefetchKey: string | null;
  activeNoteTrigger?: string | null;
  onSelectThought: (index: number) => void;
  onRegenerate: () => void;
  onRetry: () => void;
  onAddFavorite: (thought: string) => void;
  onLoadFavorites: () => void;
  onCustomThoughtChange: (value: string) => void;
  onCustomThoughtSelect: () => void;
  onSubmitCustom: (value: string) => void;
  onSubmit: () => void;
  canSubmit: boolean;
  savingDetail: boolean;
  savingDetailId: string | null;
  isDetailSaved?: (thought: string) => boolean;
}

export function ThoughtSelectionCard({
  selectedEmotion,
  selectedEmotionData,
  loading,
  error,
  generatedThoughts,
  selectedThoughtIndex,
  customThought,
  currentPrefetchKey,
  activeNoteTrigger,
  onSelectThought,
  onRegenerate,
  onRetry,
  onAddFavorite,
  onLoadFavorites,
  onCustomThoughtChange,
  onCustomThoughtSelect,
  onSubmitCustom,
  onSubmit,
  canSubmit,
  savingDetail,
  savingDetailId,
  isDetailSaved,
}: ThoughtSelectionCardProps) {
  const customThoughtTrimmed = customThought.trim();
  const isCustomTooShort =
    customThoughtTrimmed.length > 0 && customThoughtTrimmed.length < 10;
  const selectedGeneratedThought =
    selectedThoughtIndex !== null &&
    selectedThoughtIndex !== 999 &&
    selectedThoughtIndex >= 0 &&
    selectedThoughtIndex < generatedThoughts.length
      ? generatedThoughts[selectedThoughtIndex]
      : null;

  const handleSaveCustomThought = () => {
    if (isCustomTooShort) {
      toast.error("직접 입력한 생각을 10자 이상 적어주세요.");
      return;
    }
    const validation = validateUserText(customThoughtTrimmed);
    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }
    onAddFavorite(customThoughtTrimmed);
  };

  const handleSelectCustomThought = () => {
    if (isCustomTooShort) {
      toast.error("직접 입력한 생각을 10자 이상 적어주세요.");
      return;
    }
    onCustomThoughtSelect();
    onSubmitCustom(customThoughtTrimmed);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-600">당신의 마음을 살펴보고 있습니다...</p>
        {selectedEmotionData ? (
          <LoadingInsightCard
            emotion={selectedEmotion}
            emotionData={selectedEmotionData}
          />
        ) : null}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
        <p className="mb-2">{error}</p>
        <Button onClick={onRetry} variant="outline" size="sm">
          다시 시도
        </Button>
      </div>
    );
  }

  if (!generatedThoughts.length) {
    return null;
  }

  return (
    <>
      <GuidanceSection selectedEmotion={selectedEmotion} />
      <div className="flex justify-end">
        <ActionsSection
          currentPrefetchKey={currentPrefetchKey}
          selectedThought={selectedGeneratedThought}
          savingDetail={savingDetail}
          savingDetailId={savingDetailId}
          isDetailSaved={isDetailSaved}
          onRegenerate={onRegenerate}
          onSaveSelectedThought={onAddFavorite}
          onLoadFavorites={onLoadFavorites}
        />
      </div>
      <GeneratedThoughtsSection
        generatedThoughts={generatedThoughts}
        selectedThoughtIndex={selectedThoughtIndex}
        onSelectThought={onSelectThought}
      />
      <SubmitSection
        customThoughtTrimmed={customThoughtTrimmed}
        selectedThoughtIndex={selectedThoughtIndex}
        canSubmit={canSubmit}
        onSubmit={onSubmit}
      />
      <CustomThoughtSection
        customThought={customThought}
        customThoughtTrimmed={customThoughtTrimmed}
        selectedThoughtIndex={selectedThoughtIndex}
        savingDetail={savingDetail}
        savingDetailId={savingDetailId}
        isDetailSaved={isDetailSaved}
        onCustomThoughtChange={onCustomThoughtChange}
        onSaveCustomThought={handleSaveCustomThought}
        onSelectCustomThought={handleSelectCustomThought}
      />
    </>
  );
}
