import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import type { CbtMode } from "../header/navigation/ModePicker";

import { ChromeBar } from "./ChromeBar";
import { OverlayLayer } from "./OverlayLayer";
import { PageFrame } from "./PageFrame";

type SessionLayoutProps = {
  authModalOpen: boolean;
  children: ReactNode;
  cbtStep: number;
  currentPage: string;
  hideChrome: boolean;
  isDesktop: boolean;
  isNativeMobile: boolean;
  mode: CbtMode;
  showLiteGradient: boolean;
  user: User | null;
  onAuthSuccess: () => void;
  onCloseAuthModal: () => void;
  onHomeRefresh: () => void;
  onLogout: () => void;
  onNavigate: (page: string) => boolean | void;
  onShowAuth: () => void;
};

export function SessionLayout({
  authModalOpen,
  children,
  cbtStep,
  currentPage,
  hideChrome,
  isDesktop,
  isNativeMobile,
  mode,
  showLiteGradient,
  user,
  onAuthSuccess,
  onCloseAuthModal,
  onHomeRefresh,
  onLogout,
  onNavigate,
  onShowAuth,
}: SessionLayoutProps) {
  return (
    <>
      <ChromeBar
        currentPage={currentPage}
        hideChrome={hideChrome}
        mode={mode}
        user={user}
        onHomeRefresh={onHomeRefresh}
        onLogout={onLogout}
        onNavigate={onNavigate}
        onShowAuth={onShowAuth}
      />
      <PageFrame
        cbtStep={cbtStep}
        currentPage={currentPage}
        hideChrome={hideChrome}
        isDesktop={isDesktop}
        isNativeMobile={isNativeMobile}
        showLiteGradient={showLiteGradient}
      >
        {children}
      </PageFrame>
      <OverlayLayer
        authModalOpen={authModalOpen}
        onAuthSuccess={onAuthSuccess}
        onCloseAuthModal={onCloseAuthModal}
      />
    </>
  );
}
