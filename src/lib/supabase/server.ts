import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabasePublicConfig } from "@/lib/env";

export async function createSupabaseServerClient() {
  const config = supabasePublicConfig();
  if (!config) return null;
  const cookieStore = await cookies();

  return createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, {
              ...options,
              httpOnly: options.httpOnly ?? true,
              sameSite: options.sameSite ?? "lax",
              secure: process.env.NODE_ENV === "production",
              path: options.path ?? "/",
            });
          });
        } catch {
          // Called from a Server Component; middleware will refresh cookies.
        }
      },
    },
  });
}
