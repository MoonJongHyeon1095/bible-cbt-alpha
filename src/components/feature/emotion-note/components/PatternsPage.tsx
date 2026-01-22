import type { User } from "@supabase/supabase-js";
import { HeartPulse, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../../ui/button";
import { Card } from "../../../ui/card";
import { validateUserText } from "../../../../utils/validation";
import { usePatternForm } from "../hooks/usePatternForm";
import { usePatternsData } from "../hooks/usePatternsData";
import type {
  Pattern,
  PatternAlternative,
  PatternBehaviorDetail,
  PatternDetail,
  PatternErrorDetail,
} from "../types";
import { PatternCard } from "./PatternCard";
import { CreatePatternCard } from "./CreatePatternCard";
import { PatternAlternativesAddSection } from "./edit/PatternAlternativesAddSection";
import { PatternAlternativesSection } from "./edit/PatternAlternativesSection";
import { PatternBehaviorAddSection } from "./edit/PatternBehaviorAddSection";
import { PatternBehaviorSection } from "./edit/PatternBehaviorSection";
import { PatternDetailsAddSection } from "./edit/PatternDetailsAddSection";
import { PatternDetailsSection } from "./edit/PatternDetailsSection";
import { PatternEditModal } from "./edit/PatternEditModal";
import { PatternErrorAddSection } from "./edit/PatternErrorAddSection";
import { PatternErrorSection } from "./edit/PatternErrorSection";
import { PatternTriggerSection } from "./edit/PatternTriggerSection";
import { FeatureHeader } from "../../common/FeatureHeader";
import { ScrollToTopButton } from "../../common/ScrollToTopButton";
import { SelectedSectionActions } from "../../../common/SelectedSectionActions";

interface PatternsPageProps {
  user: User | null;
}

export function PatternsPage({ user }: PatternsPageProps) {
  const {
    patterns,
    loading,
    confirmDeleteId,
    requestDelete,
    cancelDelete,
    createPattern,
    updatePattern,
    deletePattern,
    updateDetail,
    deleteDetail,
    updateAlternative,
    deleteAlternative,
    updateErrorDetail,
    deleteErrorDetail,
    updateBehaviorDetail,
    deleteBehaviorDetail,
    addAlternative,
    addDetail,
    addErrorDetail,
    addBehaviorDetail,
    getFrequencyBadgeStyle,
    incrementFrequency,
    decrementFrequency,
  } = usePatternsData({ user });
  const [maxTitleLength, setMaxTitleLength] = useState(() => {
    if (typeof window === "undefined") return 20;
    return window.matchMedia("(min-width: 768px)").matches ? 20 : 15;
  });
  const {
    isCreating,
    editingId,
    title,
    setTitle,
    trigger,
    setTrigger,
    automaticThought,
    setAutomaticThought,
    emotion,
    setEmotion,
    behavior,
    alternativeText,
    setAlternativeText,
    errorLabel,
    setErrorLabel,
    errorDescription,
    setErrorDescription,
    behaviorLabel,
    setBehaviorLabel,
    behaviorDescription,
    setBehaviorDescription,
    behaviorErrorTags,
    setBehaviorErrorTags,
    titleRef,
    setIsCreating,
    startCreate,
    loadPatternForEdit,
    resetForm,
    clearEditing,
  } = usePatternForm();
  const [expandedDetails, setExpandedDetails] = useState<
    Record<string, boolean>
  >({});
  const [expandedAlternatives, setExpandedAlternatives] = useState<
    Record<string, boolean>
  >({});
  const [expandedErrors, setExpandedErrors] = useState<Record<string, boolean>>(
    {}
  );
  const [expandedBehaviors, setExpandedBehaviors] = useState<
    Record<string, boolean>
  >({});
  const [activeEditor, setActiveEditor] = useState<{
    type:
      | "trigger-edit"
      | "details-edit"
      | "details-add"
      | "errors-edit"
      | "errors-add"
      | "alternatives-edit"
      | "alternatives-add"
      | "behaviors-edit"
      | "behaviors-add";
    patternId: string;
  } | null>(null);
  const [deletingDetails, setDeletingDetails] = useState<
    Record<string, boolean>
  >({});
  const [deletingAlternatives, setDeletingAlternatives] = useState<
    Record<string, boolean>
  >({});
  const [deletingErrors, setDeletingErrors] = useState<Record<string, boolean>>(
    {}
  );
  const [deletingBehaviors, setDeletingBehaviors] = useState<
    Record<string, boolean>
  >({});
  const [savingTrigger, setSavingTrigger] = useState(false);
  const [savingDetailAdd, setSavingDetailAdd] = useState(false);
  const [savingAlternativeAdd, setSavingAlternativeAdd] = useState(false);
  const [savingErrorAdd, setSavingErrorAdd] = useState(false);
  const [savingBehaviorAdd, setSavingBehaviorAdd] = useState(false);
  const [openOuterSection, setOpenOuterSection] = useState<{
    patternId: string;
    section: "details" | "errors" | "alternatives" | "behaviors";
  } | null>(null);
  const selectedPattern = openOuterSection
    ? patterns.find((item) => item.id === openOuterSection.patternId) ?? null
    : null;
  const showSelectedActions =
    Boolean(selectedPattern) && !isCreating && !activeEditor;

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const updateLength = () => {
      setMaxTitleLength(media.matches ? 20 : 15);
    };

    updateLength();
    if (media.addEventListener) {
      media.addEventListener("change", updateLength);
    } else {
      media.addListener(updateLength);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", updateLength);
      } else {
        media.removeListener(updateLength);
      }
    };
  }, []);

  const formatThoughtTitle = (content: string) => {
    const trimmed = content.trim();
    if (trimmed.length <= maxTitleLength) return trimmed;
    return `${trimmed.slice(0, maxTitleLength)}…`;
  };

  const formatAlternativeTitle = (content: string) => {
    const trimmed = content.trim();
    if (trimmed.length <= maxTitleLength) return trimmed;
    return `${trimmed.slice(0, maxTitleLength)}…`;
  };

  const formatErrorTitle = (content: string) => {
    const trimmed = content.trim();
    if (trimmed.length <= maxTitleLength) return trimmed;
    return `${trimmed.slice(0, maxTitleLength)}…`;
  };

  const formatBehaviorTitle = (content: string) => {
    const trimmed = content.trim();
    if (trimmed.length <= maxTitleLength) return trimmed;
    return `${trimmed.slice(0, maxTitleLength)}…`;
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const latestSortedPatterns = [...patterns].sort((a: Pattern, b: Pattern) =>
    (b.timestamp ?? "").localeCompare(a.timestamp ?? "")
  );
  const mostFrequentPattern = [...patterns].sort(
    (a: Pattern, b: Pattern) => b.frequency - a.frequency
  )[0];

  const handleDeletePattern = (patternId: string) => {
    if (openOuterSection?.patternId === patternId) {
      setOpenOuterSection(null);
    }
    deletePattern(patternId);
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("감정패턴 제목을 입력해주세요.");
      return;
    }
    const validation = validateUserText(trigger, {
      minLength: 10,
      minLengthMessage: "상황을 10자 이상 입력해주세요.",
    });
    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }
    const ok = await createPattern({ title, trigger, behavior });
    if (ok) resetForm();
  };

  const handleAddDetail = async () => {
    if (!editingId) {
      toast.error("먼저 노트를 선택하거나 저장해주세요.");
      return;
    }
    if (!automaticThought.trim()) {
      toast.error("자동사고를 입력해주세요.");
      return;
    }
    const validation = validateUserText(automaticThought, {
      minLength: 10,
      minLengthMessage: "자동사고를 10자 이상 입력해주세요.",
    });
    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }
    setSavingDetailAdd(true);
    try {
      const ok = await addDetail({
        patternId: editingId,
        emotion,
        automaticThought,
      });
      if (ok) {
        setAutomaticThought("");
        toast.success("저장되었습니다.");
      }
    } finally {
      setSavingDetailAdd(false);
    }
  };

  const handleAddAlternative = async () => {
    if (!editingId) {
      toast.error("먼저 노트를 선택하거나 저장해주세요.");
      return;
    }
    if (!alternativeText.trim()) {
      toast.error("대안적 사고를 입력해주세요.");
      return;
    }
    const validation = validateUserText(alternativeText, {
      minLength: 10,
      minLengthMessage: "대안적 사고를 10자 이상 입력해주세요.",
    });
    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }
    setSavingAlternativeAdd(true);
    try {
      const ok = await addAlternative({
        patternId: editingId,
        alternativeText,
      });
      if (ok) {
        setAlternativeText("");
        toast.success("저장되었습니다.");
      }
    } finally {
      setSavingAlternativeAdd(false);
    }
  };

  const handleDetailUpdate = async (detail: PatternDetail) => {
    if (!editingId) return;
    await updateDetail(editingId, detail);
  };

  const handleDetailDelete = async (detailId: string) => {
    if (!editingId) return;
    await deleteDetail(editingId, detailId);
  };

  const handleAlternativeUpdate = async (alternative: PatternAlternative) => {
    if (!editingId) return;
    await updateAlternative(editingId, alternative);
  };

  const handleAlternativeDelete = async (alternativeId: string) => {
    if (!editingId) return;
    await deleteAlternative(editingId, alternativeId);
  };

  const handleAddError = async () => {
    if (!editingId) {
      toast.error("먼저 노트를 선택하거나 저장해주세요.");
      return;
    }
    if (!errorDescription.trim()) {
      toast.error("인지오류 설명을 입력해주세요.");
      return;
    }
    const validation = validateUserText(errorDescription, {
      minLength: 10,
      minLengthMessage: "인지오류 설명을 10자 이상 입력해주세요.",
    });
    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }
    setSavingErrorAdd(true);
    try {
      const ok = await addErrorDetail({
        patternId: editingId,
        errorLabel,
        errorDescription,
      });
      if (ok) {
        toast.success("저장되었습니다.");
      }
    } finally {
      setSavingErrorAdd(false);
    }
  };

  const handleErrorUpdate = async (detail: PatternErrorDetail) => {
    if (!editingId) return;
    await updateErrorDetail(editingId, detail);
  };

  const handleErrorDelete = async (detailId: string) => {
    if (!editingId) return;
    await deleteErrorDetail(editingId, detailId);
  };

  const handleAddBehavior = async () => {
    if (!editingId) {
      toast.error("먼저 노트를 선택하거나 저장해주세요.");
      return;
    }
    if (!behaviorDescription.trim()) {
      toast.error("행동 반응 설명을 입력해주세요.");
      return;
    }
    const validation = validateUserText(behaviorDescription, {
      minLength: 10,
      minLengthMessage: "행동 반응 설명을 10자 이상 입력해주세요.",
    });
    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }
    setSavingBehaviorAdd(true);
    try {
      const ok = await addBehaviorDetail({
        patternId: editingId,
        behaviorLabel,
        behaviorDescription,
        errorTags: behaviorErrorTags,
      });
      if (ok) {
        setBehaviorLabel("");
        setBehaviorDescription("");
        setBehaviorErrorTags([]);
        toast.success("저장되었습니다.");
      }
    } finally {
      setSavingBehaviorAdd(false);
    }
  };

  const handleBehaviorUpdate = async (detail: PatternBehaviorDetail) => {
    if (!editingId) return;
    await updateBehaviorDetail(editingId, detail);
  };

  const handleBehaviorDelete = async (detailId: string) => {
    if (!editingId) return;
    await deleteBehaviorDetail(editingId, detailId);
  };

  const openEditor = (
    type:
      | "trigger-edit"
      | "details-edit"
      | "details-add"
      | "errors-edit"
      | "errors-add"
      | "alternatives-edit"
      | "alternatives-add"
      | "behaviors-edit"
      | "behaviors-add",
    pattern: Pattern
  ) => {
    setIsCreating(false);
    loadPatternForEdit(pattern);
    setActiveEditor({ type, patternId: pattern.id });
  };

  const closeEditor = () => {
    setActiveEditor(null);
    clearEditing();
  };

  const handleTriggerSave = async () => {
    if (!editingId) return;
    if (!title.trim()) {
      toast.error("감정패턴 제목을 입력해주세요.");
      return;
    }
    const validation = validateUserText(trigger, {
      minLength: 10,
      minLengthMessage: "상황을 10자 이상 입력해주세요.",
    });
    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }
    setSavingTrigger(true);
    try {
      const ok = await updatePattern({
        id: editingId,
        title,
        trigger,
        behavior,
      });
      if (ok) {
        toast.success("저장되었습니다.");
        closeEditor();
      }
    } finally {
      setSavingTrigger(false);
    }
  };

  const handleDetailDeleteFromCard = async (
    patternId: string,
    detailId: string
  ) => {
    setDeletingDetails((prev) => ({ ...prev, [detailId]: true }));
    try {
      await deleteDetail(patternId, detailId);
      toast.success("삭제되었습니다.");
    } catch (e) {
      console.error(e);
      toast.error("삭제에 실패했습니다.");
    } finally {
      setDeletingDetails((prev) => ({ ...prev, [detailId]: false }));
    }
  };

  const handleAlternativeDeleteFromCard = async (
    patternId: string,
    alternativeId: string
  ) => {
    setDeletingAlternatives((prev) => ({ ...prev, [alternativeId]: true }));
    try {
      await deleteAlternative(patternId, alternativeId);
      toast.success("삭제되었습니다.");
    } catch (e) {
      console.error(e);
      toast.error("삭제에 실패했습니다.");
    } finally {
      setDeletingAlternatives((prev) => ({ ...prev, [alternativeId]: false }));
    }
  };

  const handleErrorDeleteFromCard = async (
    patternId: string,
    errorId: string
  ) => {
    setDeletingErrors((prev) => ({ ...prev, [errorId]: true }));
    try {
      await deleteErrorDetail(patternId, errorId);
      toast.success("삭제되었습니다.");
    } catch (e) {
      console.error(e);
      toast.error("삭제에 실패했습니다.");
    } finally {
      setDeletingErrors((prev) => ({ ...prev, [errorId]: false }));
    }
  };

  const handleBehaviorDeleteFromCard = async (
    patternId: string,
    behaviorId: string
  ) => {
    setDeletingBehaviors((prev) => ({ ...prev, [behaviorId]: true }));
    try {
      await deleteBehaviorDetail(patternId, behaviorId);
      toast.success("삭제되었습니다.");
    } catch (e) {
      console.error(e);
      toast.error("삭제에 실패했습니다.");
    } finally {
      setDeletingBehaviors((prev) => ({ ...prev, [behaviorId]: false }));
    }
  };

  const activePattern = activeEditor
    ? patterns.find((pattern) => pattern.id === activeEditor.patternId) ?? null
    : null;

  return (
    <div className="max-w-[1800px] mx-auto px-8 py-8">
      <FeatureHeader
        overline="Emotion Notes"
        title="감정 노트"
        subtitle="AI 제안을 참고해 반복되는 감정 패턴을 기록하세요."
        icon={HeartPulse}
        iconClassName="text-indigo-600"
      />

      <PatternEditModal
        open={isCreating}
        title="감정노트 추가"
        chromeless
        hideClose
        onOpenChange={(nextOpen) => {
          if (!nextOpen) resetForm();
        }}
      >
        <CreatePatternCard
          title={title}
          trigger={trigger}
          loading={loading}
          titleRef={titleRef}
          onChangeTitle={setTitle}
          onChangeTrigger={setTrigger}
          onSave={handleCreate}
          onCancel={resetForm}
        />
      </PatternEditModal>

      {patterns.length > 0 && (
        <Card className="p-6 mb-6 bg-slate-50 border-slate-200">
          <h3 className="text-lg text-slate-800 mb-3 flex items-center gap-2">
            <Sparkles className="size-5 text-slate-400" />
            패턴 요약
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-slate-200 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-600">총 패턴 수</p>
              <p className="text-3xl text-slate-700">{patterns.length}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-600 mb-1">가장 빈번한 패턴</p>
              {mostFrequentPattern ? (
                <button
                  type="button"
                  onClick={() => {
                    const targetId = mostFrequentPattern.id;
                    const el = document.getElementById(`pattern-${targetId}`);
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  className="block w-full text-left text-base text-slate-700 truncate hover:underline"
                >
                  {mostFrequentPattern.trigger || "-"}
                </button>
              ) : (
                <p className="text-base text-slate-700 truncate">-</p>
              )}
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-200 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-600">총 발생 횟수</p>
              <p className="text-3xl text-slate-700">
                {patterns.reduce((sum, p) => sum + p.frequency, 0)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <Card className="p-12 text-center">
          <HeartPulse className="size-16 text-slate-300 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-500 text-lg mb-2">
            감정 노트를 불러오는 중입니다...
          </p>
        </Card>
      ) : patterns.length === 0 ? (
        <Card className="p-12 text-center">
          <HeartPulse className="size-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg mb-2">
            아직 저장된 패턴이 없습니다.
          </p>
          <p className="text-slate-400">반복되는 감정 패턴을 기록해보세요.</p>
        </Card>
      ) : (
        <div className="space-y-12">
          {latestSortedPatterns.map((pattern) => (
            <PatternCard
              key={pattern.id}
              pattern={pattern}
              loading={loading}
              confirmDeleteId={confirmDeleteId}
              formatDate={formatDate}
              formatThoughtTitle={formatThoughtTitle}
              formatAlternativeTitle={formatAlternativeTitle}
              formatErrorTitle={formatErrorTitle}
              formatBehaviorTitle={formatBehaviorTitle}
              expandedDetails={expandedDetails}
              setExpandedDetails={setExpandedDetails}
              expandedAlternatives={expandedAlternatives}
              setExpandedAlternatives={setExpandedAlternatives}
              expandedErrors={expandedErrors}
              setExpandedErrors={setExpandedErrors}
              expandedBehaviors={expandedBehaviors}
              setExpandedBehaviors={setExpandedBehaviors}
              getFrequencyBadgeStyle={getFrequencyBadgeStyle}
              onIncrementFrequency={incrementFrequency}
              onDecrementFrequency={decrementFrequency}
              onEditTrigger={(pattern) => openEditor("trigger-edit", pattern)}
              onEditDetails={(pattern) => openEditor("details-edit", pattern)}
              onAddDetails={(pattern) => openEditor("details-add", pattern)}
              onEditAlternatives={(pattern) =>
                openEditor("alternatives-edit", pattern)
              }
              onAddAlternatives={(pattern) =>
                openEditor("alternatives-add", pattern)
              }
              onEditErrors={(pattern) => openEditor("errors-edit", pattern)}
              onAddErrors={(pattern) => openEditor("errors-add", pattern)}
              onEditBehaviors={(pattern) =>
                openEditor("behaviors-edit", pattern)
              }
              onAddBehaviors={(pattern) =>
                openEditor("behaviors-add", pattern)
              }
              onRequestDelete={requestDelete}
              onConfirmDelete={handleDeletePattern}
              onCancelDelete={cancelDelete}
              onDeleteDetail={handleDetailDeleteFromCard}
              onDeleteAlternative={handleAlternativeDeleteFromCard}
              onDeleteError={handleErrorDeleteFromCard}
              onDeleteBehavior={handleBehaviorDeleteFromCard}
              deletingDetails={deletingDetails}
              deletingAlternatives={deletingAlternatives}
              deletingErrors={deletingErrors}
              deletingBehaviors={deletingBehaviors}
              openOuterSection={
                openOuterSection?.patternId === pattern.id
                  ? openOuterSection.section
                  : null
              }
              onToggleOuterSection={(section) => {
                setOpenOuterSection((prev) => {
                  if (
                    prev?.patternId === pattern.id &&
                    prev.section === section
                  ) {
                    return null;
                  }
                  return { patternId: pattern.id, section };
                });
              }}
            />
          ))}
        </div>
      )}

      <PatternEditModal
        open={activeEditor?.type === "trigger-edit"}
        title="트리거 텍스트 편집"
        chromeless
        hideClose
        onOpenChange={(nextOpen) => {
          if (!nextOpen) closeEditor();
        }}
      >
        {activePattern && (
          <PatternTriggerSection
            title={title}
            trigger={trigger}
            loading={savingTrigger}
            saveDisabled={
              title.trim() === activePattern.title.trim() &&
              trigger.trim() === activePattern.trigger.trim()
            }
            onChangeTitle={setTitle}
            onChangeTrigger={setTrigger}
            onSave={handleTriggerSave}
            onCancel={closeEditor}
          />
        )}
      </PatternEditModal>

      <PatternEditModal
        open={activeEditor?.type === "details-edit"}
        title="배후의 자동 사고 편집"
        chromeless
        hideClose
        onOpenChange={(nextOpen) => {
          if (!nextOpen) closeEditor();
        }}
      >
        {activePattern && (
          <PatternDetailsSection
            details={activePattern.details}
            onUpdateDetail={handleDetailUpdate}
            onDeleteDetail={handleDetailDelete}
          />
        )}
      </PatternEditModal>

      <PatternEditModal
        open={activeEditor?.type === "errors-edit"}
        title="인지오류 편집"
        chromeless
        hideClose
        onOpenChange={(nextOpen) => {
          if (!nextOpen) closeEditor();
        }}
      >
        {activePattern && (
          <PatternErrorSection
            errorDetails={activePattern.errorDetails ?? []}
            onUpdateError={handleErrorUpdate}
            onDeleteError={handleErrorDelete}
          />
        )}
      </PatternEditModal>

      <PatternEditModal
        open={activeEditor?.type === "alternatives-edit"}
        title="대안적 접근 편집"
        chromeless
        hideClose
        onOpenChange={(nextOpen) => {
          if (!nextOpen) closeEditor();
        }}
      >
        {activePattern && (
          <PatternAlternativesSection
            alternatives={activePattern.alternatives}
            onUpdateAlternative={handleAlternativeUpdate}
            onDeleteAlternative={handleAlternativeDelete}
          />
        )}
      </PatternEditModal>

      <PatternEditModal
        open={activeEditor?.type === "behaviors-edit"}
        title="행동 반응 편집"
        chromeless
        hideClose
        onOpenChange={(nextOpen) => {
          if (!nextOpen) closeEditor();
        }}
      >
        {activePattern && (
          <PatternBehaviorSection
            behaviorDetails={activePattern.behaviorDetails ?? []}
            onUpdateBehavior={handleBehaviorUpdate}
            onDeleteBehavior={handleBehaviorDelete}
          />
        )}
      </PatternEditModal>

      <PatternEditModal
        open={activeEditor?.type === "details-add"}
        title="배후의 자동 사고 추가"
        hideClose
        chromeless
        onOpenChange={(nextOpen) => {
          if (!nextOpen) closeEditor();
        }}
      >
        {activePattern && (
          <PatternDetailsAddSection
            triggerText={activePattern.trigger}
            automaticThought={automaticThought}
            emotion={emotion}
            loading={savingDetailAdd}
            onChangeAutomaticThought={setAutomaticThought}
            onSelectEmotion={setEmotion}
            onAddDetail={handleAddDetail}
          />
        )}
      </PatternEditModal>

      <PatternEditModal
        open={activeEditor?.type === "errors-add"}
        title="인지오류 추가"
        hideClose
        chromeless
        onOpenChange={(nextOpen) => {
          if (!nextOpen) closeEditor();
        }}
      >
        {activePattern && (
          <PatternErrorAddSection
            triggerText={activePattern.trigger}
            details={activePattern.details}
            errorLabel={errorLabel}
            errorDescription={errorDescription}
            loading={savingErrorAdd}
            onChangeErrorLabel={setErrorLabel}
            onChangeErrorDescription={setErrorDescription}
            onAddErrorDetail={handleAddError}
          />
        )}
      </PatternEditModal>

      <PatternEditModal
        open={activeEditor?.type === "alternatives-add"}
        title="대안적 접근 추가"
        hideClose
        chromeless
        onOpenChange={(nextOpen) => {
          if (!nextOpen) closeEditor();
        }}
      >
        {activePattern && (
          <PatternAlternativesAddSection
            triggerText={activePattern.trigger}
            details={activePattern.details}
            errorDetails={activePattern.errorDetails ?? []}
            alternativeText={alternativeText}
            loading={savingAlternativeAdd}
            onChangeAlternativeText={setAlternativeText}
            onAddAlternative={handleAddAlternative}
          />
        )}
      </PatternEditModal>

      <PatternEditModal
        open={activeEditor?.type === "behaviors-add"}
        title="행동 반응 추가"
        hideClose
        chromeless
        onOpenChange={(nextOpen) => {
          if (!nextOpen) closeEditor();
        }}
      >
        {activePattern && (
          <PatternBehaviorAddSection
            triggerText={activePattern.trigger}
            details={activePattern.details}
            errorDetails={activePattern.errorDetails ?? []}
            alternatives={activePattern.alternatives}
            behaviorLabel={behaviorLabel}
            behaviorDescription={behaviorDescription}
            behaviorErrorTags={behaviorErrorTags}
            loading={savingBehaviorAdd}
            onChangeBehaviorLabel={setBehaviorLabel}
            onChangeBehaviorDescription={setBehaviorDescription}
            onChangeBehaviorErrorTags={setBehaviorErrorTags}
            onAddBehaviorDetail={handleAddBehavior}
          />
        )}
      </PatternEditModal>

      <SelectedSectionActions
        hidden={!showSelectedActions}
        theme={openOuterSection?.section ?? "details"}
        onAdd={() => {
          if (!openOuterSection || !selectedPattern) return;
          switch (openOuterSection.section) {
            case "details":
              openEditor("details-add", selectedPattern);
              return;
            case "errors":
              openEditor("errors-add", selectedPattern);
              return;
            case "alternatives":
              openEditor("alternatives-add", selectedPattern);
              return;
            case "behaviors":
              openEditor("behaviors-add", selectedPattern);
              return;
          }
        }}
        onEdit={() => {
          if (!openOuterSection || !selectedPattern) return;
          switch (openOuterSection.section) {
            case "details":
              openEditor("details-edit", selectedPattern);
              return;
            case "errors":
              openEditor("errors-edit", selectedPattern);
              return;
            case "alternatives":
              openEditor("alternatives-edit", selectedPattern);
              return;
            case "behaviors":
              openEditor("behaviors-edit", selectedPattern);
              return;
          }
        }}
        addAriaLabel="선택 섹션 추가"
        editAriaLabel="선택 섹션 편집"
      />

      <ScrollToTopButton
        hidden={Boolean(isCreating || activeEditor || openOuterSection)}
        showAction={!isCreating && !activeEditor && !openOuterSection}
        actionLabel="새 감정노트 저장"
        onActionClick={startCreate}
        actionClassName="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
      />
    </div>
  );
}
