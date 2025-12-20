// api/health.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { json } from "./_utils";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  return json(res, 200, { status: "ok" });
}
