import { Info } from "lucide-react";
import { COGNITIVE_BEHAVIORS } from "../../../../../constants/behaviors";
import { EMOTIONS } from "../../../../../constants/emotions";
import { COGNITIVE_ERRORS } from "../../../../../constants/errors";
import { BehaviorInfoPopover } from "../pop-over/BehaviorInfoPopover";
import { CognitiveErrorInfoPopover } from "../pop-over/CognitiveErrorInfoPopover";
import {
  getBehaviorMeta,
  getCognitiveErrorMeta,
} from "../pop-over/InfoPopoverMeta";

interface EmotionSelectorProps {
  value: string;
  onSelect: (next: string) => void;
}

export const EmotionSelector = ({ value, onSelect }: EmotionSelectorProps) => {
  const emotionOptions = EMOTIONS.map((e) => e.label);
  return (
    <div className="flex flex-wrap gap-2">
      {emotionOptions.map((label) => {
        const active = value === label;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onSelect(label)}
            className={`px-3 py-1 text-xs rounded-full border transition-all duration-150 focus-visible:outline-none ${
              active
                ? "bg-amber-500 text-white border-amber-500 shadow-md"
                : "bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-amber-50 hover:shadow-sm active:scale-95"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

interface ErrorSelectorProps {
  value: string;
  onSelect: (next: string) => void;
}

export const ErrorSelector = ({ value, onSelect }: ErrorSelectorProps) => (
  <div className="flex flex-wrap gap-2">
    {COGNITIVE_ERRORS.map((error) => {
      const active = value === error.title;
      const meta = getCognitiveErrorMeta(error.title);
      return (
        <button
          key={error.id}
          type="button"
          onClick={() => onSelect(error.title)}
          className={`px-3 py-1 text-xs rounded-full border transition-all duration-150 focus-visible:outline-none ${
            active
              ? "bg-red-600 text-white border-red-600 shadow-md"
              : "bg-white text-rose-700 border-rose-200 hover:border-rose-300 hover:bg-rose-50 hover:shadow-sm active:scale-95"
          }`}
        >
          <span className="inline-flex items-center gap-1">
            <span>{error.title}</span>
            {active && meta && (
              <CognitiveErrorInfoPopover errorLabel={meta.title} align="end">
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.stopPropagation();
                    }
                  }}
                  className="inline-flex items-center justify-center rounded-full bg-white/20 p-0.5 text-white/90 hover:text-white"
                  aria-label={`${meta.title} 설명 보기`}
                >
                  <Info className="size-3" />
                </span>
              </CognitiveErrorInfoPopover>
            )}
          </span>
        </button>
      );
    })}
  </div>
);

interface BehaviorSelectorProps {
  value: string;
  onSelect: (next: string) => void;
}

export const BehaviorSelector = ({
  value,
  onSelect,
}: BehaviorSelectorProps) => (
  <div className="flex flex-wrap gap-2">
    {COGNITIVE_BEHAVIORS.map((behavior) => {
      const active = value === behavior.replacement_title;
      const meta = getBehaviorMeta(behavior.replacement_title);
      return (
        <button
          key={behavior.id}
          type="button"
          onClick={() => onSelect(behavior.replacement_title)}
          className={`px-3 py-1 text-xs rounded-full border transition-all duration-150 focus-visible:outline-none ${
            active
              ? "bg-blue-600 text-white border-blue-600 shadow-md"
              : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm active:scale-95"
          }`}
        >
          <span className="inline-flex items-center gap-1">
            <span>{behavior.replacement_title}</span>
            {active && meta && (
              <BehaviorInfoPopover
                behaviorLabel={meta.replacement_title}
                align="end"
              >
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.stopPropagation();
                    }
                  }}
                  className="inline-flex items-center justify-center rounded-full bg-white/20 p-0.5 text-white/90 hover:text-white"
                  aria-label={`${meta.replacement_title} 설명 보기`}
                >
                  <Info className="size-3" />
                </span>
              </BehaviorInfoPopover>
            )}
          </span>
        </button>
      );
    })}
  </div>
);
