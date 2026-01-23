import { useCallback } from "react";
import type { User } from "@supabase/supabase-js";

type UseNavigationGuardParams = {
  user: User | null;
  onRequireAuth: () => void;
  onNavigate: (page: string) => void;
};

const PROTECTED_PAGES = new Set(["patterns", "prayer-notes"]);

export function useNavigationGuard({
  user,
  onNavigate,
  onRequireAuth,
}: UseNavigationGuardParams) {
  return useCallback(
    (page: string) => {
      if (!user && PROTECTED_PAGES.has(page)) {
        onRequireAuth();
        return false;
      }
      onNavigate(page);
      return true;
    },
    [onNavigate, onRequireAuth, user]
  );
}
