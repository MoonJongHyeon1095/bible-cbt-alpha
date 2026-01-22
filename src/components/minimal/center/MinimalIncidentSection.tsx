import { toast } from "sonner";
import { validateUserText } from "../../../utils/validation";
import { ALL_EXAMPLES } from "../../center/constants/examples";
import { MinimalFloatingNextButton } from "../common/MinimalFloatingNextButton";
import { MinimalStepHeaderSection } from "../common/MinimalStepHeaderSection";
import { MinimalIncidentForm } from "./components/MinimalIncidentForm";

interface MinimalIncidentSectionProps {
  userInput: string;
  onInputChange: (value: string) => void;
  onNext: () => void;
}

export function MinimalIncidentSection({
  userInput,
  onInputChange,
  onNext,
}: MinimalIncidentSectionProps) {
  const title = "오늘 무슨 일이 있었나요?";
  const description = "힘들었던 경험이나 불편했던 상황을 자유롭게 적어주세요.";
  const handleShowExample = () => {
    if (!ALL_EXAMPLES.length) return;
    const index = Math.floor(Math.random() * ALL_EXAMPLES.length);
    const example = ALL_EXAMPLES[index].text;
    if (example) onInputChange(example);
  };

  const handleNext = () => {
    const validation = validateUserText(userInput, {
      minLength: 10,
      minLengthMessage: "상황을 10자 이상 입력해주세요.",
    });
    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }
    onNext();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-12 pb-10">
      <div className="w-full max-w-4xl space-y-10">
        <MinimalStepHeaderSection
          title={title}
          description={description}
          titleClassName="font-normal"
        />

        <MinimalIncidentForm
          userInput={userInput}
          onInputChange={onInputChange}
          onShowExample={handleShowExample}
        />

        <MinimalFloatingNextButton onClick={handleNext} />
      </div>
    </div>
  );
}
