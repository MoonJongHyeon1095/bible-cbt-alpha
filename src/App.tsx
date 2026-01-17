// src/App.tsx
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthModal } from "./components/AuthModal";
import { CBTSessionPage } from "./components/CBTSessionPage";
import { DashboardPage } from "./components/feature/dashboard/DashboardPage";
import { PatternsPage } from "./components/feature/emotion-note/components/PatternsPage";
import { HelplinePage } from "./components/feature/HelplinePage";
import { PrayerNotesPage } from "./components/feature/prayer-note/PrayerNotesPage";
import { Navigation } from "./components/header/navigation/Navigation";
import { Notice } from "./components/Notice";
import { Toaster } from "./components/ui/sonner";
import { authHelpers } from "./lib/supabase/auth";
import { clearCbtSessionStorage } from "./utils/cbtSessionStorage";

import type { User } from "@supabase/supabase-js";
import type { CbtMode } from "./components/header/navigation/ModePicker";

const CBT_MODE_STORAGE_KEY = "cbt-mode";
const DEFAULT_MODE: CbtMode = { detailMode: "deep", toneMode: "christian" };

const getIsDesktop = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(min-width: 768px)").matches;

export default function App() {
  const [currentPage, setCurrentPage] = useState("cbt");
  const [cbtStep, setCbtStep] = useState(1);
  const [cbtResetKey, setCbtResetKey] = useState(0);
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
        const parsed = JSON.parse(raw) as Partial<CbtMode>;
        const restored: CbtMode = {
          detailMode: parsed.detailMode === "deep" ? "deep" : "lite",
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

  const checkUser = async () => {
    try {
      const { user: currentUser } = await authHelpers.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("사용자 확인 오류:", error);
      setUser(null);
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
    clearCbtSessionStorage();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPage = () => {
    switch (currentPage) {
      case "cbt":
        return (
          <CBTSessionPage
            key={cbtResetKey}
            mode={mode}
            user={user}
            onStepChange={setCbtStep}
          />
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
        return <CBTSessionPage mode={mode} user={user} />;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
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

      <Notice />

      <main
        className={isNativeMobile ? undefined : "pb-8"}
        style={
          isNativeMobile
            ? { paddingBottom: "var(--mobile-tabbar-height, 96px)" }
            : undefined
        }
      >
        {renderPage()}
      </main>

      {/* Footer: 모바일에서는 숨김 */}
      {isDesktop && (currentPage !== "cbt" || cbtStep === 1) && (
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
