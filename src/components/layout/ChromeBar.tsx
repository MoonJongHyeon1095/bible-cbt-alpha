import type { User } from "@supabase/supabase-js";
import type { CbtMode } from "../header/navigation/ModePicker";

import { Navigation } from "../header/navigation/Navigation";
import { Notice } from "../Notice";

type ChromeBarProps = {
  currentPage: string;
  hideChrome: boolean;
  mode: CbtMode;
  user: User | null;
  onChangeMode: (next: CbtMode) => void;
  onHomeRefresh: () => void;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  onShowAuth: () => void;
};

export function ChromeBar({
  currentPage,
  hideChrome,
  mode,
  user,
  onChangeMode,
  onHomeRefresh,
  onLogout,
  onNavigate,
  onShowAuth,
}: ChromeBarProps) {
  if (hideChrome) return null;

  return (
    <>
      <Navigation
        currentPage={currentPage}
        onNavigate={onNavigate}
        onHomeRefresh={onHomeRefresh}
        user={user}
        onLogout={onLogout}
        onShowAuth={onShowAuth}
        mode={mode}
        onChangeMode={onChangeMode}
      />
      <Notice />
    </>
  );
}
