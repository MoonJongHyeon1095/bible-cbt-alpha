import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getUser } from "../../utils/authStatus";

type UseAuthSessionParams = {
  onUserResolved?: (user: User | null) => void;
};

export function useAuthSession({ onUserResolved }: UseAuthSessionParams = {}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await getUser();
      setUser(currentUser);
      onUserResolved?.(currentUser);
    } catch (error) {
      console.error("사용자 확인 오류:", error);
      setUser(null);
      onUserResolved?.(null);
    } finally {
      setLoading(false);
    }
  }, [onUserResolved]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return { loading, refreshUser, setUser, user };
}
