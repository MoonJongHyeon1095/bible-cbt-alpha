import { useRef } from "react";
import { useAutoResizeTextarea } from "../hooks/useAutoResizeTextarea";

interface MinimalAutoThoughtInputFormProps {
  value: string;
  onChange: (value: string) => void;
}

export function MinimalAutoThoughtInputForm({
  value,
  onChange,
}: MinimalAutoThoughtInputFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  useAutoResizeTextarea(textareaRef, [value]);

  return (
    <div className={`${value.trim() ? "is-filled" : ""} minimal-idle-caret-wrap w-full`}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={1}
        placeholder="예: 나는 항상 실수만 하는 사람 같아."
        className="w-full resize-none rounded-3xl border-0 bg-transparent px-1 py-2 text-base sm:text-lg text-slate-800 outline-none focus:ring-0"
      />
    </div>
  );
}
