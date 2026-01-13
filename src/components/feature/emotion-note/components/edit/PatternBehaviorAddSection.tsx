import { Footprints, Info, Loader2, Save } from "lucide-react";
import { COGNITIVE_ERRORS } from "../../../../../constants/errors";
import { Button } from "../../../../ui/button";
import { Textarea } from "../../../../ui/textarea";
import {
  CognitiveErrorInfoPopover,
  getCognitiveErrorMeta,
} from "../info-popovers";
import { BehaviorSelector } from "./PatternSelectors";

interface PatternBehaviorAddSectionProps {
  behaviorLabel: string;
  behaviorDescription: string;
  behaviorErrorTags: string[];
  loading: boolean;
  onChangeBehaviorLabel: (value: string) => void;
  onChangeBehaviorDescription: (value: string) => void;
  onChangeBehaviorErrorTags: (value: string[]) => void;
  onAddBehaviorDetail: () => void;
}

export function PatternBehaviorAddSection({
  behaviorLabel,
  behaviorDescription,
  behaviorErrorTags,
  loading,
  onChangeBehaviorLabel,
  onChangeBehaviorDescription,
  onChangeBehaviorErrorTags,
  onAddBehaviorDetail,
}: PatternBehaviorAddSectionProps) {
  return (
    <div className="border border-blue-200 rounded-xl bg-white shadow-sm">
      <div className="border-b border-blue-200 px-4 py-3 text-sm font-semibold text-slate-800 flex items-center gap-2">
        <Footprints className="size-4" />
        행동 반응 추가
      </div>
      <div className="p-5 space-y-4 bg-blue-50/70">
        <div className="flex items-center justify-between gap-2 text-sm text-slate-700">
          <div className="flex items-center gap-2">👣 행동 반응 추가</div>
          <Button
            size="sm"
            onClick={onAddBehaviorDetail}
            disabled={!behaviorLabel.trim() || loading}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            {loading ? (
              <Loader2 className="size-4 mr-1 animate-spin" />
            ) : (
              <Save className="size-4 mr-1" />
            )}
            {loading ? "저장 중" : "저장"}
          </Button>
        </div>
        <div>
          <p className="text-xs text-slate-600 mb-2">행동 반응 선택</p>
          <BehaviorSelector
            value={behaviorLabel}
            onSelect={onChangeBehaviorLabel}
          />
        </div>
        <Textarea
          value={behaviorDescription}
          onChange={(e) => onChangeBehaviorDescription(e.target.value)}
          placeholder="행동 반응 설명"
          className="min-h-[120px] border-blue-200 bg-white/90 px-3 py-2 text-[16px] leading-[1.85]"
        />
        <div>
          <p className="text-xs text-slate-600 mb-2">
            인지오류 태그 선택 (복수 가능)
          </p>
          <div className="flex flex-wrap gap-2">
            {COGNITIVE_ERRORS.map((error) => {
              const selected = behaviorErrorTags.includes(error.title);
              const meta = getCognitiveErrorMeta(error.title);
              return (
                <button
                  key={error.id}
                  type="button"
                  onClick={() => {
                    if (selected) {
                      onChangeBehaviorErrorTags(
                        behaviorErrorTags.filter((tag) => tag !== error.title)
                      );
                      return;
                    }
                    onChangeBehaviorErrorTags([
                      ...behaviorErrorTags,
                      error.title,
                    ]);
                  }}
                  className={`px-3 py-1 text-xs rounded-full border transition-all duration-150 focus-visible:outline-none ${
                    selected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                      : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-sm active:scale-95"
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    <span>{error.title}</span>
                    {selected && meta && (
                      <CognitiveErrorInfoPopover
                        errorLabel={meta.title}
                        align="start"
                        caption="태그 설명"
                        tone="blue"
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
        </div>
      </div>
    </div>
  );
}
