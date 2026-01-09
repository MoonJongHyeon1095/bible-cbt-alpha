import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Pattern, PatternAlternative, PatternDetail } from "../types";
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
} from "../utils/api";
import { loadLocalPatterns, saveLocalPatterns } from "../utils/storage";
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

    const mapped = loadLocalPatterns();
    setPatterns(mapped);
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

    if (user) {
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
    }

    const newPattern: Pattern = {
      id: Date.now().toString(),
      title: payload.title.trim(),
      trigger: payload.trigger.trim(),
      behavior: payload.behavior.trim(),
      timestamp: new Date().toISOString(),
      frequency: 1,
      details: [],
      alternatives: [],
    };

    const updated = [newPattern, ...patterns];
    setPatterns(updated);
    saveLocalPatterns(updated);
    return true;
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

    if (user) {
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
    }

    const updated = patterns.map((pattern) =>
      pattern.id === payload.id
        ? {
            ...pattern,
            title: payload.title.trim(),
            trigger: payload.trigger.trim(),
            behavior: payload.behavior.trim(),
          }
        : pattern
    );

    setPatterns(updated);
    saveLocalPatterns(updated);
    return true;
  };

  const deletePattern = async (id: string) => {
    if (user) {
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
    }

    const updated = patterns.filter((pattern) => pattern.id !== id);
    setPatterns(updated);
    if (!user) {
      saveLocalPatterns(updated);
    }
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

  const updateDetail = async (patternId: string, detail: PatternDetail) => {
    if (user) {
      const { ok, payload } = await updateDetailAPI({
        id: detail.id,
        automaticThought: detail.automaticThought,
        emotion: detail.emotion,
      });
      if (!ok || !payload?.detail) {
        throw new Error(payload?.error || "자동사고를 수정하지 못했습니다.");
      }
      updateDetailForPattern(patternId, mapDetailRow(payload.detail));
      return;
    }

    updateDetailForPattern(patternId, detail);
    saveLocalPatterns(
      patterns.map((p) =>
        p.id === patternId
          ? {
              ...p,
              details: p.details.map((d) => (d.id === detail.id ? detail : d)),
            }
          : p
      )
    );
  };

  const deleteDetail = async (patternId: string, detailId: string) => {
    if (user) {
      const { ok, payload } = await deleteDetailAPI(detailId);
      if (!ok) {
        throw new Error(payload?.error || "자동사고를 삭제하지 못했습니다.");
      }
      removeDetailForPattern(patternId, detailId);
      return;
    }

    removeDetailForPattern(patternId, detailId);
    saveLocalPatterns(
      patterns.map((p) =>
        p.id === patternId
          ? { ...p, details: p.details.filter((d) => d.id !== detailId) }
          : p
      )
    );
  };

  const updateAlternative = async (
    patternId: string,
    alternative: PatternAlternative
  ) => {
    if (user) {
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
      return;
    }

    updateAlternativeForPattern(patternId, alternative);
    saveLocalPatterns(
      patterns.map((p) =>
        p.id === patternId
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

  const deleteAlternative = async (patternId: string, alternativeId: string) => {
    if (user) {
      const { ok, payload } = await deleteAlternativeAPI(alternativeId);
      if (!ok) {
        throw new Error(payload?.error || "대안 사고를 삭제하지 못했습니다.");
      }
      removeAlternativeForPattern(patternId, alternativeId);
      return;
    }

    removeAlternativeForPattern(patternId, alternativeId);
    saveLocalPatterns(
      patterns.map((p) =>
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

  const addAlternative = async (payload: {
    patternId: string;
    alternativeText: string;
  }) => {
    if (!payload.alternativeText.trim()) {
      toast.error("대안 사고를 입력해주세요.");
      return false;
    }

    const newAlternative: PatternAlternative = {
      id: Date.now().toString(),
      noteId: payload.patternId,
      alternative: payload.alternativeText.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      if (user) {
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
      } else {
        updateAlternativeForPattern(payload.patternId, newAlternative);
        saveLocalPatterns(
          patterns.map((p) =>
            p.id === payload.patternId
              ? { ...p, alternatives: [newAlternative, ...p.alternatives] }
              : p
          )
        );
      }
      return true;
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "대안 사고를 추가하지 못했습니다.");
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

    const newDetailBase: PatternDetail = {
      id: Date.now().toString(),
      automaticThought: payload.automaticThought.trim(),
      emotion: payload.emotion.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      if (user) {
        const { ok, payload: response } = await createDetailAPI({
          noteId: payload.patternId,
          automaticThought: payload.automaticThought.trim(),
          emotion: payload.emotion.trim(),
        });
        if (!ok || !response?.detail) {
          throw new Error(response?.error || "자동사고를 추가하지 못했습니다.");
        }
        updateDetailForPattern(payload.patternId, mapDetailRow(response.detail));
      } else {
        updateDetailForPattern(payload.patternId, newDetailBase);
        saveLocalPatterns(
          patterns.map((p) =>
            p.id === payload.patternId
              ? { ...p, details: [newDetailBase, ...p.details] }
              : p
          )
        );
      }
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
    addAlternative,
    addDetail,
    getFrequencyBadgeStyle: frequencySync.getFrequencyBadgeStyle,
    incrementFrequency: frequencySync.incrementFrequency,
    decrementFrequency: frequencySync.decrementFrequency,
  };
}
