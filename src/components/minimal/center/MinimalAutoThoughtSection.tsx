import { useState } from "react";
import { toast } from "sonner";
import { validateUserText } from "../../../utils/validation";
import { MinimalFloatingNextButton } from "../common/MinimalFloatingNextButton";
import { MinimalLoadingState } from "../common/MinimalLoadingState";
import { MinimalStepHeaderSection } from "../common/MinimalStepHeaderSection";
import { MinimalAutoThoughtControlSection } from "./components/MinimalAutoThoughtControlSection";
import { MinimalAutoThoughtHintSection } from "./components/MinimalAutoThoughtHintSection";
import { MinimalAutoThoughtInputForm } from "./components/MinimalAutoThoughtInputForm";
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
  const title = (
    <>
      {emotion} 뒤에 숨어있는
      <span className="hidden sm:inline"> </span>
      <br className="sm:hidden" />
      생각을 찾아볼게요.
    </>
  );

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
      <div className="w-full max-w-4xl space-y-8">
        <MinimalStepHeaderSection title={title}>
          {error && (
            <div className="text-sm text-slate-500">
              {error}{" "}
              <button
                type="button"
                onClick={() => void reloadThoughts()}
                className="underline underline-offset-4 hover:text-slate-700"
              >
                다시 불러오기
              </button>
            </div>
          )}
        </MinimalStepHeaderSection>

        <div className="min-h-[72px] flex items-center">
          {wantsCustom ? (
            <MinimalAutoThoughtInputForm
              value={customThought}
              onChange={setCustomThought}
            />
          ) : loading ? (
            <MinimalLoadingState message="생각을 정리하고 있어요." />
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
