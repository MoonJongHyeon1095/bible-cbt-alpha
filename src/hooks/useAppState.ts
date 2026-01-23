import { useCallback } from "react";
import { toast } from "sonner";
import { authHelpers } from "../lib/supabase/auth";
import { clearCbtSessionStorage } from "../utils/storage/cbtSessionStorage";
import { useAuthModalState } from "./app/useAuthModalState";
import { useAuthSession } from "./app/useAuthSession";
import { useCbtSessionState } from "./app/useCbtSessionState";
import { useEntryFlow } from "./app/useEntryFlow";
import { useModePreference } from "./app/useModePreference";
import { useNavigationGuard } from "./app/useNavigationGuard";
import { usePageState } from "./app/usePageState";
import { useResponsiveLayout } from "./app/useResponsiveLayout";

export function useAppState() {
  const { currentPage, setCurrentPage } = usePageState();
  const {
    bumpCbtResetKey,
    cbtResetKey,
    cbtSessionKind,
    cbtStep,
    setCbtSessionKind,
    setCbtStep,
  } = useCbtSessionState();
  const {
    handleEnteranceComplete,
    handleEnteranceLater,
    handleMinimalComplete,
    handleStartMinimalFromLite,
    isMinimalExiting,
    setIsMinimalExiting,
    showEnterance,
    showMinimalCbt,
    syncEntryState,
  } = useEntryFlow();
  const { setShowAuthModal, showAuthModal } = useAuthModalState();
  const { mode, setMode } = useModePreference();
  const { isDesktop, isNativeMobile } = useResponsiveLayout();
  const { loading, refreshUser, setUser, user } = useAuthSession({
    onUserResolved: syncEntryState,
  });

  const handleLogout = useCallback(async () => {
    await authHelpers.signOut();
    setUser(null);
    toast.success("로그아웃되었습니다.");
  }, []);

  const handleAuthSuccess = useCallback(() => {
    refreshUser();
  }, [refreshUser]);

  const handleHomeRefresh = useCallback(() => {
    if (currentPage !== "cbt") {
      setCurrentPage("cbt");
    }
    setCbtStep(1);
    bumpCbtResetKey();
    syncEntryState(user);
    setIsMinimalExiting(false);
    clearCbtSessionStorage();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [bumpCbtResetKey, currentPage, setCurrentPage, syncEntryState, user]);

  const handleNavigate = useNavigationGuard({
    user,
    onNavigate: setCurrentPage,
    onRequireAuth: () => setShowAuthModal(true),
  });

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
    handleNavigate,
    hideChrome,
    isDesktop,
    isMinimalExiting,
    isNativeMobile,
    loading,
    mode,
    setCbtSessionKind,
    setCbtStep,
    setMode,
    setShowAuthModal,
    showAuthModal,
    showEnterance,
    showLiteGradient,
    showMinimalCbt,
    user,
  };
}
