import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export function getSupabaseServiceClient() {
  const url = env.SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(url, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function requireServiceClient() {
  const client = getSupabaseServiceClient();
  if (!client) {
    throw new Error("The studio database is not configured. Add Supabase keys in the hosting settings.");
  }
  return client;
}
