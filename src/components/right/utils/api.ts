import { supabase } from "../../../lib/supabase/client";
import { ENV } from "../../../config/env";

const API_BASE = ENV.API_BASE || "";
const APP_API_KEY = ENV.APP_API_KEY || "";

export async function authFetch(path: string, options: RequestInit = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (APP_API_KEY) headers["x-api-key"] = APP_API_KEY;

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
}

export async function createAlternativeAPI(body: {
  noteId: string | number;
  alternative: string;
}) {
  const res = await authFetch("/api/emotion-alternative-details", {
    method: "POST",
    body: JSON.stringify(body),
  });
  const payload = await res.json().catch(() => ({}));
  return { ok: res.ok, payload };
}
