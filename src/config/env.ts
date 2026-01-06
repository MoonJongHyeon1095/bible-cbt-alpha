export const ENV = {
  SUPABASE_URL: (import.meta.env.VITE_SUPABASE_URL ?? "").trim(),
  SUPABASE_ANON_KEY: (import.meta.env.VITE_SUPABASE_ANON_KEY ?? "").trim(),
  API_BASE: (import.meta.env.VITE_API_BASE ?? "").trim(), // 비어있으면 same-origin
  APP_API_KEY: (import.meta.env.VITE_APP_API_KEY ?? "").trim(),
};

export function assertEnv() {
  if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
    throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
  }
}
