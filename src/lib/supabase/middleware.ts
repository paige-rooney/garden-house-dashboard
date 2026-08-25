import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabasePublicConfig } from "@/lib/env";

export async function updateSupabaseSession(request: NextRequest) {
  const config = supabasePublicConfig();
  let response = NextResponse.next({ request });
  if (!config) return { user: null, response };

  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, {
            ...options,
            sameSite: options.sameSite ?? "lax",
            secure: process.env.NODE_ENV === "production",
            path: options.path ?? "/",
          });
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { user, response, supabase };
}
