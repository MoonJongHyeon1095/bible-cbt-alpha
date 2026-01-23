import { authHelpers } from "../lib/supabase/auth";

export async function getUser() {
  try {
    const { user } = await authHelpers.getCurrentUser();
    return user;
  } catch {
    return null;
  }
}
