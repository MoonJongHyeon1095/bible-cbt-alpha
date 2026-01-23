import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { authHelpers } from "../lib/supabase/auth";
import { clearCbtSessionStorage } from "../utils/storage/cbtSessionStorage";

import type { User } from "@supabase/supabase-js";
import type { CbtMode } from "../components/header/navigation/ModePicker";

const CBT_MODE_STORAGE_KEY = "cbt-mode";
const DEFAULT_MODE: CbtMode = {
  emotionDialMode: "emotion-dial-active",
  toneMode: "christian",
};
const ENTERANCE_SEEN_KEY = "enterance_seen";
const MINIMAL_SEEN_KEY = "minimal_session_seen";

const getIsDesktop = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(min-width: 768px)").matches;

export function useAppState() {
  const [currentPage, setCurrentPage] = useState("cbt");
  const [cbtStep, setCbtStep] = useState(1);
  const [cbtResetKey, setCbtResetKey] = useState(0);
  const [cbtSessionKind, setCbtSessionKind] = useState<"minimal" | "cbt">(
    "minimal",
  );
  const [showEnterance, setShowEnterance] = useState(false);
  const [showMinimalCbt, setShowMinimalCbt] = useState(true);
  const [isMinimalExiting, setIsMinimalExiting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState<boolean>(getIsDesktop);
  const isNativeMobile = !isDesktop && Capacitor.isNativePlatform();

  // ✅ 전역 모드 상태(단일 소스)
  const [mode, setMode] = useState<CbtMode>(DEFAULT_MODE);

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

  const checkUser = useCallback(async () => {
    try {
      const { user: currentUser } = await authHelpers.getCurrentUser();
      setUser(currentUser);
      setShowEnterance(shouldShowEnterance(currentUser));
      setShowMinimalCbt(shouldShowMinimal(currentUser));
    } catch (error) {
      console.error("사용자 확인 오류:", error);
      setUser(null);
      setShowEnterance(shouldShowEnterance(null));
      setShowMinimalCbt(shouldShowMinimal(null));
    } finally {
      setLoading(false);
    }
  }, [shouldShowEnterance, shouldShowMinimal]);

  useEffect(() => {
    checkUser();

    // ✅ 최초 1회: localStorage에서 모드 복원
    try {
      const raw = localStorage.getItem(CBT_MODE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<CbtMode> & {
          detailMode?: "lite" | "deep";
        };
        const restored: CbtMode = {
          emotionDialMode:
            parsed.emotionDialMode ??
            (parsed.detailMode === "deep"
              ? "emotion-dial-active"
              : "emotion-dial-inactive"),
          toneMode: parsed.toneMode === "christian" ? "christian" : "normal",
        };
        setMode(restored);
      }
    } catch {
      // ignore
    }
  }, [checkUser]);

  // ✅ mode 변경 시 저장 (App이 저장 책임)
  useEffect(() => {
    try {
      localStorage.setItem(CBT_MODE_STORAGE_KEY, JSON.stringify(mode));
    } catch {
      // ignore
    }
  }, [mode]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const handleChange = (event: MediaQueryListEvent) =>
      setIsDesktop(event.matches);

    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!isNativeMobile || Capacitor.getPlatform() !== "ios") return;

    const applyStatusBarStyle = async () => {
      try {
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setBackgroundColor({ color: "#ffffff" });
        await StatusBar.setStyle({ style: Style.Dark });
      } catch {
        // ignore
      }
    };

    applyStatusBarStyle();
  }, [isNativeMobile]);

  const handleLogout = useCallback(async () => {
    await authHelpers.signOut();
    setUser(null);
    toast.success("로그아웃되었습니다.");
  }, []);

  const handleAuthSuccess = useCallback(() => {
    checkUser();
  }, [checkUser]);

  const handleHomeRefresh = useCallback(() => {
    if (currentPage !== "cbt") {
      setCurrentPage("cbt");
    }
    setCbtStep(1);
    setCbtResetKey((prev) => prev + 1);
    setShowEnterance(shouldShowEnterance(user));
    setShowMinimalCbt(shouldShowMinimal(user));
    setIsMinimalExiting(false);
    clearCbtSessionStorage();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, shouldShowEnterance, shouldShowMinimal, user]);

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

  const hideChrome = currentPage === "cbt" && (showEnterance || showMinimalCbt);
  const showLiteGradient =
    currentPage === "cbt" &&
    cbtSessionKind === "minimal" &&
    !showEnterance &&
    !showMinimalCbt;

  return {
    cbtResetKey,
    cbtSessionKind,
    cbtStep,
    currentPage,
    handleAuthSuccess,
    handleEnteranceComplete,
    handleEnteranceLater,
    handleHomeRefresh,
    handleLogout,
    handleMinimalComplete,
    handleStartMinimalFromLite,
    hideChrome,
    isDesktop,
    isMinimalExiting,
    isNativeMobile,
    loading,
    mode,
    setCbtSessionKind,
    setCbtStep,
    setCurrentPage,
    setMode,
    setShowAuthModal,
    showAuthModal,
    showEnterance,
    showLiteGradient,
    showMinimalCbt,
    user,
  };
}
