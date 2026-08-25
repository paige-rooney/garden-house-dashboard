import { createBrowserClient } from "@supabase/ssr";
import { supabasePublicConfig } from "@/lib/env";

export function createSupabaseBrowserClient() {
  const config = supabasePublicConfig();
  if (!config) {
    throw new Error("Supabase public keys are not configured.");
  }
  return createBrowserClient(config.url, config.anonKey);
}
