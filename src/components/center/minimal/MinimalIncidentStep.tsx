import { useLayoutEffect, useRef } from "react";
import { toast } from "sonner";
import { validateUserText } from "../../../utils/validation";
import { MinimalFloatingNextButton } from "../../common/MinimalFloatingNextButton";
import { ALL_EXAMPLES } from "../constants/examples";

interface MinimalIncidentStepProps {
  userInput: string;
  onInputChange: (value: string) => void;
  onNext: () => void;
}

export function MinimalIncidentStep({
  userInput,
  onInputChange,
  onNext,
}: MinimalIncidentStepProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [userInput]);

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
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-serif font-semibold leading-tight text-slate-900">
            오늘 무슨 일이 있었나요?
          </h1>
          <p className="text-base sm:text-lg text-slate-500 leading-relaxed">
            힘들었던 경험이나 불편했던 상황을 자유롭게 적어주세요.
          </p>
        </div>

        <div className="space-y-3">
          <div
            className={`${
              userInput.trim() ? "is-filled" : ""
            } minimal-idle-caret-wrap`}
          >
            <textarea
              ref={textareaRef}
              value={userInput}
              onChange={(event) => onInputChange(event.target.value)}
              placeholder=""
              rows={1}
              className="w-full resize-none rounded-3xl border-0 bg-transparent px-1 py-2 text-base sm:text-lg text-slate-800 outline-none focus:ring-0"
            />
          </div>
          <button
            type="button"
            onClick={handleShowExample}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            예시를 보여주세요
          </button>
        </div>

        <MinimalFloatingNextButton onClick={handleNext} />
      </div>
    </div>
  );
}
