import { ENV } from "../../config/env";
import { supabase } from "../../lib/supabase/client";
import { getDeviceId } from "../storage/deviceId";
import type { TokenUsage } from "../storage/tokenSessionStorage";

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

export async function syncTokenUsage(usage: TokenUsage) {
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
