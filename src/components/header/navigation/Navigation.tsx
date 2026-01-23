// src/components/header/Navigation.tsx
import { Capacitor } from "@capacitor/core";
import { BookOpen, HeartPulse, LayoutDashboard, LifeBuoy } from "lucide-react";
import { useMemo } from "react";
import { MobileTabBar } from "../mobile/MobileTabBar";
import { MobileTopBar } from "../mobile/MobileTopBar";
import { DesktopNav } from "./DesktopNav";
import type { CbtMode } from "./ModePicker";
import type { NavItem } from "./types";
import { useIsDesktop } from "./useIsDesktop";
import { WebCompactNav } from "./WebCompactNav";

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => boolean | void;
  onHomeRefresh: () => void;
  user: any;
  onLogout: () => void;
  onShowAuth: () => void;

  mode: CbtMode;
}

export function Navigation({
  currentPage,
  onNavigate,
  onHomeRefresh,
  user,
  onLogout,
  onShowAuth,
  mode,
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
    }

    return base;
  }, [mode.toneMode]);

  const go = (page: string) => {
    const canNavigate = onNavigate(page);
    if (canNavigate === false) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goHomeRefresh = () => {
    onHomeRefresh();
  };

  if (isNativeMobile) {
    return (
      <>
        <nav className="bg-white sticky top-0 z-50">
          <MobileTopBar
            user={user}
            onLogout={onLogout}
            onShowAuth={onShowAuth}
            onNavigate={go}
            onHomeRefresh={goHomeRefresh}
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
    <nav className="bg-white sticky top-0 z-50">
      {isDesktop ? (
        <DesktopNav
          currentPage={currentPage}
          navItems={navItems}
          user={user}
          onLogout={onLogout}
          onShowAuth={onShowAuth}
          onNavigate={go}
          onHomeRefresh={goHomeRefresh}
        />
      ) : (
        <WebCompactNav
          currentPage={currentPage}
          navItems={navItems}
          user={user}
          onLogout={onLogout}
          onShowAuth={onShowAuth}
          onNavigate={go}
          onHomeRefresh={goHomeRefresh}
        />
      )}
    </nav>
  );
}
