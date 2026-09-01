import { createBrowserClient } from "@supabase/ssr";
import { supabasePublicConfig } from "@/lib/env";

export function createSupabaseBrowserClient() {
  const config = supabasePublicConfig();
  if (!config) {
    throw new Error(
      "Supabase public keys are not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in hosting settings, then redeploy.",
    );
  }
  return createBrowserClient(config.url, config.anonKey);
}
