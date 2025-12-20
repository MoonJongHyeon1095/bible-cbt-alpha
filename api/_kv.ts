// api/_kv.ts
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const TABLE = "cbt_kv_store_alpha";

function client() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

export async function set(key: string, value: any) {
  const supabase = client();
  const { error } = await supabase.from(TABLE).upsert({ key, value });
  if (error) throw new Error(error.message);
}

export async function getByPrefix(prefix: string) {
  const supabase = client();
  const { data, error } = await supabase
    .from(TABLE)
    .select("key,value")
    .like("key", `${prefix}%`);
  if (error) throw new Error(error.message);
  return (data ?? []).map((d) => d.value);
}
