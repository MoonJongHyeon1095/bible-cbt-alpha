-- supabase/migrations/20251220024800_create_cbt_kv_store_alpha.sql
create table if not exists public.cbt_kv_store_alpha (
  key text primary key,
  value jsonb not null
);