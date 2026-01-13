import { Brain, Check, Loader2, Save, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { generateExtendedAutomaticThoughts } from "../../../../../lib/ai";
import { Button } from "../../../../ui/button";
import { Textarea } from "../../../../ui/textarea";
import { PatternDetailLoadingCard } from "./PatternDetailLoadingCard";
import { EmotionSelector } from "./PatternSelectors";

interface PatternDetailsAddSectionProps {
  triggerText: string;
  automaticThought: string;
  emotion: string;
  loading: boolean;
  onChangeAutomaticThought: (value: string) => void;
  onSelectEmotion: (value: string) => void;
  onAddDetail: () => void;
}

export function PatternDetailsAddSection({
  triggerText,
  automaticThought,
  emotion,
  loading,
  onChangeAutomaticThought,
  onSelectEmotion,
  onAddDetail,
}: PatternDetailsAddSectionProps) {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCandidates, setAiCandidates] = useState<string[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const hasCandidates = aiCandidates.length > 0;
  const aiButtonLabel = hasCandidates ? "다시 제안" : "AI 제안";
  const selectedThought = automaticThought.trim();

  useEffect(() => {
    setAiCandidates([]);
    setAiError(null);
  }, [emotion, triggerText]);

  const handleGenerateCandidates = async () => {
    if (!emotion.trim()) {
      toast.error("먼저 감정을 선택해주세요.");
      return;
    }
    if (!triggerText.trim()) {
      toast.error("먼저 트리거 내용을 입력해주세요.");
      return;
    }
    setAiLoading(true);
    setAiError(null);
    try {
      const result = await generateExtendedAutomaticThoughts(
        triggerText,
        emotion
      );
      const thoughts = result.sdtThoughts.map((item) => item.thought);
      setAiCandidates(thoughts);
      if (thoughts.length === 0) {
        toast.info("추천할 자동사고 후보가 없습니다.");
      }
    } catch (error) {
      console.error(error);
      setAiError("AI 제안을 불러오지 못했습니다.");
      toast.error("AI 제안을 불러오지 못했습니다.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSelectCandidate = (thought: string) => {
    onChangeAutomaticThought(thought);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  };

  return (
    <div className="border border-amber-200 rounded-xl bg-white shadow-sm">
      <div className="border-b border-amber-200 px-4 py-3 text-sm font-semibold text-amber-900 flex items-center gap-2">
        <Brain className="size-4" />
        배후의 자동 사고 추가
      </div>
      <div className="p-5 space-y-4 bg-amber-50/70">
        <div className="flex items-center justify-between gap-2 text-sm text-slate-700">
          <div className="flex items-center gap-2">💭 자동사고 추가</div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerateCandidates}
              disabled={loading || aiLoading}
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              <Sparkles className="size-4 mr-1" />
              {aiButtonLabel}
            </Button>
            <Button
              size="sm"
              onClick={onAddDetail}
              disabled={!emotion.trim() || !automaticThought.trim() || loading}
              className="bg-yellow-500 text-white hover:bg-yellow-600"
            >
              {loading ? (
                <Loader2 className="size-4 mr-1 animate-spin" />
              ) : (
                <Save className="size-4 mr-1" />
              )}
              {loading ? "저장 중" : "저장"}
            </Button>
          </div>
        </div>
        <div>
          <p className="text-xs text-slate-600 mb-2">감정 선택</p>
          <EmotionSelector value={emotion} onSelect={onSelectEmotion} />
        </div>
        <Textarea
          ref={textareaRef}
          value={automaticThought}
          onChange={(e) => onChangeAutomaticThought(e.target.value)}
          placeholder="자동적으로 떠오르는 생각을 적어주세요."
          className="min-h-[120px] border-indigo-200 bg-white/90 px-3 py-2 text-[16px] leading-[1.85]"
        />
        <div className="space-y-2">
          {aiLoading && <PatternDetailLoadingCard emotion={emotion} />}
          {!aiLoading && aiError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {aiError}
            </div>
          )}
          {!aiLoading && hasCandidates && (
            <div className="rounded-xl border border-amber-200 bg-white/95 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    AI 자동사고 후보
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    클릭하면 입력창에 바로 적용됩니다.
                  </p>
                </div>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800">
                  {aiCandidates.length}개 추천
                </span>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {aiCandidates.map((thought, index) => {
                  const isSelected =
                    selectedThought.length > 0 && selectedThought === thought;
                  return (
                    <button
                      key={`${thought}-${index}`}
                      type="button"
                      onClick={() => handleSelectCandidate(thought)}
                      className={[
                        "group flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left transition",
                        "bg-white hover:border-amber-300 hover:bg-amber-50/70",
                        isSelected
                          ? "border-amber-400 bg-amber-50/80"
                          : "border-amber-100",
                      ].join(" ")}
                      aria-pressed={isSelected}
                    >
                      <span
                        className={[
                          "mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold",
                          isSelected
                            ? "bg-amber-500 text-white"
                            : "bg-amber-100 text-amber-800",
                        ].join(" ")}
                      >
                        {index + 1}
                      </span>
                      <span className="flex-1 text-sm text-slate-700 leading-relaxed">
                        {thought}
                      </span>
                      <span
                        className={[
                          "mt-0.5 inline-flex items-center gap-1 text-xs font-semibold",
                          isSelected
                            ? "text-amber-700"
                            : "text-slate-400 group-hover:text-amber-700",
                        ].join(" ")}
                      >
                        {isSelected ? (
                          <>
                            <Check className="size-3" />
                            적용됨
                          </>
                        ) : (
                          "적용"
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
