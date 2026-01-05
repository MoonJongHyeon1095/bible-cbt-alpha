// src/App.tsx
import { useEffect, useState } from "react";
import { AuthModal } from "./components/AuthModal";
import { CBTSessionPage } from "./components/CBTSessionPage";
import { CommunityPage } from "./components/feature/CommunityPage";
import { DashboardPage } from "./components/feature/DashboardPage";
import { HelplinePage } from "./components/feature/HelplinePage";
import { PatternsPage } from "./components/feature/PatternsPage";
import { ScriptureNotesPage } from "./components/feature/ScriptureNotesPage";
import { VoicePage } from "./components/feature/VoicePage";
import { AIChatPage } from "./components/feature/chat/AIChatPage";
import { PrayerNotesPage } from "./components/feature/prayer-note/PrayerNotesPage";
import { CommentSection } from "./components/footer/CommentSection";
import { Navigation } from "./components/header/Navigation";
import { authHelpers } from "./lib/supabase/auth";

import type { CbtMode } from "./components/header/ModePicker";

const CBT_MODE_STORAGE_KEY = "cbt-mode";
const DEFAULT_MODE: CbtMode = { detailMode: "lite", toneMode: "normal" };

export default function App() {
  const [currentPage, setCurrentPage] = useState("cbt");
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);

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
    alert("로그아웃되었습니다.");
  };

  const handleAuthSuccess = () => {
    checkUser();
  };

  const renderPage = () => {
    switch (currentPage) {
      case "cbt":
        return <CBTSessionPage mode={mode} />;

      case "dashboard":
        return <DashboardPage />;

      case "ai-chat":
        return <AIChatPage />;

      case "prayer-notes":
        return <PrayerNotesPage user={user} />;

      case "scripture-notes":
        return <ScriptureNotesPage />;

      case "patterns":
        return <PatternsPage />;

      case "community":
        return <CommunityPage />;

      case "voice":
        return <VoicePage />;

      case "helpline":
        return <HelplinePage />;

      default:
        return <CBTSessionPage mode={mode} />;
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
        user={user}
        onLogout={handleLogout}
        onShowAuth={() => setShowAuthModal(true)}
        mode={mode}
        onChangeMode={(next) => setMode(next)}
      />

      <main className="pb-16">{renderPage()}</main>

      {/* Footer: 모바일에서는 숨김 */}
      <footer className="hidden md:block border-t border-slate-200 bg-white/80 backdrop-blur-md py-8 mt-16">
        <div className="max-w-[1800px] mx-auto px-8">
          <div className="text-center mb-8">
            <div className="inline-block bg-white border border-slate-200 shadow-sm rounded-2xl px-10 py-5 mb-6">
              <p className="text-slate-500 text-sm mb-1">Copyright © 2025</p>
              <p className="text-slate-800 text-lg tracking-wide">
                617ALLIANCE
              </p>
            </div>
          </div>

          <CommentSection />
        </div>
      </footer>

      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
