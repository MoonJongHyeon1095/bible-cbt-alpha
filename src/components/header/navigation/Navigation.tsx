// src/components/header/Navigation.tsx
import { Capacitor } from "@capacitor/core";
import {
  BookMarked,
  BookOpen,
  HeartPulse,
  LayoutDashboard,
  LifeBuoy,
} from "lucide-react";
import { useMemo } from "react";
import { DesktopNav } from "./DesktopNav";
import { MobileTabBar } from "./MobileTabBar";
import { MobileTopBar } from "./MobileTopBar";
import type { CbtMode } from "./ModePicker";
import type { NavItem } from "./types";
import { useIsDesktop } from "./useIsDesktop";
import { WebCompactNav } from "./WebCompactNav";

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  user: any;
  onLogout: () => void;
  onShowAuth: () => void;

  mode: CbtMode;
  onChangeMode: (mode: CbtMode) => void;
}

export function Navigation({
  currentPage,
  onNavigate,
  user,
  onLogout,
  onShowAuth,
  mode,
  onChangeMode,
}: NavigationProps) {
  const isDesktop = useIsDesktop(768);
  const isNativeMobile = !isDesktop && Capacitor.isNativePlatform();

  const navItems = useMemo<NavItem[]>(() => {
    const base: NavItem[] = [
      { id: "dashboard", label: "대시보드", icon: LayoutDashboard },
      // AI 챗봇 비활성화
      // { id: "ai-chat", label: "AI 상담", icon: MessageSquare },
      { id: "patterns", label: "감정노트", icon: HeartPulse },
      // 익명 커뮤니티 비활성화
      // { id: "community", label: "커뮤니티", icon: MessageSquare },
      { id: "helpline", label: "헬프라인", icon: LifeBuoy },
    ];

    if (mode.toneMode === "christian") {
      base.splice(1, 0, {
        id: "prayer-notes",
        label: "기도노트",
        icon: BookOpen,
      });
      base.splice(2, 0, {
        id: "scripture-notes",
        label: "말씀노트",
        icon: BookMarked,
      });
    }

    return base;
  }, [mode.toneMode]);

  const go = (page: string) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goHomeRefresh = () => {
    if (currentPage === "cbt") {
      window.location.reload();
      return;
    }
    go("cbt");
  };

  if (isNativeMobile) {
    return (
      <>
        <nav className="bg-white border-b-2 border-purple-100 shadow-sm sticky top-0 z-50">
          <MobileTopBar
            user={user}
            mode={mode}
            onChangeMode={onChangeMode}
            onLogout={onLogout}
            onShowAuth={onShowAuth}
            onNavigate={go}
          />
        </nav>
        <MobileTabBar
          currentPage={currentPage}
          navItems={navItems}
          onNavigate={go}
          onHomeRefresh={goHomeRefresh}
        />
      </>
    );
  }

  return (
    <nav className="bg-white border-b-2 border-purple-100 shadow-sm sticky top-0 z-50">
      {isDesktop ? (
        <DesktopNav
          currentPage={currentPage}
          navItems={navItems}
          user={user}
          mode={mode}
          onChangeMode={onChangeMode}
          onLogout={onLogout}
          onShowAuth={onShowAuth}
          onNavigate={go}
        />
      ) : (
        <WebCompactNav
          currentPage={currentPage}
          navItems={navItems}
          user={user}
          mode={mode}
          onChangeMode={onChangeMode}
          onLogout={onLogout}
          onShowAuth={onShowAuth}
          onNavigate={go}
        />
      )}
    </nav>
  );
}
