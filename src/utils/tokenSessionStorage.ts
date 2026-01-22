import { ENV } from "../config/env";
import { supabase } from "../lib/supabase/client";
import { getDeviceId } from "./deviceId";

export const TOKEN_SESSION_KEY = "gpt_usage_total";

export type TokenUsage = {
  total_tokens: number;
  input_tokens: number;
  output_tokens: number;
  request_count: number;
};

export type TokenUsageStatus = {
  usage: {
    year: number;
    month: number;
    day: number;
    daily_usage: number;
    monthly_usage: number;
    request_count: number;
    input_tokens: number;
    output_tokens: number;
  };
  is_member: boolean;
};

const API_BASE = ENV.API_BASE || "";
const APP_API_KEY = ENV.APP_API_KEY || "";

export function readTokenSessionUsage(): TokenUsage | null {
  try {
    const raw = sessionStorage.getItem(TOKEN_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      total_tokens: Number(parsed?.total_tokens || 0),
      input_tokens: Number(parsed?.input_tokens || 0),
      output_tokens: Number(parsed?.output_tokens || 0),
      request_count: Number(parsed?.request_count || 0),
    };
  } catch {
    return null;
  }
}

export function writeTokenSessionUsage(usage: TokenUsage) {
  try {
    sessionStorage.setItem(TOKEN_SESSION_KEY, JSON.stringify(usage));
  } catch {
    /* ignore */
  }
}

async function syncTokenUsage(usage: TokenUsage) {
  const deviceId = getDeviceId();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (APP_API_KEY) headers["x-api-key"] = APP_API_KEY;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/token-usage`, {
    method: "POST",
    headers,
    body: JSON.stringify({ deviceId, usage }),
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload?.error ?? `token_usage failed (${res.status})`);
  }
}

export async function clearTokenSessionStorage() {
  try {
    const usage = readTokenSessionUsage();
    if (!usage) return;
    const hasUsage =
      usage.total_tokens > 0 ||
      usage.input_tokens > 0 ||
      usage.output_tokens > 0 ||
      usage.request_count > 0;
    if (!hasUsage) {
      sessionStorage.removeItem(TOKEN_SESSION_KEY);
      return;
    }
    await syncTokenUsage(usage);
    sessionStorage.removeItem(TOKEN_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export async function fetchTokenUsageStatus(): Promise<TokenUsageStatus> {
  const deviceId = getDeviceId();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (APP_API_KEY) headers["x-api-key"] = APP_API_KEY;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/token-usage-status`, {
    method: "POST",
    headers,
    body: JSON.stringify({ deviceId }),
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload?.error ?? `token_usage_status failed (${res.status})`);
  }

  return payload as TokenUsageStatus;
}
