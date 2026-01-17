import { useMemo, useState } from "react";
import { EnteranceAlternativeSection } from "./components/EnteranceAlternativeSection";
import { EnteranceErrorSection } from "./components/EnteranceErrorSection";
import { EnteranceIncidentSection } from "./components/EnteranceIncidentSection";
import { EnteranceIntroSection } from "./components/EnteranceIntroSection";
import { EnteranceStartSection } from "./components/EnteranceStartSection";
import { EnteranceTermsSection } from "./components/EnteranceTermsSection";
import { EnteranceThoughtSection } from "./components/EnteranceThoughtSection";

type EnteranceStep =
  | "intro"
  | "incident"
  | "thought"
  | "error"
  | "alternative"
  | "terms"
  | "start";

interface EnterancePageProps {
  onStartSession?: () => void;
  onExplore?: () => void;
  onLater?: () => void;
}

export function EnterancePage({
  onStartSession,
  onExplore,
  onLater,
}: EnterancePageProps) {
  const [step, setStep] = useState<EnteranceStep>("intro");
  const stepOrder = useMemo<EnteranceStep[]>(
    () => [
      "intro",
      "incident",
      "thought",
      "error",
      "alternative",
      "terms",
      "start",
    ],
    []
  );
  const currentIndex = stepOrder.indexOf(step);

  const handleNext = () => {
    if (currentIndex < stepOrder.length - 1) {
      setStep(stepOrder[currentIndex + 1]);
    }
  };

  const handleStart = () => {
    if (onStartSession) {
      onStartSession();
      return;
    }
    setStep("intro");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3efe7] via-[#f8f4ee] to-[#e3eee7] px-6 py-16 text-slate-900 dark:from-[#0f1115] dark:via-[#121826] dark:to-[#0c1a1b] dark:text-slate-100">
      <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center">
        {step === "intro" && (
          <EnteranceIntroSection
            onStart={handleNext}
            onExplore={onExplore}
          />
        )}
        {step === "incident" && <EnteranceIncidentSection onNext={handleNext} />}
        {step === "thought" && <EnteranceThoughtSection onNext={handleNext} />}
        {step === "error" && <EnteranceErrorSection onNext={handleNext} />}
        {step === "alternative" && (
          <EnteranceAlternativeSection onNext={handleNext} />
        )}
        {step === "terms" && <EnteranceTermsSection onAgree={handleNext} />}
        {step === "start" && (
          <EnteranceStartSection onStart={handleStart} onLater={onLater} />
        )}
        <div className="mt-10 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          {stepOrder.map((item, index) => (
            <span
              key={item}
              className={`size-2 rounded-full ${
                index <= currentIndex
                  ? "bg-slate-900 dark:bg-amber-300"
                  : "bg-slate-300 dark:bg-slate-600"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
