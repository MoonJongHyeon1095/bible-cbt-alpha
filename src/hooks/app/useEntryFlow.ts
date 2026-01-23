import { useCallback, useState } from "react";
import type { User } from "@supabase/supabase-js";

const ENTERANCE_SEEN_KEY = "enterance_seen";
const MINIMAL_SEEN_KEY = "minimal_session_seen";

export function useEntryFlow() {
  const [showEnterance, setShowEnterance] = useState(false);
  const [showMinimalCbt, setShowMinimalCbt] = useState(true);
  const [isMinimalExiting, setIsMinimalExiting] = useState(false);

  const shouldShowEnterance = useCallback((currentUser: User | null) => {
    if (currentUser) return false;
    try {
      return localStorage.getItem(ENTERANCE_SEEN_KEY) !== "true";
    } catch {
      return true;
    }
  }, []);

  const shouldShowMinimal = useCallback(
    (currentUser: User | null) => {
      if (currentUser) return false;
      try {
        if (shouldShowEnterance(currentUser)) return false;
        return localStorage.getItem(MINIMAL_SEEN_KEY) !== "true";
      } catch {
        return true;
      }
    },
    [shouldShowEnterance]
  );

  const syncEntryState = useCallback(
    (currentUser: User | null) => {
      setShowEnterance(shouldShowEnterance(currentUser));
      setShowMinimalCbt(shouldShowMinimal(currentUser));
    },
    [shouldShowEnterance, shouldShowMinimal]
  );

  const handleEnteranceComplete = useCallback(() => {
    try {
      localStorage.setItem(ENTERANCE_SEEN_KEY, "true");
    } catch {
      // ignore
    }
    setShowEnterance(false);
    setShowMinimalCbt(true);
  }, []);

  const handleEnteranceLater = useCallback(() => {
    try {
      localStorage.setItem(ENTERANCE_SEEN_KEY, "true");
    } catch {
      // ignore
    }
    setShowEnterance(false);
    setShowMinimalCbt(false);
  }, []);

  const handleStartMinimalFromLite = useCallback(() => {
    setShowEnterance(false);
    setIsMinimalExiting(false);
    setShowMinimalCbt(true);
  }, []);

  const handleMinimalComplete = useCallback(() => {
    try {
      localStorage.setItem(MINIMAL_SEEN_KEY, "true");
    } catch {
      // ignore
    }
    setIsMinimalExiting(true);
    window.setTimeout(() => {
      setShowMinimalCbt(false);
      setIsMinimalExiting(false);
    }, 320);
  }, []);

  return {
    handleEnteranceComplete,
    handleEnteranceLater,
    handleMinimalComplete,
    handleStartMinimalFromLite,
    isMinimalExiting,
    setIsMinimalExiting,
    setShowEnterance,
    setShowMinimalCbt,
    showEnterance,
    showMinimalCbt,
    syncEntryState,
  };
}
