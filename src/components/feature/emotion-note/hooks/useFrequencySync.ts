import type { User } from "@supabase/supabase-js";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { Pattern } from "../types";
import { updateNoteAPI } from "../utils/api";

interface UseFrequencySyncParams {
  user: User | null;
  patterns: Pattern[];
  setPatterns: React.Dispatch<React.SetStateAction<Pattern[]>>;
}

export function useFrequencySync({
  user,
  patterns,
  setPatterns,
}: UseFrequencySyncParams) {
  const lastUserIdRef = useRef<string | null>(null);
  const patternsRef = useRef<Pattern[]>([]);
  const pendingFrequencyRef = useRef<Record<string, number>>({});
  const frequencySyncingRef = useRef<Record<string, boolean>>({});
  const frequencyDebounceTimersRef = useRef<
    Record<string, ReturnType<typeof setTimeout> | null>
  >({});
  const frequencyClickTracker = useRef<
    Record<
      string,
      { count: number; firstAt: number; blockedUntil: number; lastToastAt: number }
    >
  >({});

  useEffect(() => {
    patternsRef.current = patterns;
  }, [patterns]);

  const clearPendingFrequency = () => {
    pendingFrequencyRef.current = {};
  };

  const addPendingFrequency = (id: string, delta: number) => {
    const current = { ...pendingFrequencyRef.current };
    current[id] = (current[id] || 0) + delta;
    if (current[id] === 0) {
      delete current[id];
    }
    pendingFrequencyRef.current = current;
  };

  useEffect(() => {
    if (!user) {
      if (lastUserIdRef.current) {
        clearPendingFrequency();
      }
      lastUserIdRef.current = null;
      return;
    }
    lastUserIdRef.current = user.id;
    pendingFrequencyRef.current = {};
  }, [user]);

  const applyPendingFrequency = (list: Pattern[]) => {
    if (!user) return list;
    const pending = pendingFrequencyRef.current;
    if (!pending || Object.keys(pending).length === 0) return list;
    return list.map((pattern) => {
      const delta = pending[pattern.id];
      if (!delta) return pattern;
      return {
        ...pattern,
        frequency: Math.max(1, (pattern.frequency || 1) + delta),
      };
    });
  };

  const flushFrequencyUpdate = async (id: string, frequency: number) => {
    if (!user) return;
    const pending = pendingFrequencyRef.current;
    const pendingAtStart = pending[id] ?? 0;
    if (pendingAtStart === 0) return;
    if (frequencySyncingRef.current[id]) return;
    frequencySyncingRef.current[id] = true;
    try {
      const { ok, payload } = await updateNoteAPI({ id, frequency });
      if (!ok || !payload?.note) {
        throw new Error(
          payload?.error || "발생 횟수를 업데이트하지 못했습니다."
        );
      }
      const latestPending = pendingFrequencyRef.current[id] ?? 0;
      const remaining = latestPending - pendingAtStart;
      if (remaining <= 0) {
        const next = { ...pendingFrequencyRef.current };
        delete next[id];
        pendingFrequencyRef.current = next;
      } else {
        pendingFrequencyRef.current = {
          ...pendingFrequencyRef.current,
          [id]: remaining,
        };
      }
    } catch (e) {
      console.error("발생 횟수 동기화 실패:", e);
    } finally {
      frequencySyncingRef.current[id] = false;
    }
  };

  const scheduleFrequencySync = (id: string) => {
    if (!user) return;
    const timers = frequencyDebounceTimersRef.current;
    if (timers[id]) {
      clearTimeout(timers[id] as ReturnType<typeof setTimeout>);
    }
    timers[id] = setTimeout(() => {
      const target = patternsRef.current.find((p) => p.id === id);
      if (!target) return;
      flushFrequencyUpdate(id, target.frequency);
    }, 5000);
  };

  const flushPendingForPatterns = (list: Pattern[]) => {
    if (!user) return;
    const pending = pendingFrequencyRef.current;
    if (!pending || Object.keys(pending).length === 0) return;
    Object.keys(pending).forEach((id) => {
      const target = list.find((pattern) => pattern.id === id);
      if (!target) return;
      flushFrequencyUpdate(id, target.frequency);
    });
  };

  const flushAllPendingFrequencies = () => {
    if (!user) return;
    const pending = pendingFrequencyRef.current;
    if (!pending || Object.keys(pending).length === 0) return;
    Object.keys(pending).forEach((id) => {
      const target = patternsRef.current.find((p) => p.id === id);
      if (!target) return;
      flushFrequencyUpdate(id, target.frequency);
    });
  };

  useEffect(() => {
    if (!user) return;
    const handlePageHide = () => flushAllPendingFrequencies();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushAllPendingFrequencies();
      }
    };
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      flushAllPendingFrequencies();
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user]);

  const getFrequencyBadgeStyle = (frequency: number) => {
    if (frequency >= 5) {
      return { backgroundColor: "#4338ca", color: "#ffffff" };
    }
    if (frequency >= 4) {
      return { backgroundColor: "#a5b4fc", color: "#1e1b4b" };
    }
    if (frequency >= 3) {
      return { backgroundColor: "#c7d2fe", color: "#1e1b4b" };
    }
    if (frequency >= 2) {
      return { backgroundColor: "#e0e7ff", color: "#3730a3" };
    }
    return { backgroundColor: "#e0e7ff", color: "#4338ca" };
  };

  const shouldBlockFrequencyClick = (id: string) => {
    const now = Date.now();
    const windowMs = 2000;
    const blockMs = 2000;
    const entry =
      frequencyClickTracker.current[id] ?? {
        count: 0,
        firstAt: now,
        blockedUntil: 0,
        lastToastAt: 0,
      };

    if (entry.blockedUntil > now) {
      if (now - entry.lastToastAt > 800) {
        entry.lastToastAt = now;
        toast.error("너무 빠릅니다. 잠시 후 다시 시도해주세요.");
      }
      frequencyClickTracker.current[id] = entry;
      return true;
    }

    if (now - entry.firstAt > windowMs) {
      entry.count = 1;
      entry.firstAt = now;
      frequencyClickTracker.current[id] = entry;
      return false;
    }

    entry.count += 1;
    if (entry.count >= 6) {
      entry.blockedUntil = now + blockMs;
      entry.lastToastAt = now;
      frequencyClickTracker.current[id] = entry;
      toast.error("너무 빠릅니다. 잠시 후 다시 시도해주세요.");
      return true;
    }

    frequencyClickTracker.current[id] = entry;
    return false;
  };

  const incrementFrequency = (id: string) => {
    if (!user) return;
    if (shouldBlockFrequencyClick(id)) return;
    const target = patternsRef.current.find((p) => p.id === id);
    if (!target) return;
    const nextFrequency = (Number(target.frequency) || 1) + 1;
    setPatterns((prev) => {
      const updated = prev.map((pattern) =>
        pattern.id === id ? { ...pattern, frequency: nextFrequency } : pattern
      );
      return updated;
    });
    addPendingFrequency(id, 1);
    scheduleFrequencySync(id);
  };

  const decrementFrequency = (id: string) => {
    if (!user) return;
    if (shouldBlockFrequencyClick(id)) return;
    const target = patternsRef.current.find((p) => p.id === id);
    if (!target) return;
    const nextFrequency = Math.max(1, (Number(target.frequency) || 1) - 1);
    if (nextFrequency === target.frequency) return;
    setPatterns((prev) => {
      const updated = prev.map((pattern) =>
        pattern.id === id ? { ...pattern, frequency: nextFrequency } : pattern
      );
      return updated;
    });
    addPendingFrequency(id, -1);
    scheduleFrequencySync(id);
  };

  return {
    applyPendingFrequency,
    flushPendingForPatterns,
    getFrequencyBadgeStyle,
    incrementFrequency,
    decrementFrequency,
  };
}
