import { useRef } from "react";
import { useAutoResizeTextarea } from "../hooks/useAutoResizeTextarea";

interface MinimalIncidentFormProps {
  userInput: string;
  onInputChange: (value: string) => void;
  onShowExample: () => void;
}

export function MinimalIncidentForm({
  userInput,
  onInputChange,
  onShowExample,
}: MinimalIncidentFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  useAutoResizeTextarea(textareaRef, [userInput]);

  return (
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
        onClick={onShowExample}
        className="text-sm text-slate-500 hover:text-slate-700"
      >
        예시를 보여주세요
      </button>
    </div>
  );
}
