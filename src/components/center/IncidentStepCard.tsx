import { IncidentExamplesSection } from "./IncidentExamplesSection";
import { IncidentInputSection } from "./IncidentInputSection";

interface IncidentStepCardProps {
  userInput: string;
  onInputChange: (value: string) => void;
  onNext: () => void;
  randomExamples: { emoji: string; text: string }[];
  onExampleClick: (text: string) => void;
  onRefreshExamples: () => void;
  onSaveTrigger: () => void;
  onOpenSavedTriggers: () => void;
  savingTrigger?: boolean;
}

export function IncidentStepCard({
  userInput,
  onInputChange,
  onNext,
  randomExamples,
  onExampleClick,
  onRefreshExamples,
  onSaveTrigger,
  onOpenSavedTriggers,
  savingTrigger = false,
}: IncidentStepCardProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="mt-4">
        <IncidentInputSection
          userInput={userInput}
          onInputChange={onInputChange}
          onNext={onNext}
          onSaveTrigger={onSaveTrigger}
          onOpenSavedTriggers={onOpenSavedTriggers}
          savingTrigger={savingTrigger}
        />
      </div>

      <IncidentExamplesSection
        randomExamples={randomExamples}
        onExampleClick={onExampleClick}
        onRefreshExamples={onRefreshExamples}
      />

      <p className="text-center text-slate-400 text-xs">
        이 치료기법은 일반적인 인지행동치료 원리를 기반으로 AI를 활용해
        생성되었습니다.
      </p>
    </div>
  );
}
