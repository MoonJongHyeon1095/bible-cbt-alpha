import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  Pattern,
  PatternAlternative,
  PatternBehaviorDetail,
  PatternDetail,
  PatternErrorDetail,
} from "../types";
import {
  createAlternativeAPI,
  createBehaviorDetailAPI,
  createDetailAPI,
  createErrorDetailsAPI,
  createNoteAPI,
  deleteAlternativeAPI,
  deleteBehaviorDetailAPI,
  deleteDetailAPI,
  deleteErrorDetailAPI,
  deleteNoteAPI,
  fetchNotesAPI,
  updateBehaviorDetailAPI,
  updateAlternativeAPI,
  updateDetailAPI,
  updateErrorDetailAPI,
  updateNoteAPI,
} from "../utils/api";
import { useFrequencySync } from "./useFrequencySync";

interface UsePatternsDataParams {
  user: User | null;
}

export function usePatternsData({ user }: UsePatternsDataParams) {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const frequencySync = useFrequencySync({ user, patterns, setPatterns });

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

  const mapErrorRow = (row: any): PatternErrorDetail => ({
    id: String(row.id),
    noteId: String(row.note_id ?? row.noteId ?? ""),
    errorLabel: row.error_label ?? row.errorLabel ?? "",
    errorDescription: row.error_description ?? row.errorDescription ?? "",
    createdAt: row.created_at ?? row.createdAt ?? "",
  });

  const mapBehaviorRow = (row: any): PatternBehaviorDetail => ({
    id: String(row.id),
    noteId: String(row.note_id ?? row.noteId ?? ""),
    behaviorLabel: row.behavior_label ?? row.behaviorLabel ?? "",
    behaviorDescription: row.behavior_description ?? row.behaviorDescription ?? "",
    errorTags: Array.isArray(row.error_tags ?? row.errorTags)
      ? (row.error_tags ?? row.errorTags)
      : [],
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
    const rawErrors = row.errorDetails ?? row.emotion_error_details ?? [];
    const errorDetails = Array.isArray(rawErrors)
      ? rawErrors
          .map(mapErrorRow)
          .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
      : [];
    const rawBehaviors =
      row.behaviorDetails ?? row.emotion_behavior_details ?? [];
    const behaviorDetails = Array.isArray(rawBehaviors)
      ? rawBehaviors
          .map(mapBehaviorRow)
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
      errorDetails,
      behaviorDetails,
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

  const sortErrorsDesc = (list: PatternErrorDetail[]) =>
    [...list].sort((a, b) =>
      (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
    );

  const sortBehaviorsDesc = (list: PatternBehaviorDetail[]) =>
    [...list].sort((a, b) =>
      (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
    );

  const loadPatterns = async () => {
    setLoading(true);

    if (user) {
      try {
        const { ok, payload } = await fetchNotesAPI(true);
        if (!ok)
          throw new Error(payload?.error || "감정 노트를 불러오지 못했습니다.");

        const mapped = Array.isArray(payload?.notes)
          ? payload.notes.map(mapPatternRow)
          : [];

        const merged = frequencySync.applyPendingFrequency(mapped);
        setPatterns(merged);
        frequencySync.flushPendingForPatterns(merged);
        return;
      } catch (e) {
        console.error("패턴 로드 실패:", e);
        toast.error("감정 노트를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }
    setPatterns([]);
    setLoading(false);
  };

  useEffect(() => {
    loadPatterns();
  }, [user]);

  const createPattern = async (payload: {
    title: string;
    trigger: string;
    behavior: string;
  }) => {
    if (!payload.title.trim() || !payload.trigger.trim()) {
      toast.error("제목과 트리거를 입력해주세요.");
      return false;
    }

    if (!user) {
      toast.error("로그인이 필요합니다.");
      return false;
    }

    try {
      setLoading(true);
      const { ok, payload: response } = await createNoteAPI({
        title: payload.title.trim(),
        trigger: payload.trigger.trim(),
        behavior: payload.behavior.trim(),
      });
      if (!ok || !response?.note) {
        throw new Error(response?.error || "감정 노트를 저장하지 못했습니다.");
      }

      const details: PatternDetail[] = Array.isArray(response.note.details)
        ? sortDetailsDesc(response.note.details.map(mapDetailRow))
        : [];
      const alternatives: PatternAlternative[] = Array.isArray(
        response.note.alternatives
      )
        ? sortAlternativesDesc(
            response.note.alternatives.map(mapAlternativeRow)
          )
        : [];
      const newPattern: Pattern = {
        id: String(response.note.id),
        title: response.note.title ?? "",
        trigger: response.note.trigger ?? "",
        behavior: response.note.behavior ?? "",
        frequency: Number(response.note.frequency) || 1,
        timestamp: response.note.createdAt ?? new Date().toISOString(),
        details,
        alternatives,
        errorDetails: Array.isArray(response.note.errorDetails)
          ? response.note.errorDetails.map(mapErrorRow)
          : [],
        behaviorDetails: Array.isArray(response.note.behaviorDetails)
          ? response.note.behaviorDetails.map(mapBehaviorRow)
          : [],
      };

      setPatterns((prev) => [newPattern, ...prev]);
      return true;
    } catch (e) {
      console.error("패턴 저장 실패:", e);
      toast.error("감정 노트를 저장하지 못했습니다.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updatePattern = async (payload: {
    id: string;
    title: string;
    trigger: string;
    behavior: string;
  }) => {
    if (!payload.title.trim() || !payload.trigger.trim()) {
      toast.error("제목과 트리거를 입력해주세요.");
      return false;
    }

    if (!user) {
      toast.error("로그인이 필요합니다.");
      return false;
    }

    try {
      setLoading(true);
      const { ok, payload: response } = await updateNoteAPI({
        id: payload.id,
        title: payload.title.trim(),
        trigger: payload.trigger.trim(),
        behavior: payload.behavior.trim(),
      });
      if (!ok || !response?.note) {
        throw new Error(
          response?.error || "감정 노트를 수정하지 못했습니다."
        );
      }

      const nextDetails = Array.isArray(response.note.details)
        ? sortDetailsDesc(response.note.details.map(mapDetailRow))
        : null;
      const nextAlternatives = Array.isArray(response.note.alternatives)
        ? sortAlternativesDesc(
            response.note.alternatives.map(mapAlternativeRow)
          )
        : null;

      const updated = patterns.map((pattern) =>
        pattern.id === payload.id
          ? {
              id: String(response.note.id),
              title: response.note.title ?? "",
              trigger: response.note.trigger ?? "",
              behavior: response.note.behavior ?? "",
              frequency: Number(response.note.frequency) || 1,
              timestamp: response.note.createdAt ?? pattern.timestamp,
              details: nextDetails ?? pattern.details ?? [],
              alternatives: nextAlternatives ?? pattern.alternatives ?? [],
            }
          : pattern
      );
      setPatterns(updated);
      return true;
    } catch (e) {
      console.error("패턴 수정 실패:", e);
      toast.error("감정 노트를 수정하지 못했습니다.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deletePattern = async (id: string) => {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return false;
    }

    try {
      setLoading(true);
      const { ok, payload } = await deleteNoteAPI(id);
      if (!ok)
        throw new Error(payload?.error || "감정 노트를 삭제하지 못했습니다.");
    } catch (e) {
      console.error("패턴 삭제 실패:", e);
      toast.error("감정 노트를 삭제하지 못했습니다.");
      return false;
    } finally {
      setLoading(false);
    }

    const updated = patterns.filter((pattern) => pattern.id !== id);
    setPatterns(updated);
    setConfirmDeleteId(null);
    return true;
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

  const updateErrorForPattern = (
    patternId: string,
    nextError: PatternErrorDetail
  ) => {
    setPatterns((prev) =>
      prev.map((p) =>
        p.id === patternId
          ? {
              ...p,
              errorDetails: sortErrorsDesc([
                nextError,
                ...(p.errorDetails ?? []).filter((e) => e.id !== nextError.id),
              ]),
            }
          : p
      )
    );
  };

  const updateBehaviorForPattern = (
    patternId: string,
    nextBehavior: PatternBehaviorDetail
  ) => {
    setPatterns((prev) =>
      prev.map((p) =>
        p.id === patternId
          ? {
              ...p,
              behaviorDetails: sortBehaviorsDesc([
                nextBehavior,
                ...(p.behaviorDetails ?? []).filter(
                  (b) => b.id !== nextBehavior.id
                ),
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

  const removeErrorForPattern = (patternId: string, errorId: string) => {
    setPatterns((prev) =>
      prev.map((p) =>
        p.id === patternId
          ? {
              ...p,
              errorDetails: (p.errorDetails ?? []).filter((e) => e.id !== errorId),
            }
          : p
      )
    );
  };

  const removeBehaviorForPattern = (patternId: string, behaviorId: string) => {
    setPatterns((prev) =>
      prev.map((p) =>
        p.id === patternId
          ? {
              ...p,
              behaviorDetails: (p.behaviorDetails ?? []).filter(
                (b) => b.id !== behaviorId
              ),
            }
          : p
      )
    );
  };

  const updateDetail = async (patternId: string, detail: PatternDetail) => {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    const { ok, payload } = await updateDetailAPI({
      id: detail.id,
      automaticThought: detail.automaticThought,
      emotion: detail.emotion,
    });
    if (!ok || !payload?.detail) {
      throw new Error(payload?.error || "자동사고를 수정하지 못했습니다.");
    }
    updateDetailForPattern(patternId, mapDetailRow(payload.detail));
  };

  const deleteDetail = async (patternId: string, detailId: string) => {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    const { ok, payload } = await deleteDetailAPI(detailId);
    if (!ok) {
      throw new Error(payload?.error || "자동사고를 삭제하지 못했습니다.");
    }
    removeDetailForPattern(patternId, detailId);
  };

  const updateAlternative = async (
    patternId: string,
    alternative: PatternAlternative
  ) => {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    const { ok, payload } = await updateAlternativeAPI({
      id: alternative.id,
      alternative: alternative.alternative,
    });
    if (!ok || !payload?.alternative) {
      throw new Error(payload?.error || "대안 사고를 수정하지 못했습니다.");
    }
    updateAlternativeForPattern(
      patternId,
      mapAlternativeRow(payload.alternative)
    );
  };

  const deleteAlternative = async (patternId: string, alternativeId: string) => {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    const { ok, payload } = await deleteAlternativeAPI(alternativeId);
    if (!ok) {
      throw new Error(payload?.error || "대안 사고를 삭제하지 못했습니다.");
    }
    removeAlternativeForPattern(patternId, alternativeId);
  };

  const updateErrorDetail = async (
    patternId: string,
    errorDetail: PatternErrorDetail
  ) => {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    const { ok, payload } = await updateErrorDetailAPI({
      id: errorDetail.id,
      errorLabel: errorDetail.errorLabel,
      errorDescription: errorDetail.errorDescription,
    });
    if (!ok || !payload?.errorDetail) {
      throw new Error(payload?.error || "인지오류를 수정하지 못했습니다.");
    }
    updateErrorForPattern(patternId, mapErrorRow(payload.errorDetail));
  };

  const deleteErrorDetail = async (patternId: string, errorId: string) => {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    const { ok, payload } = await deleteErrorDetailAPI(errorId);
    if (!ok) {
      throw new Error(payload?.error || "인지오류를 삭제하지 못했습니다.");
    }
    removeErrorForPattern(patternId, errorId);
  };

  const updateBehaviorDetail = async (
    patternId: string,
    behaviorDetail: PatternBehaviorDetail
  ) => {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    const { ok, payload } = await updateBehaviorDetailAPI({
      id: behaviorDetail.id,
      behaviorLabel: behaviorDetail.behaviorLabel,
      behaviorDescription: behaviorDetail.behaviorDescription,
      errorTags: behaviorDetail.errorTags ?? [],
    });
    if (!ok || !payload?.behavior) {
      throw new Error(payload?.error || "행동을 수정하지 못했습니다.");
    }
    updateBehaviorForPattern(patternId, mapBehaviorRow(payload.behavior));
  };

  const deleteBehaviorDetail = async (patternId: string, behaviorId: string) => {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    const { ok, payload } = await deleteBehaviorDetailAPI(behaviorId);
    if (!ok) {
      throw new Error(payload?.error || "행동을 삭제하지 못했습니다.");
    }
    removeBehaviorForPattern(patternId, behaviorId);
  };

  const addAlternative = async (payload: {
    patternId: string;
    alternativeText: string;
  }) => {
    if (!payload.alternativeText.trim()) {
      toast.error("대안 사고를 입력해주세요.");
      return false;
    }

    try {
      if (!user) {
        toast.error("로그인이 필요합니다.");
        return false;
      }
      const { ok, payload: response } = await createAlternativeAPI({
        noteId: payload.patternId,
        alternative: payload.alternativeText.trim(),
      });
      if (!ok || !response?.alternative) {
        throw new Error(response?.error || "대안 사고를 추가하지 못했습니다.");
      }
      updateAlternativeForPattern(
        payload.patternId,
        mapAlternativeRow(response.alternative)
      );
      return true;
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "대안 사고를 추가하지 못했습니다.");
      return false;
    }
  };

  const addErrorDetail = async (payload: {
    patternId: string;
    errorLabel: string;
    errorDescription: string;
  }) => {
    if (!payload.errorLabel.trim() && !payload.errorDescription.trim()) {
      toast.error("인지오류 내용을 입력해주세요.");
      return false;
    }

    try {
      if (!user) {
        toast.error("로그인이 필요합니다.");
        return false;
      }
      const { ok, payload: response } = await createErrorDetailsAPI({
        noteId: payload.patternId,
        errors: [
          {
            errorLabel: payload.errorLabel.trim(),
            errorDescription: payload.errorDescription.trim(),
          },
        ],
      });
      if (!ok || !response?.errors?.length) {
        throw new Error(response?.error || "인지오류를 추가하지 못했습니다.");
      }
      updateErrorForPattern(payload.patternId, mapErrorRow(response.errors[0]));
      return true;
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "인지오류를 추가하지 못했습니다.");
      return false;
    }
  };

  const addBehaviorDetail = async (payload: {
    patternId: string;
    behaviorLabel: string;
    behaviorDescription: string;
    errorTags: string[];
  }) => {
    if (!payload.behaviorLabel.trim() && !payload.behaviorDescription.trim()) {
      toast.error("행동 반응을 입력해주세요.");
      return false;
    }

    try {
      if (!user) {
        toast.error("로그인이 필요합니다.");
        return false;
      }
      const { ok, payload: response } = await createBehaviorDetailAPI({
        noteId: payload.patternId,
        behaviorLabel: payload.behaviorLabel.trim(),
        behaviorDescription: payload.behaviorDescription.trim(),
        errorTags: payload.errorTags,
      });
      if (!ok || !response?.behavior) {
        throw new Error(response?.error || "행동을 추가하지 못했습니다.");
      }
      updateBehaviorForPattern(
        payload.patternId,
        mapBehaviorRow(response.behavior)
      );
      return true;
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "행동을 추가하지 못했습니다.");
      return false;
    }
  };

  const addDetail = async (payload: {
    patternId: string;
    emotion: string;
    automaticThought: string;
  }) => {
    if (!payload.emotion.trim()) {
      toast.error("감정을 선택해주세요.");
      return false;
    }
    if (!payload.automaticThought.trim()) {
      toast.error("자동사고를 입력해주세요.");
      return false;
    }

    try {
      if (!user) {
        toast.error("로그인이 필요합니다.");
        return false;
      }
      const { ok, payload: response } = await createDetailAPI({
        noteId: payload.patternId,
        automaticThought: payload.automaticThought.trim(),
        emotion: payload.emotion.trim(),
      });
      if (!ok || !response?.detail) {
        throw new Error(response?.error || "자동사고를 추가하지 못했습니다.");
      }
      updateDetailForPattern(payload.patternId, mapDetailRow(response.detail));
      return true;
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "자동사고를 추가하지 못했습니다.");
      return false;
    }
  };

  const requestDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  return {
    patterns,
    setPatterns,
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
    getFrequencyBadgeStyle: frequencySync.getFrequencyBadgeStyle,
    incrementFrequency: frequencySync.incrementFrequency,
    decrementFrequency: frequencySync.decrementFrequency,
  };
}
