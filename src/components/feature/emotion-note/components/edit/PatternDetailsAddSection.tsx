import { Brain, Save, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { EMOTIONS } from "../../../../../constants/emotions";
import { generateExtendedAutomaticThoughts } from "../../../../../lib/ai";
import { clearTokenSessionStorage } from "../../../../../utils/storage/tokenSessionStorage";
import { Textarea } from "../../../../ui/textarea";
import { AiActionBar } from "./common/AiActionBar";
import { AiCandidatesPanel } from "./common/AiCandidatesPanel";
import { AiLoadingCard } from "./common/AiLoadingCard";
import { checkAiUsageLimit } from "../../../../../utils/aiUsageGuard";
import { PatternAddSectionShell } from "./common/PatternAddSectionShell";
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
  const [aiCandidates, setAiCandidates] = useState<
    Array<{ belief: string; emotionReason: string }>
  >([]);
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
        emotion,
      );
      setAiCandidates(
        result.sdtThoughts.map((item) => ({
          belief: item.belief,
          emotionReason: item.emotionReason,
        })),
      );
      setAiStep("suggestions");
    } catch (error) {
      console.error(error);
      setAiError("AI 제안을 불러오지 못했습니다.");
      setAiStep("select-emotion");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSelectCandidate = (belief: string) => {
    onChangeAutomaticThought(belief);
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

  const handleAiAction = async () => {
    const allowed = await checkAiUsageLimit();
    if (!allowed) return;
    startAiSelection();
  };

  return (
    <PatternAddSectionShell
      tone="amber"
      title="배후의 자동 사고 추가"
      icon={Brain}
      onClose={() => void clearTokenSessionStorage()}
    >
      <AiActionBar
        aiLabel={
          <>
            <Sparkles className="size-4 mr-1" />
            {aiButtonLabel}
          </>
        }
        onAiClick={() => void handleAiAction()}
        aiDisabled={loading || aiLoading}
        aiClassName="border-amber-300 text-amber-700 hover:bg-amber-100"
        saveLabel={loading ? "저장 중" : "저장"}
        onSave={onAddDetail}
        saveDisabled={!emotion.trim() || !automaticThought.trim() || loading}
        saveClassName="bg-yellow-500 text-white hover:bg-yellow-600"
        isSaving={loading}
        saveIcon={<Save className="size-4 mr-1" />}
      />
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
                selectedThought.length > 0 &&
                selectedThought === thought.belief;
              return (
                <SelectionCard
                  key={`${thought.belief}-${index}`}
                  selected={isSelected}
                  onSelect={() => handleSelectCandidate(thought.belief)}
                  tone="amber"
                >
                  <div className="flex-1 text-sm text-slate-700 leading-relaxed space-y-2">
                    <p>{thought.belief}</p>
                    {/* {thought.emotionReason ? (
                        <p className="text-xs text-slate-500">
                          {thought.emotionReason}
                        </p>
                      ) : null} */}
                  </div>
                </SelectionCard>
              );
            })}
          </AiCandidatesPanel>
        )}
      </div>
    </PatternAddSectionShell>
  );
}
