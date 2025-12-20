// api/_utils.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

export async function readJson(req: VercelRequest) {
  return await new Promise<any>((resolve) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch { resolve({}); }
    });
  });
}

export function requireAppKey(req: VercelRequest): boolean {
  const required = process.env.APP_API_KEY;
  if (!required) return true; // 없으면 dev 편의상 패스
  const got = req.headers["x-api-key"];
  return got === required;
}

export function json(res: VercelResponse, status: number, body: any) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}
