// src/App.tsx
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthModal } from "./components/AuthModal";
import { CBTSessionPage } from "./components/CBTSessionPage";
import { EnterancePage } from "./components/enterance/EnterancePage";
import { DashboardPage } from "./components/feature/dashboard/DashboardPage";
import { PatternsPage } from "./components/feature/emotion-note/components/PatternsPage";
import { HelplinePage } from "./components/feature/HelplinePage";
import { PrayerNotesPage } from "./components/feature/prayer-note/PrayerNotesPage";
import { Navigation } from "./components/header/navigation/Navigation";
import { MinimalSessionPage } from "./components/MinimalSessionPage";
import { Notice } from "./components/Notice";
import { Toaster } from "./components/ui/sonner";
import { authHelpers } from "./lib/supabase/auth";
import { clearCbtSessionStorage } from "./utils/storage/cbtSessionStorage";

import type { User } from "@supabase/supabase-js";
import type { CbtMode } from "./components/header/navigation/ModePicker";

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

export default function App() {
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
  }, []);

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

  const shouldShowEnterance = (currentUser: User | null) => {
    if (currentUser) return false;
    try {
      return localStorage.getItem(ENTERANCE_SEEN_KEY) !== "true";
    } catch {
      return true;
    }
  };

  const shouldShowMinimal = (currentUser: User | null) => {
    if (currentUser) return false;
    try {
      if (shouldShowEnterance(currentUser)) return false;
      return localStorage.getItem(MINIMAL_SEEN_KEY) !== "true";
    } catch {
      return true;
    }
  };

  const checkUser = async () => {
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
  };

  const handleLogout = async () => {
    await authHelpers.signOut();
    setUser(null);
    toast.success("로그아웃되었습니다.");
  };

  const handleAuthSuccess = () => {
    checkUser();
  };

  const handleHomeRefresh = () => {
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
  };

  const handleEnteranceComplete = () => {
    try {
      localStorage.setItem(ENTERANCE_SEEN_KEY, "true");
    } catch {
      // ignore
    }
    setShowEnterance(false);
    setShowMinimalCbt(true);
  };

  const handleEnteranceLater = () => {
    try {
      localStorage.setItem(ENTERANCE_SEEN_KEY, "true");
    } catch {
      // ignore
    }
    setShowEnterance(false);
    setShowMinimalCbt(false);
  };

  const handleStartMinimalFromLite = () => {
    setShowEnterance(false);
    setIsMinimalExiting(false);
    setShowMinimalCbt(true);
  };

  const handleMinimalComplete = () => {
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
  };

  const renderPage = () => {
    switch (currentPage) {
      case "cbt":
        return showEnterance ? (
          <div className="animate-in fade-in-0 duration-300">
            <EnterancePage
              onStartSession={handleEnteranceComplete}
              onExplore={handleEnteranceComplete}
              onLater={handleEnteranceLater}
            />
          </div>
        ) : showMinimalCbt ? (
          <div
            className={`animate-in fade-in-0 duration-300 ${
              isMinimalExiting ? "animate-out fade-out-0 duration-300" : ""
            }`}
          >
            <MinimalSessionPage
              mode={mode}
              user={user}
              onComplete={handleMinimalComplete}
            />
          </div>
        ) : (
          <div className="animate-in fade-in-0 duration-300">
            <CBTSessionPage
              key={cbtResetKey}
              mode={mode}
              onStartMinimal={handleStartMinimalFromLite}
              sessionKind={cbtSessionKind}
              onSessionKindChange={setCbtSessionKind}
              user={user}
              onStepChange={setCbtStep}
            />
          </div>
        );

      case "dashboard":
        return <DashboardPage user={user} />;

      case "prayer-notes":
        return <PrayerNotesPage user={user} />;

      case "patterns":
        return <PatternsPage user={user} />;

      case "helpline":
        return <HelplinePage mode={mode} />;

      default:
        return (
          <CBTSessionPage
            mode={mode}
            onStartMinimal={handleStartMinimalFromLite}
            sessionKind={cbtSessionKind}
            onSessionKindChange={setCbtSessionKind}
            user={user}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="size-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  const hideChrome = currentPage === "cbt" && (showEnterance || showMinimalCbt);
  const mainClassName = hideChrome
    ? undefined
    : isNativeMobile
    ? undefined
    : "pb-8";
  const mainStyle =
    hideChrome || !isNativeMobile
      ? undefined
      : { paddingBottom: "var(--mobile-tabbar-height, 96px)" };

  const showLiteGradient =
    currentPage === "cbt" &&
    cbtSessionKind === "minimal" &&
    !showEnterance &&
    !showMinimalCbt;

  return (
    <div
      className={
        hideChrome
          ? "min-h-screen bg-white"
          : showLiteGradient
          ? "min-h-screen bg-[linear-gradient(120deg,#efe9df_0%,#f7f3ee_30%,#dfe8e6_100%)] sm:bg-gradient-to-br sm:from-[#efe9df] sm:via-[#f7f3ee] sm:to-[#dfe8e6] sm:via-[65%] sm:to-[100%]"
          : "min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50"
      }
    >
      {!hideChrome && (
        <Navigation
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onHomeRefresh={handleHomeRefresh}
          user={user}
          onLogout={handleLogout}
          onShowAuth={() => setShowAuthModal(true)}
          mode={mode}
          onChangeMode={(next) => setMode(next)}
        />
      )}

      {!hideChrome && <Notice />}

      <main className={mainClassName} style={mainStyle}>
        {renderPage()}
      </main>

      {/* Footer: 모바일에서는 숨김 */}
      {!hideChrome && isDesktop && (currentPage !== "cbt" || cbtStep === 1) && (
        <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-md py-6 mt-4">
          <div className="max-w-[1800px] mx-auto px-8">
            <div className="text-center mb-8">
              <div className="inline-block bg-white border border-slate-200 shadow-sm rounded-2xl px-10 py-5 mb-6">
                <p className="text-slate-500 text-sm mb-1">Copyright © 2025</p>
                <p className="text-slate-800 text-lg tracking-wide">
                  617ALLIANCE
                </p>
              </div>
            </div>
          </div>
        </footer>
      )}

      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />

      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}
