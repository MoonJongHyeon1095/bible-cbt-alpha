import type { User } from "@supabase/supabase-js";
import {
  AlertCircle,
  Brain,
  ChevronDown,
  ChevronRight,
  Edit2,
  Footprints,
  HeartPulse,
  Lightbulb,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { EMOTIONS } from "../../center/constants/emotions";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { PatternAlternativesCard } from "./PatternAlternativesCard";
import { PatternDetailsCard } from "./PatternDetailsCard";
import type { Pattern, PatternAlternative, PatternDetail } from "./types";
import {
  createAlternativeAPI,
  createDetailAPI,
  createNoteAPI,
  deleteAlternativeAPI,
  deleteDetailAPI,
  deleteNoteAPI,
  fetchNotesAPI,
  updateAlternativeAPI,
  updateDetailAPI,
  updateNoteAPI,
} from "./utils/api";
import { loadLocalPatterns, saveLocalPatterns } from "./utils/storage";

interface PatternsPageProps {
  user: User | null;
}

export function PatternsPage({ user }: PatternsPageProps) {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [trigger, setTrigger] = useState("");
  const [automaticThought, setAutomaticThought] = useState("");
  const [emotion, setEmotion] = useState("");
  const [behavior, setBehavior] = useState("");
  const [alternativeText, setAlternativeText] = useState("");
  const titleRef = useRef<HTMLInputElement | null>(null);
  const [showDetailEditor, setShowDetailEditor] = useState(false);
  const [showAlternativeEditor, setShowAlternativeEditor] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState<
    Record<string, boolean>
  >({});
  const [expandedAlternatives, setExpandedAlternatives] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    if (showDetailEditor) {
      setAutomaticThought("");
      setEmotion("");
    }
  }, [showDetailEditor, editingId]);

  useEffect(() => {
    if (showAlternativeEditor) {
      setAlternativeText("");
    }
  }, [showAlternativeEditor, editingId]);

  useEffect(() => {
    loadPatterns();
  }, [user]);

  useEffect(() => {
    if (isCreating && editingId && titleRef.current) {
      titleRef.current.focus();
    }
  }, [isCreating, editingId]);

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

  const mapDetailRow = (row: any): PatternDetail => ({
    id: String(row.id),
    automaticThought: row.automatic_thought ?? row.automaticThought ?? "",
    emotion: row.emotion ?? "",
    createdAt: row.created_at ?? row.createdAt ?? "",
  });

  const mapAlternativeRow = (row: any): PatternAlternative => ({
    id: String(row.id),
    noteId: String(row.note_id ?? row.noteId ?? ""),
    alternative: row.alternative ?? row.alternativeThought ?? "",
    createdAt: row.created_at ?? row.createdAt ?? "",
  });

  const mapPatternRow = (row: any): Pattern => {
    const rawDetails = row.details ?? row.emotion_note_details ?? [];
    const details = Array.isArray(rawDetails)
      ? rawDetails
          .map(mapDetailRow)
          .sort((a: PatternDetail, b: PatternDetail) =>
            (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
          )
      : [];
    const rawAlternatives =
      row.alternatives ?? row.emotion_alternative_details ?? [];
    const alternatives = Array.isArray(rawAlternatives)
      ? rawAlternatives
          .map(mapAlternativeRow)
          .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
      : [];

    return {
      id: String(row.id),
      title: row.title ?? "",
      trigger: row.trigger ?? row.trigger_text ?? "",
      behavior: row.behavior ?? "",
      frequency: Number(row.frequency) || 1,
      timestamp: row.timestamp ?? row.createdAt ?? row.created_at ?? "",
      details,
      alternatives,
    };
  };

  const sortDetailsDesc = (list: PatternDetail[]) =>
    [...list].sort((a, b) =>
      (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
    );

  const sortAlternativesDesc = (list: PatternAlternative[]) =>
    [...list].sort((a, b) =>
      (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
    );

  const loadPatterns = async () => {
    setLoading(true);

    // 로그인 상태: Supabase에서 로드
    if (user) {
      try {
        const { ok, payload } = await fetchNotesAPI(true);
        if (!ok)
          throw new Error(payload?.error || "감정 노트를 불러오지 못했습니다.");

        const mapped = Array.isArray(payload?.notes)
          ? payload.notes.map(mapPatternRow)
          : [];

        setPatterns(mapped);
        return;
      } catch (e) {
        console.error("패턴 로드 실패:", e);
        toast.error("감정 노트를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }

    // 비로그인: 로컬 저장소
    const mapped = loadLocalPatterns();
    setPatterns(mapped);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!title.trim() || !trigger.trim()) {
      toast.error("제목과 트리거를 입력해주세요.");
      return;
    }

    // 로그인 상태: Supabase에 저장
    if (user) {
      try {
        setLoading(true);
        const { ok, payload } = await createNoteAPI({
          title: title.trim(),
          trigger: trigger.trim(),
          behavior: behavior.trim(),
        });
        if (!ok || !payload?.note) {
          throw new Error(payload?.error || "감정 노트를 저장하지 못했습니다.");
        }

        const details: PatternDetail[] = Array.isArray(payload.note.details)
          ? sortDetailsDesc(payload.note.details.map(mapDetailRow))
          : [];
        const alternatives: PatternAlternative[] = Array.isArray(
          payload.note.alternatives
        )
          ? sortAlternativesDesc(
              payload.note.alternatives.map(mapAlternativeRow)
            )
          : [];
        const newPattern: Pattern = {
          id: String(payload.note.id),
          title: payload.note.title ?? "",
          trigger: payload.note.trigger ?? "",
          behavior: payload.note.behavior ?? "",
          frequency: Number(payload.note.frequency) || 1,
          timestamp: payload.note.createdAt ?? new Date().toISOString(),
          details,
          alternatives,
        };

        setPatterns((prev) => [newPattern, ...prev]);
      } catch (e) {
        console.error("패턴 저장 실패:", e);
        toast.error("감정 노트를 저장하지 못했습니다.");
        return;
      } finally {
        setLoading(false);
        resetForm();
      }
      return;
    }

    const newPattern: Pattern = {
      id: Date.now().toString(),
      title: title.trim(),
      trigger: trigger.trim(),
      behavior: behavior.trim(),
      timestamp: new Date().toISOString(),
      frequency: 1,
      details: [],
      alternatives: [],
    };

    const updated = [newPattern, ...patterns];
    setPatterns(updated);
    saveLocalPatterns(updated);
    resetForm();
  };

  const updateDetailForPattern = (
    patternId: string,
    nextDetail: PatternDetail
  ) => {
    setPatterns((prev) =>
      prev.map((p) =>
        p.id === patternId
          ? {
              ...p,
              details: sortDetailsDesc([
                nextDetail,
                ...p.details.filter((d) => d.id !== nextDetail.id),
              ]),
            }
          : p
      )
    );
  };

  const updateAlternativeForPattern = (
    patternId: string,
    nextAlternative: PatternAlternative
  ) => {
    setPatterns((prev) =>
      prev.map((p) =>
        p.id === patternId
          ? {
              ...p,
              alternatives: sortAlternativesDesc([
                nextAlternative,
                ...p.alternatives.filter((a) => a.id !== nextAlternative.id),
              ]),
            }
          : p
      )
    );
  };

  const removeDetailForPattern = (patternId: string, detailId: string) => {
    setPatterns((prev) =>
      prev.map((p) =>
        p.id === patternId
          ? { ...p, details: p.details.filter((d) => d.id !== detailId) }
          : p
      )
    );
  };

  const removeAlternativeForPattern = (
    patternId: string,
    alternativeId: string
  ) => {
    setPatterns((prev) =>
      prev.map((p) =>
        p.id === patternId
          ? {
              ...p,
              alternatives: p.alternatives.filter(
                (a) => a.id !== alternativeId
              ),
            }
          : p
      )
    );
  };

  const handleDetailUpdate = async (detail: PatternDetail) => {
    if (!editingId) return;

    if (user) {
      const { ok, payload } = await updateDetailAPI({
        id: detail.id,
        automaticThought: detail.automaticThought,
        emotion: detail.emotion,
      });
      if (!ok || !payload?.detail) {
        throw new Error(payload?.error || "자동사고를 수정하지 못했습니다.");
      }
      updateDetailForPattern(editingId, mapDetailRow(payload.detail));
      return;
    }

    updateDetailForPattern(editingId, detail);
    saveLocalPatterns(
      patterns.map((p) =>
        p.id === editingId
          ? {
              ...p,
              details: p.details.map((d) => (d.id === detail.id ? detail : d)),
            }
          : p
      )
    );
  };

  const handleDetailDelete = async (detailId: string) => {
    if (!editingId) return;

    if (user) {
      const { ok, payload } = await deleteDetailAPI(detailId);
      if (!ok) {
        throw new Error(payload?.error || "자동사고를 삭제하지 못했습니다.");
      }
      removeDetailForPattern(editingId, detailId);
      return;
    }

    removeDetailForPattern(editingId, detailId);
    saveLocalPatterns(
      patterns.map((p) =>
        p.id === editingId
          ? { ...p, details: p.details.filter((d) => d.id !== detailId) }
          : p
      )
    );
  };

  const handleAlternativeUpdate = async (alternative: PatternAlternative) => {
    if (!editingId) return;

    if (user) {
      const { ok, payload } = await updateAlternativeAPI({
        id: alternative.id,
        alternative: alternative.alternative,
      });
      if (!ok || !payload?.alternative) {
        throw new Error(payload?.error || "대안 사고를 수정하지 못했습니다.");
      }
      updateAlternativeForPattern(
        editingId,
        mapAlternativeRow(payload.alternative)
      );
      return;
    }

    updateAlternativeForPattern(editingId, alternative);
    saveLocalPatterns(
      patterns.map((p) =>
        p.id === editingId
          ? {
              ...p,
              alternatives: p.alternatives.map((a) =>
                a.id === alternative.id ? alternative : a
              ),
            }
          : p
      )
    );
  };

  const handleAlternativeDelete = async (alternativeId: string) => {
    if (!editingId) return;

    if (user) {
      const { ok, payload } = await deleteAlternativeAPI(alternativeId);
      if (!ok) {
        throw new Error(payload?.error || "대안 사고를 삭제하지 못했습니다.");
      }
      removeAlternativeForPattern(editingId, alternativeId);
      return;
    }

    removeAlternativeForPattern(editingId, alternativeId);
    saveLocalPatterns(
      patterns.map((p) =>
        p.id === editingId
          ? {
              ...p,
              alternatives: p.alternatives.filter(
                (a) => a.id !== alternativeId
              ),
            }
          : p
      )
    );
  };

  const handleAddAlternative = async () => {
    if (!editingId) {
      toast.error("먼저 노트를 선택하거나 저장해주세요.");
      return;
    }
    if (!alternativeText.trim()) {
      toast.error("대안 사고를 입력해주세요.");
      return;
    }

    const newAlternative: PatternAlternative = {
      id: Date.now().toString(),
      noteId: editingId,
      alternative: alternativeText.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      if (user) {
        const { ok, payload } = await createAlternativeAPI({
          noteId: editingId,
          alternative: alternativeText.trim(),
        });
        if (!ok || !payload?.alternative) {
          throw new Error(payload?.error || "대안 사고를 추가하지 못했습니다.");
        }
        updateAlternativeForPattern(
          editingId,
          mapAlternativeRow(payload.alternative)
        );
      } else {
        updateAlternativeForPattern(editingId, newAlternative);
        saveLocalPatterns(
          patterns.map((p) =>
            p.id === editingId
              ? { ...p, alternatives: [newAlternative, ...p.alternatives] }
              : p
          )
        );
      }
      setAlternativeText("");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "대안 사고를 추가하지 못했습니다.");
    }
  };

  const handleAddDetail = async () => {
    if (!editingId) {
      toast.error("먼저 노트를 선택하거나 저장해주세요.");
      return;
    }
    if (!emotion.trim()) {
      toast.error("감정을 선택해주세요.");
      return;
    }
    if (!automaticThought.trim()) {
      toast.error("자동사고를 입력해주세요.");
      return;
    }

    const newDetailBase: PatternDetail = {
      id: Date.now().toString(),
      automaticThought: automaticThought.trim(),
      emotion: emotion.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      if (user) {
        const { ok, payload } = await createDetailAPI({
          noteId: editingId,
          automaticThought: automaticThought.trim(),
          emotion: emotion.trim(),
        });
        if (!ok || !payload?.detail) {
          throw new Error(payload?.error || "자동사고를 추가하지 못했습니다.");
        }
        const saved = mapDetailRow(payload.detail);
        updateDetailForPattern(editingId, saved);
      } else {
        updateDetailForPattern(editingId, newDetailBase);
        saveLocalPatterns(
          patterns.map((p) =>
            p.id === editingId
              ? { ...p, details: [newDetailBase, ...p.details] }
              : p
          )
        );
      }
      setAutomaticThought("");
      setEmotion("");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "자동사고를 추가하지 못했습니다.");
    }
  };

  const handleUpdate = async (id: string) => {
    if (!title.trim() || !trigger.trim()) {
      toast.error("제목과 트리거를 입력해주세요.");
      return;
    }

    // 로그인 상태: Supabase 업데이트
    if (user) {
      try {
        setLoading(true);
        const { ok, payload: notePayload } = await updateNoteAPI({
          id,
          title: title.trim(),
          trigger: trigger.trim(),
          behavior: behavior.trim(),
        });
        if (!ok || !notePayload?.note) {
          throw new Error(
            notePayload?.error || "감정 노트를 수정하지 못했습니다."
          );
        }

        const nextDetails = Array.isArray(notePayload.note.details)
          ? sortDetailsDesc(notePayload.note.details.map(mapDetailRow))
          : null;
        const nextAlternatives = Array.isArray(notePayload.note.alternatives)
          ? sortAlternativesDesc(
              notePayload.note.alternatives.map(mapAlternativeRow)
            )
          : null;

        const updated = patterns.map((pattern) =>
          pattern.id === id
            ? {
                id: String(notePayload.note.id),
                title: notePayload.note.title ?? "",
                trigger: notePayload.note.trigger ?? "",
                behavior: notePayload.note.behavior ?? "",
                frequency: Number(notePayload.note.frequency) || 1,
                timestamp: notePayload.note.createdAt ?? pattern.timestamp,
                details: nextDetails ?? pattern.details ?? [],
                alternatives: nextAlternatives ?? pattern.alternatives ?? [],
              }
            : pattern
        );
        setPatterns(updated);
      } catch (e) {
        console.error("패턴 수정 실패:", e);
        toast.error("감정 노트를 수정하지 못했습니다.");
        return;
      } finally {
        setLoading(false);
        resetForm();
      }
      return;
    }

    const updated = patterns.map((pattern) =>
      pattern.id === id
        ? {
            ...pattern,
            title: title.trim(),
            trigger: trigger.trim(),
            behavior: behavior.trim(),
          }
        : pattern
    );

    setPatterns(updated);
    saveLocalPatterns(updated);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (user) {
      try {
        setLoading(true);
        const { ok, payload } = await deleteNoteAPI(id);
        if (!ok)
          throw new Error(payload?.error || "감정 노트를 삭제하지 못했습니다.");
      } catch (e) {
        console.error("패턴 삭제 실패:", e);
        toast.error("감정 노트를 삭제하지 못했습니다.");
        return;
      } finally {
        setLoading(false);
      }
    }

    const updated = patterns.filter((pattern) => pattern.id !== id);
    setPatterns(updated);
    if (!user) {
      saveLocalPatterns(updated);
    }
    setConfirmDeleteId(null);
  };

  const requestDelete = (id: string) => {
    setConfirmDeleteId(id);
  };
  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const incrementFrequency = async (id: string) => {
    const target = patterns.find((p) => p.id === id);
    if (!target) return;

    if (user) {
      try {
        setLoading(true);
        const nextFrequency = (Number(target.frequency) || 1) + 1;
        const { ok, payload } = await updateNoteAPI({
          id,
          frequency: nextFrequency,
        });
        if (!ok || !payload?.note) {
          throw new Error(
            payload?.error || "발생 횟수를 업데이트하지 못했습니다."
          );
        }

        const data = payload.note;
        setPatterns((prev) =>
          prev.map((pattern) =>
            pattern.id === id
              ? {
                  id: String(data.id),
                  title: data.title ?? "",
                  trigger: data.trigger ?? "",
                  behavior: data.behavior ?? "",
                  frequency: Number(data.frequency) || nextFrequency,
                  timestamp: data.createdAt ?? pattern.timestamp,
                  details: pattern.details,
                  alternatives: pattern.alternatives,
                }
              : pattern
          )
        );
      } catch (e) {
        console.error("발생 횟수 증가 실패:", e);
        toast.error("발생 횟수를 업데이트하지 못했습니다.");
      } finally {
        setLoading(false);
      }
      return;
    }

    const updated = patterns.map((pattern) =>
      pattern.id === id
        ? {
            ...pattern,
            frequency: (pattern.frequency || 0) + 1,
          }
        : pattern
    );
    setPatterns(updated);
    saveLocalPatterns(updated);
  };

  const handleEdit = (pattern: Pattern) => {
    const primaryDetail = pattern.details[0];
    setEditingId(pattern.id);
    setTitle(pattern.title);
    setTrigger(pattern.trigger);
    setAutomaticThought("");
    setEmotion("");
    setBehavior(pattern.behavior);
    setIsCreating(true);
    setAlternativeText("");
    setShowDetailEditor(false);
    setShowAlternativeEditor(false);
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setTitle("");
    setTrigger("");
    setAutomaticThought("");
    setEmotion("");
    setBehavior("");
    setAlternativeText("");
    setShowDetailEditor(false);
    setShowAlternativeEditor(false);
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

  const emotionOptions = EMOTIONS.map((e) => e.label);

  const EmotionSelector = ({
    value,
    onSelect,
  }: {
    value: string;
    onSelect: (next: string) => void;
  }) => (
    <div className="flex flex-wrap gap-2">
      {emotionOptions.map((label) => {
        const active = value === label;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onSelect(label)}
            className={`px-3 py-1 text-xs rounded-full border transition ${
              active
                ? "bg-blue-600 text-white border-blue-600 shadow"
                : "bg-white text-slate-700 border-slate-200 hover:border-blue-400"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );

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
            onClick={() => setIsCreating(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <Plus className="size-5 mr-2" />
            추가
          </Button>
        )}
      </div>

      {/* 작성/수정 폼 */}
      {isCreating && (
        <Card className="p-6 mb-6 bg-indigo-50 border-2 border-indigo-200">
          <div className="flex items-start justify-between mb-4 gap-4">
            <h3 className="text-lg text-slate-900">
              {editingId ? "감정패턴 수정" : "추가"}
            </h3>
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  editingId ? handleUpdate(editingId) : handleCreate()
                }
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Save className="size-4 mr-2" />
                {editingId ? "수정 완료" : "저장"}
              </Button>
              <Button onClick={resetForm} variant="outline">
                <X className="size-4 mr-2" />
                취소
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-700 mb-2 block flex items-center gap-2">
                <AlertCircle className="size-4" />
                감정패턴 제목
              </label>
              <Input
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 사람들 앞에서 발표할 때"
                className="border-indigo-200"
              />
            </div>

            <div>
              <label className="text-sm text-slate-700 mb-2 flex items-center gap-2">
                <AlertCircle className="size-4" />
                트리거 (촉발 상황)
              </label>
              <Input
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                placeholder="어떤 상황에서 이 패턴이 나타나나요?"
                className="border-indigo-200"
              />
            </div>

            <div>
              <label className="text-sm text-slate-700 mb-2 flex items-center gap-2">
                <Footprints className="size-4" />
                행동 반응
              </label>
              <Textarea
                value={behavior}
                onChange={(e) => setBehavior(e.target.value)}
                placeholder="그 감정 때문에 어떻게 행동하나요?"
                className="min-h-[80px] border-indigo-200"
              />
            </div>

            {editingId ? (
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-lg bg-white">
                  <button
                    type="button"
                    onClick={() => setShowDetailEditor((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-800"
                  >
                    <span className="flex items-center gap-2">
                      <Brain className="size-4" />
                      배후의 자동 사고 편집
                    </span>
                    <span className="text-xs text-slate-500">
                      {showDetailEditor ? "접기" : "펼치기"}
                    </span>
                  </button>
                  {showDetailEditor && (
                    <div className="border-t border-slate-200 p-4 space-y-3">
                      <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50">
                        <div className="flex items-center justify-between gap-2 text-sm text-slate-700">
                          <div className="flex items-center gap-2">
                            💭 새로운 자동사고 추가
                          </div>
                          <Button
                            size="sm"
                            onClick={handleAddDetail}
                            disabled={
                              !emotion.trim() || !automaticThought.trim()
                            }
                            className="bg-yellow-500 text-slate-900 hover:bg-yellow-600"
                          >
                            <Save className="size-4 mr-1" />
                            자동사고 저장
                          </Button>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 mb-2">
                            감정 선택
                          </p>
                          <EmotionSelector
                            value={emotion}
                            onSelect={setEmotion}
                          />
                        </div>
                        <Textarea
                          value={automaticThought}
                          onChange={(e) => setAutomaticThought(e.target.value)}
                          placeholder="자동적으로 떠오르는 생각을 적어주세요."
                          className="min-h-[80px] border-indigo-200 bg-white"
                        />
                      </div>

                      <PatternDetailsCard
                        details={
                          patterns.find((p) => p.id === editingId)?.details ??
                          []
                        }
                        onUpdateDetail={handleDetailUpdate}
                        onDeleteDetail={handleDetailDelete}
                      />
                    </div>
                  )}
                </div>

                <div className="border border-green-200 rounded-lg bg-white">
                  <button
                    type="button"
                    onClick={() => setShowAlternativeEditor((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-800"
                  >
                    <span className="flex items-center gap-2">
                      <Lightbulb className="size-4" />
                      저장된 대안사고 편집
                    </span>
                    <span className="text-xs text-slate-500">
                      {showAlternativeEditor ? "접기" : "펼치기"}
                    </span>
                  </button>
                  {showAlternativeEditor && (
                    <div className="border-t border-green-200 p-4 space-y-3 bg-green-50">
                      <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50">
                        <div className="flex items-center justify-between gap-2 text-sm text-slate-700">
                          <div className="flex items-center gap-2">
                            💡 새로운 대안 사고 추가
                          </div>
                          <Button
                            size="sm"
                            onClick={handleAddAlternative}
                            disabled={!alternativeText.trim()}
                            className="bg-green-500 text-slate-900 hover:bg-green-600"
                          >
                            <Save className="size-4 mr-1" />
                            대안 사고 저장
                          </Button>
                        </div>
                        <Textarea
                          value={alternativeText}
                          onChange={(e) => setAlternativeText(e.target.value)}
                          placeholder="대안적 사고를 적어주세요."
                          className="min-h-[80px] border-green-200"
                        />
                      </div>

                      <PatternAlternativesCard
                        alternatives={
                          patterns.find((p) => p.id === editingId)
                            ?.alternatives ?? []
                        }
                        onUpdateAlternative={handleAlternativeUpdate}
                        onDeleteAlternative={handleAlternativeDelete}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </Card>
      )}

      {/* 패턴 통계 */}
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
                    setEditingId(null);
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

      {/* 패턴 목록 */}
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
            <Card
              id={`pattern-${pattern.id}`}
              key={pattern.id}
              className="p-6 hover:shadow-lg transition-shadow bg-white border-indigo-100"
            >
              <div className="mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                    {pattern.frequency}회 발생
                  </span>
                  <button
                    onClick={() => incrementFrequency(pattern.id)}
                    className="text-green-600 hover:text-green-700 px-3 py-1 bg-green-50 rounded text-sm"
                    disabled={loading}
                    title="발생 횟수 +1"
                  >
                    +1회
                  </button>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="text-xl text-slate-900 mb-2">
                      {pattern.title}
                    </h3>
                    <p className="text-xs text-slate-400">
                      최초 기록: {formatDate(pattern.timestamp)}
                    </p>
                    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                        <AlertCircle className="size-4" />
                        트리거 텍스트
                      </p>
                      <p className="text-sm text-slate-800 whitespace-pre-wrap">
                        {pattern.trigger}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(pattern)}
                      className="text-indigo-600 hover:text-indigo-700 p-1"
                      title="수정"
                    >
                      <Edit2 className="size-4" />
                    </button>
                    <button
                      onClick={() => requestDelete(pattern.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="삭제"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
                {confirmDeleteId === pattern.id && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
                    <span>
                      이 노트와 관련된 자동사고, 대안사고, 행동의 기록도
                      삭제됩니다.
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        onClick={() => handleDelete(pattern.id)}
                        variant="destructive"
                        size="sm"
                        disabled={loading}
                        className="bg-red-600 text-white hover:bg-red-500"
                      >
                        삭제
                      </Button>
                      <Button
                        type="button"
                        onClick={cancelDelete}
                        variant="outline"
                        size="sm"
                        disabled={loading}
                        className="border-red-200 text-red-700 hover:bg-red-100"
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pattern.details.length > 0 ? (
                  <div className="md:col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                        <Brain className="size-4" />
                        배후의 자동 사고
                      </div>
                      <span className="text-xs text-amber-800">
                        {pattern.details.length}개
                      </span>
                    </div>
                    <div className="space-y-2">
                      {pattern.details.map((detail) => (
                        <div
                          key={detail.id}
                          className="rounded-lg border border-amber-200/80 bg-white p-3 shadow-sm"
                        >
                          {(() => {
                            const detailKey = `${pattern.id}-${detail.id}`;
                            const isExpanded = Boolean(
                              expandedDetails[detailKey]
                            );
                            return (
                              <>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span
                                      className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 font-semibold text-blue-700"
                                      style={{
                                        fontSize: "14px",
                                        lineHeight: "1",
                                      }}
                                    >
                                      {detail.emotion || "-"}
                                    </span>
                                    <span
                                      className="text-slate-400"
                                      style={{
                                        fontSize: "14px",
                                        lineHeight: "1",
                                      }}
                                    >
                                      {detail.createdAt
                                        ? new Date(
                                            detail.createdAt
                                          ).toLocaleDateString("ko-KR")
                                        : ""}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedDetails((prev) => ({
                                        ...prev,
                                        [detailKey]: !isExpanded,
                                      }))
                                    }
                                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                                    title={
                                      isExpanded
                                        ? "배후의 자동 사고 접기"
                                        : "배후의 자동 사고 펼치기"
                                    }
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="size-4 text-slate-400" />
                                    ) : (
                                      <ChevronRight className="size-4 text-slate-400" />
                                    )}
                                    <span className="min-w-0 flex-1 text-sm text-slate-600">
                                      {formatThoughtTitle(
                                        detail.automaticThought || "-"
                                      )}
                                    </span>
                                  </button>
                                </div>
                                {isExpanded && (
                                  <p className="mt-3 text-slate-800 text-sm whitespace-pre-wrap break-words">
                                    {detail.automaticThought || "-"}
                                  </p>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="md:col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                      <Brain className="size-4" />
                      배후의 자동 사고
                    </div>
                    <p className="mt-2 text-sm text-amber-900">
                      아직 배후의 자동 사고가 저장되지 않았습니다.
                    </p>
                  </div>
                )}

                <div className="behavior-card space-y-3">
                  <div>
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
                      <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold text-blue-900">
                        <Footprints className="size-4 text-blue-700" />
                        인지오류 및 행동
                      </p>
                      <p className="text-sm text-slate-800 whitespace-pre-wrap">
                        {pattern.behavior || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="alternatives-card rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm">
                  <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold text-green-900">
                    <Lightbulb className="size-4" />
                    대안적 접근
                  </p>
                  {pattern.alternatives.length ? (
                    <div className="space-y-2">
                      {pattern.alternatives.map((alt) => (
                        <div
                          key={alt.id}
                          className="rounded-lg border border-green-200 bg-white p-3 shadow-sm"
                        >
                          {(() => {
                            const altKey = `${pattern.id}-${alt.id}`;
                            const isExpanded = Boolean(
                              expandedAlternatives[altKey]
                            );
                            return (
                              <>
                                <div className="flex items-start justify-between gap-3">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedAlternatives((prev) => ({
                                        ...prev,
                                        [altKey]: !isExpanded,
                                      }))
                                    }
                                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                                    title={
                                      isExpanded
                                        ? "대안적 접근 접기"
                                        : "대안적 접근 펼치기"
                                    }
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="size-4 text-slate-400" />
                                    ) : (
                                      <ChevronRight className="size-4 text-slate-400" />
                                    )}
                                    <span className="min-w-0 flex-1 text-sm text-slate-600">
                                      {formatAlternativeTitle(
                                        alt.alternative || "-"
                                      )}
                                    </span>
                                  </button>
                                  <span
                                    className="text-slate-400"
                                    style={{
                                      fontSize: "14px",
                                      lineHeight: "1",
                                    }}
                                  >
                                    {alt.createdAt
                                      ? new Date(
                                          alt.createdAt
                                        ).toLocaleDateString("ko-KR")
                                      : ""}
                                  </span>
                                </div>
                                {isExpanded && (
                                  <p className="mt-3 text-slate-800 text-sm whitespace-pre-wrap break-words">
                                    {alt.alternative || "-"}
                                  </p>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-green-800 whitespace-pre-wrap">
                      아직 대안이 작성되지 않았습니다.
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
