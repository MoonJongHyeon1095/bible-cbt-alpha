import type { User } from "@supabase/supabase-js";
import { HeartPulse, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { PatternCard } from "./components/PatternCard";
import { PatternForm } from "./components/PatternForm";
import { usePatternForm } from "./hooks/usePatternForm";
import { usePatternsData } from "./hooks/usePatternsData";
import type {
  Pattern,
  PatternAlternative,
  PatternBehaviorDetail,
  PatternDetail,
  PatternErrorDetail,
} from "./types";

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
    setBehavior,
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
    showDetailEditor,
    setShowDetailEditor,
    showAlternativeEditor,
    setShowAlternativeEditor,
    showErrorEditor,
    setShowErrorEditor,
    showBehaviorEditor,
    setShowBehaviorEditor,
    startCreate,
    startEdit,
    resetForm,
  } = usePatternForm();
  const [expandedDetails, setExpandedDetails] = useState<
    Record<string, boolean>
  >({});
  const [expandedAlternatives, setExpandedAlternatives] = useState<
    Record<string, boolean>
  >({});
  const [expandedErrors, setExpandedErrors] = useState<
    Record<string, boolean>
  >({});
  const [expandedBehaviors, setExpandedBehaviors] = useState<
    Record<string, boolean>
  >({});

  const formatThoughtTitle = (content: string) => {
    const trimmed = content.trim();
    if (trimmed.length <= 20) return trimmed;
    return `${trimmed.slice(0, 20)}…`;
  };

  const formatAlternativeTitle = (content: string) => {
    const trimmed = content.trim();
    if (trimmed.length <= 20) return trimmed;
    return `${trimmed.slice(0, 20)}…`;
  };

  const formatErrorTitle = (content: string) => {
    const trimmed = content.trim();
    if (trimmed.length <= 20) return trimmed;
    return `${trimmed.slice(0, 20)}…`;
  };

  const formatBehaviorTitle = (content: string) => {
    const trimmed = content.trim();
    if (trimmed.length <= 20) return trimmed;
    return `${trimmed.slice(0, 20)}…`;
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

  const handleSave = async () => {
    if (editingId) {
      const ok = await updatePattern({
        id: editingId,
        title,
        trigger,
        behavior,
      });
      if (ok) resetForm();
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
    const ok = await addDetail({
      patternId: editingId,
      emotion,
      automaticThought,
    });
    if (ok) {
      setAutomaticThought("");
      setEmotion("");
    }
  };

  const handleAddAlternative = async () => {
    if (!editingId) {
      toast.error("먼저 노트를 선택하거나 저장해주세요.");
      return;
    }
    const ok = await addAlternative({
      patternId: editingId,
      alternativeText,
    });
    if (ok) {
      setAlternativeText("");
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
    const ok = await addErrorDetail({
      patternId: editingId,
      errorLabel,
      errorDescription,
    });
    if (ok) {
      setErrorLabel("");
      setErrorDescription("");
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

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-900 mb-2 flex items-center gap-3">
            <HeartPulse className="size-8 text-indigo-600" />
            감정 노트
          </h1>
          <p className="text-slate-600">반복되는 감정 패턴을 기록하세요.</p>
        </div>
        {!isCreating && (
          <Button
            onClick={startCreate}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <Plus className="size-5 mr-2" />
            추가
          </Button>
        )}
      </div>

      <PatternForm
        isCreating={isCreating}
        editingId={editingId}
        title={title}
        trigger={trigger}
        behavior={behavior}
        automaticThought={automaticThought}
        emotion={emotion}
        alternativeText={alternativeText}
        errorLabel={errorLabel}
        errorDescription={errorDescription}
        behaviorLabel={behaviorLabel}
        behaviorDescription={behaviorDescription}
        behaviorErrorTags={behaviorErrorTags}
        loading={loading}
        showDetailEditor={showDetailEditor}
        showAlternativeEditor={showAlternativeEditor}
        showErrorEditor={showErrorEditor}
        showBehaviorEditor={showBehaviorEditor}
        titleRef={titleRef}
        onChangeTitle={setTitle}
        onChangeTrigger={setTrigger}
        onChangeBehavior={setBehavior}
        onChangeAutomaticThought={setAutomaticThought}
        onSelectEmotion={setEmotion}
        onChangeAlternativeText={setAlternativeText}
        onChangeErrorLabel={setErrorLabel}
        onChangeErrorDescription={setErrorDescription}
        onChangeBehaviorLabel={setBehaviorLabel}
        onChangeBehaviorDescription={setBehaviorDescription}
        onChangeBehaviorErrorTags={setBehaviorErrorTags}
        onToggleDetailEditor={() => setShowDetailEditor((v) => !v)}
        onToggleAlternativeEditor={() => setShowAlternativeEditor((v) => !v)}
        onToggleErrorEditor={() => setShowErrorEditor((v) => !v)}
        onToggleBehaviorEditor={() => setShowBehaviorEditor((v) => !v)}
        onSave={handleSave}
        onCancel={resetForm}
        onAddDetail={handleAddDetail}
        onAddAlternative={handleAddAlternative}
        onAddErrorDetail={handleAddError}
        onAddBehaviorDetail={handleAddBehavior}
        patterns={patterns}
        onDetailUpdate={handleDetailUpdate}
        onDetailDelete={handleDetailDelete}
        onAlternativeUpdate={handleAlternativeUpdate}
        onAlternativeDelete={handleAlternativeDelete}
        onErrorUpdate={handleErrorUpdate}
        onErrorDelete={handleErrorDelete}
        onBehaviorUpdate={handleBehaviorUpdate}
        onBehaviorDelete={handleBehaviorDelete}
      />

      {patterns.length > 0 && (
        <Card className="p-6 mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <h3 className="text-lg text-slate-900 mb-3 flex items-center gap-2">
            📊 패턴 요약
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-indigo-200">
              <p className="text-sm text-slate-600 mb-1">총 패턴 수</p>
              <p className="text-3xl text-indigo-700">{patterns.length}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-purple-200">
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
                  className="block w-full text-left text-base text-purple-700 truncate hover:underline"
                >
                  {mostFrequentPattern.trigger || "-"}
                </button>
              ) : (
                <p className="text-base text-purple-700 truncate">-</p>
              )}
            </div>
            <div className="bg-white rounded-lg p-4 border border-pink-200">
              <p className="text-sm text-slate-600 mb-1">총 발생 횟수</p>
              <p className="text-3xl text-pink-700">
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
        <div className="space-y-4">
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
              onEdit={startEdit}
              onRequestDelete={requestDelete}
              onConfirmDelete={deletePattern}
              onCancelDelete={cancelDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
