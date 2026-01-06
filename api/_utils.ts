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

export function setCors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
}

export function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  setCors(res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}

export function json(res: VercelResponse, status: number, body: any) {
  setCors(res);
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}
