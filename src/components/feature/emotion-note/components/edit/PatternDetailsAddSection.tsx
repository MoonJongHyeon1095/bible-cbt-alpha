import { Brain, Save, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { EMOTIONS } from "../../../../../constants/emotions";
import { generateExtendedAutomaticThoughts } from "../../../../../lib/ai";
import { DialogClose } from "../../../../ui/dialog";
import { Button } from "../../../../ui/button";
import { Textarea } from "../../../../ui/textarea";
import { AiCandidatesPanel } from "./common/AiCandidatesPanel";
import { AiLoadingCard } from "./common/AiLoadingCard";
import { SelectionCard } from "./common/SelectionCard";
import { TagSelector } from "./common/TagSelector";

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
  const [aiStep, setAiStep] = useState<
    "idle" | "select-emotion" | "loading" | "suggestions"
  >("idle");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCandidates, setAiCandidates] = useState<string[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const hasCandidates = aiCandidates.length > 0;
  const aiButtonLabel = hasCandidates ? "다시 제안" : "AI 제안";
  const selectedThought = automaticThought.trim();
  const manualMode = aiStep === "idle";
  const showSelectedEmotion =
    !manualMode && aiStep !== "select-emotion" && Boolean(emotion.trim());
  const selectedEmotionChip = showSelectedEmotion ? (
    <div>
      <p className="text-xs text-slate-600 mb-2">선택된 감정</p>
      <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
        {emotion}
      </span>
    </div>
  ) : null;

  useEffect(() => {
    setAiCandidates([]);
    setAiError(null);
  }, [triggerText]);

  const handleGenerateCandidates = async () => {
    if (!emotion.trim() || !triggerText.trim()) {
      setAiStep("select-emotion");
      return;
    }
    setAiLoading(true);
    setAiError(null);
    setAiStep("loading");
    try {
      const result = await generateExtendedAutomaticThoughts(
        triggerText,
        emotion
      );
      const thoughts = result.sdtThoughts.map((item) => item.thought);
      setAiCandidates(thoughts);
      setAiStep("suggestions");
    } catch (error) {
      console.error(error);
      setAiError("AI 제안을 불러오지 못했습니다.");
      setAiStep("select-emotion");
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

  const startAiSelection = () => {
    setAiCandidates([]);
    setAiError(null);
    onChangeAutomaticThought("");
    if (emotion.trim() && triggerText.trim()) {
      void handleGenerateCandidates();
      return;
    }
    if (emotion.trim()) {
      setAiStep("suggestions");
      return;
    }
    setAiStep("select-emotion");
  };

  return (
    <div className="border border-amber-200 rounded-xl bg-white shadow-sm">
      <div className="border-b border-amber-200 px-4 py-3 text-sm font-semibold text-amber-900 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Brain className="size-4" />
          배후의 자동 사고 추가
        </div>
        <DialogClose asChild>
          <button
            type="button"
            className="rounded-full border border-amber-200 bg-white p-2 text-amber-700 transition hover:bg-amber-50"
            aria-label="닫기"
          >
            <X className="size-4" />
          </button>
        </DialogClose>
      </div>
      <div className="p-5 space-y-4 bg-amber-50/70">
        <div className="flex items-center justify-between gap-2 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={startAiSelection}
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
              <Save className="size-4 mr-1" />
              {loading ? "저장 중" : "저장"}
            </Button>
          </div>
        </div>
        {(manualMode || aiStep === "select-emotion") && (
          <div>
            <p className="text-xs text-slate-600 mb-2">감정 선택</p>
            <TagSelector
              options={EMOTIONS.map((item) => ({
                id: item.id,
                label: item.label,
                colorClassName: item.color,
              }))}
              value={emotion.trim()}
              onSelect={onSelectEmotion}
              useOptionColor
            />
          </div>
        )}
        {selectedEmotionChip}
        {(manualMode || aiStep === "suggestions") && (
          <Textarea
            ref={textareaRef}
            value={automaticThought}
            onChange={(e) => onChangeAutomaticThought(e.target.value)}
            placeholder="자동적으로 떠오르는 생각을 적어주세요."
            className="min-h-[120px] border-indigo-200 bg-white/90 px-3 py-2 text-[16px] leading-[1.85]"
          />
        )}
        <div className="space-y-2">
          {aiLoading && (
            <AiLoadingCard
              title="자동사고 생성 중"
              description="선택한 감정을 바탕으로 후보를 만들고 있어요."
              tone="amber"
            />
          )}
          {!aiLoading && aiError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {aiError}
            </div>
          )}
          {!aiLoading && hasCandidates && (
            <AiCandidatesPanel
              title="AI 자동사고 후보"
              description="클릭하면 입력창에 바로 적용됩니다."
              countText={`${aiCandidates.length}개 추천`}
              tone="amber"
            >
              {aiCandidates.map((thought, index) => {
                const isSelected =
                  selectedThought.length > 0 && selectedThought === thought;
                return (
                  <SelectionCard
                    key={`${thought}-${index}`}
                    selected={isSelected}
                    onSelect={() => handleSelectCandidate(thought)}
                    tone="amber"
                  >
                    <span className="flex-1 text-sm text-slate-700 leading-relaxed">
                      {thought}
                    </span>
                  </SelectionCard>
                );
              })}
            </AiCandidatesPanel>
          )}
        </div>
      </div>
    </div>
  );
}
