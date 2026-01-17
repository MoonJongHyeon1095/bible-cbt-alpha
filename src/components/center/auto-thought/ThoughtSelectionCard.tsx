import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { validateUserText } from "../../../utils/validation";
import { Button } from "../../ui/button";
import type { EmotionData } from "../types";
import { AutomaticThoughtToolBar } from "./AutomaticThoughtToolBar";
import { CustomThoughtSection } from "./CustomThoughtSection";
import { GeneratedThoughtsSection } from "./GeneratedThoughtsSection";
import { LoadingInsightCard } from "./LoadingInsightCard";

interface ThoughtSelectionCardProps {
  selectedEmotion: string;
  selectedEmotionData: EmotionData | null;
  loading: boolean;
  error: string | null;
  generatedThoughts: string[];
  selectedThoughtIndex: number | null;
  customThought: string;
  onSelectThought: (index: number) => void;
  onRegenerate: () => void;
  onRetry: () => void;
  onLoadFavorites: () => void;
  onCustomThoughtChange: (value: string) => void;
  onCustomThoughtSelect: () => void;
  onSubmitCustom: (value: string) => void;
  onSubmit: () => void;
  canSubmit: boolean;
}

export function ThoughtSelectionCard({
  selectedEmotion,
  selectedEmotionData,
  loading,
  error,
  generatedThoughts,
  selectedThoughtIndex,
  customThought,
  onSelectThought,
  onRegenerate,
  onRetry,
  onLoadFavorites,
  onCustomThoughtChange,
  onCustomThoughtSelect,
  onSubmitCustom,
  onSubmit,
  canSubmit,
}: ThoughtSelectionCardProps) {
  const customThoughtTrimmed = customThought.trim();
  const selectedGeneratedThought =
    selectedThoughtIndex !== null &&
    selectedThoughtIndex !== 999 &&
    selectedThoughtIndex >= 0 &&
    selectedThoughtIndex < generatedThoughts.length
      ? generatedThoughts[selectedThoughtIndex]
      : null;

  const handleSelectCustomThought = () => {
    const validation = validateUserText(customThoughtTrimmed, {
      minLength: 10,
      minLengthMessage: "직접 입력한 생각을 10자 이상 적어주세요.",
    });
    if (!validation.ok) {
      toast.error(validation.message);
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
      <div className="flex justify-end">
        <AutomaticThoughtToolBar
          selectedThought={selectedGeneratedThought}
          customThoughtTrimmed={customThoughtTrimmed}
          selectedThoughtIndex={selectedThoughtIndex}
          onRegenerate={onRegenerate}
          onLoadFavorites={onLoadFavorites}
          onSelectCustomThought={handleSelectCustomThought}
          onSubmit={onSubmit}
          canSubmit={canSubmit}
        />
      </div>
      <GeneratedThoughtsSection
        generatedThoughts={generatedThoughts}
        selectedThoughtIndex={selectedThoughtIndex}
        onSelectThought={onSelectThought}
      />
      <CustomThoughtSection
        customThought={customThought}
        customThoughtTrimmed={customThoughtTrimmed}
        onCustomThoughtChange={onCustomThoughtChange}
      />
    </>
  );
}
