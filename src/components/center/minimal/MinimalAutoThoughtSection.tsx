import { useState } from "react";
import { toast } from "sonner";
import { validateUserText } from "../../../utils/validation";
import { MinimalFloatingNextButton } from "../../common/MinimalFloatingNextButton";
import { MinimalAutoThoughtControlSection } from "./components/MinimalAutoThoughtControlSection";
import { MinimalAutoThoughtHeaderSection } from "./components/MinimalAutoThoughtHeaderSection";
import { MinimalAutoThoughtHintSection } from "./components/MinimalAutoThoughtHintSection";
import { MinimalAutoThoughtInputForm } from "./components/MinimalAutoThoughtInputForm";
import { MinimalAutoThoughtLoadingState } from "./components/MinimalAutoThoughtLoadingState";
import { MinimalAutoThoughtTextSection } from "./components/MinimalAutoThoughtTextSection";
import { useAutoThoughtSuggestions } from "./hooks/useAutoThoughtSuggestions";

interface MinimalAutoThoughtSectionProps {
  userInput: string;
  emotion: string;
  wantsCustom: boolean;
  onWantsCustomChange: (next: boolean) => void;
  onSubmitThought: (thought: string) => void;
}

export function MinimalAutoThoughtSection({
  userInput,
  emotion,
  wantsCustom,
  onWantsCustomChange,
  onSubmitThought,
}: MinimalAutoThoughtSectionProps) {
  const [customThought, setCustomThought] = useState("");

  const resetSelection = () => {
    onWantsCustomChange(false);
    setCustomThought("");
  };

  const {
    currentThought,
    loading,
    error,
    shouldShowCustom,
    goNextThought,
    reloadThoughts,
  } = useAutoThoughtSuggestions({
    userInput,
    emotion,
    onResetSelection: resetSelection,
  });

  const handleSubmit = () => {
    if (wantsCustom) {
      const validation = validateUserText(customThought, {
        minLength: 10,
        minLengthMessage: "직접 입력한 생각을 10자 이상 적어주세요.",
      });
      if (!validation.ok) {
        toast.error(validation.message);
        return;
      }
      onSubmitThought(customThought.trim());
      return;
    }

    if (!currentThought) {
      toast.error("생각을 불러오는 중입니다.");
      return;
    }

    onSubmitThought(currentThought);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 pt-12 pb-10">
      <div className="w-full max-w-xl space-y-8">
        <MinimalAutoThoughtHeaderSection
          emotion={emotion}
          error={error}
          onReload={() => void reloadThoughts()}
        />

        <div className="min-h-[72px] flex items-center">
          {wantsCustom ? (
            <MinimalAutoThoughtInputForm
              value={customThought}
              onChange={setCustomThought}
            />
          ) : loading ? (
            <MinimalAutoThoughtLoadingState message="생각을 정리하고 있어요." />
          ) : (
            <MinimalAutoThoughtTextSection
              text={currentThought}
              fallback="생각을 불러오는 중입니다."
            />
          )}
        </div>

        {wantsCustom ? (
          <MinimalAutoThoughtHintSection />
        ) : (
          <MinimalAutoThoughtControlSection
            disabled={loading}
            showCustomButton={shouldShowCustom}
            onNextThought={goNextThought}
            onEnableCustom={() => onWantsCustomChange(true)}
          />
        )}

        <MinimalFloatingNextButton onClick={handleSubmit} />
      </div>
    </div>
  );
}
