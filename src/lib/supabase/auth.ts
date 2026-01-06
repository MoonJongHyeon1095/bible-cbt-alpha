// src/lib/supabase/auth.ts
import { Capacitor } from "@capacitor/core";
import { supabase } from "./client";

export const authHelpers = {
  signUp(email: string, password: string, name: string) {
    return supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
  },

  signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  },

  signOut() {
    return supabase.auth.signOut();
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  signInWithGoogle() {
    const redirectTo =
      Capacitor.isNativePlatform()
        ? "com.example.cbt://auth-callback"
        : typeof window !== "undefined"
          ? window.location.origin
          : undefined;

    return supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  },
};
