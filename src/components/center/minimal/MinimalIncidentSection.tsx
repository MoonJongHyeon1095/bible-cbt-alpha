import { toast } from "sonner";
import { validateUserText } from "../../../utils/validation";
import { MinimalFloatingNextButton } from "../../common/MinimalFloatingNextButton";
import { ALL_EXAMPLES } from "../constants/examples";
import { MinimalIncidentForm } from "./components/MinimalIncidentForm";
import { MinimalIncidentHeaderSection } from "./components/MinimalIncidentHeaderSection";

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
      <div className="w-full max-w-xl space-y-8">
        <MinimalIncidentHeaderSection />
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
