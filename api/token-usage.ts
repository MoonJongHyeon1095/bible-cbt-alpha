// api/token-usage.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAuthUser, supabaseServiceClient } from "./_supabaseAuth";
import { handleCors, json, readJson, requireAppKey } from "./_utils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== "POST") return json(res, 405, { error: "Method Not Allowed" });
  if (!requireAppKey(req)) return json(res, 401, { error: "Unauthorized" });

  const body = await readJson(req);
  const deviceId = body?.deviceId;
  const usage = body?.usage ?? {};
  const user = await getAuthUser(req);
  const userId = user?.id ?? null;

  if ((!deviceId || typeof deviceId !== "string") && !userId) {
    return json(res, 400, { error: "deviceId or userId is required" });
  }
  const resolvedDeviceId = userId ? null : deviceId;

  const totalTokensRaw = Number(usage?.total_tokens || 0);
  const inputTokens = Number(usage?.input_tokens || 0);
  const outputTokens = Number(usage?.output_tokens || 0);
  const totalTokens = totalTokensRaw || inputTokens + outputTokens;
  const requestCount = Number(usage?.request_count || 0);

  if ([totalTokens, inputTokens, outputTokens, requestCount].some((v) => !Number.isFinite(v) || v < 0)) {
    return json(res, 400, { error: "invalid usage values" });
  }

  if (totalTokens + inputTokens + outputTokens + requestCount === 0) {
    return json(res, 200, { ok: true });
  }

  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const day = now.getUTCDate();

  const supabase = supabaseServiceClient();
  const { error } = await supabase.rpc("increment_token_usages", {
    p_user_id: userId,
    p_device_id: resolvedDeviceId,
    p_year: year,
    p_month: month,
    p_day: day,
    p_total_tokens: totalTokens,
    p_input_tokens: inputTokens,
    p_output_tokens: outputTokens,
    p_request_count: requestCount,
  });

  if (error) {
    return json(res, 500, { error: "Failed to update usage", details: error });
  }

  return json(res, 200, { ok: true });
}
