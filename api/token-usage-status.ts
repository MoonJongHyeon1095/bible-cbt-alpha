import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors, json, readJson, requireAppKey } from "./_utils";
import { getAuthUser, supabaseServiceClient } from "./_supabaseAuth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startedAt = Date.now();
  const logElapsed = (label: string) => {
    console.log("[token-usage-status] timing", {
      label,
      elapsed_ms: Date.now() - startedAt,
    });
  };
  if (handleCors(req, res)) return;
  if (req.method !== "POST") return json(res, 405, { error: "Method Not Allowed" });
  if (!requireAppKey(req)) return json(res, 401, { error: "Unauthorized" });

  const body = await readJson(req);
  const deviceId = body?.deviceId;
  const user = await getAuthUser(req);
  const userId = user?.id ?? null;

  if ((!deviceId || typeof deviceId !== "string") && !userId) {
    return json(res, 400, { error: "deviceId or userId is required" });
  }

  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const day = now.getUTCDate();

  const supabase = supabaseServiceClient();
  let query = supabase
    .from("token_usages")
    .select("year, month, day, monthly_usage, daily_usage, request_count, input_tokens, output_tokens")
    .eq("year", year)
    .eq("month", month);

  if (userId) {
    query = query.eq("user_id", userId);
  } else {
    query = query.eq("device_id", deviceId);
  }

  const { data, error } = await query.maybeSingle();
  logElapsed("db_query");

  if (error) {
    return json(res, 500, { error: "Failed to read usage", details: error });
  }

  const dailyUsage = data?.day === day ? Number(data?.daily_usage || 0) : 0;
  const monthlyUsage = Number(data?.monthly_usage || 0);

  const response = json(res, 200, {
    ok: true,
    usage: {
      year,
      month,
      day,
      daily_usage: dailyUsage,
      monthly_usage: monthlyUsage,
      request_count: Number(data?.request_count || 0),
      input_tokens: Number(data?.input_tokens || 0),
      output_tokens: Number(data?.output_tokens || 0),
    },
    is_member: Boolean(userId),
  });
  logElapsed("response");
  return response;
}
