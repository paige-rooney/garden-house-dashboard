import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { encryptSecret } from "@/lib/crypto";
import { getSupabaseServiceClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const origin = new URL(request.url).origin;
  if (!code || !env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REDIRECT_URI) {
    return NextResponse.redirect(new URL("/admin?calendar=error", origin));
  }

  const body = new URLSearchParams({
    code,
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    redirect_uri: env.GOOGLE_REDIRECT_URI,
    grant_type: "authorization_code",
  });
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const tokens = await tokenRes.json();
  if (!tokenRes.ok || !tokens.refresh_token) {
    return NextResponse.redirect(new URL("/admin?calendar=error", origin));
  }

  const supabase = getSupabaseServiceClient();
  if (supabase) {
    await supabase.from("integration_accounts").upsert({
      provider: "google_calendar",
      calendar_id: env.GOOGLE_CALENDAR_ID ?? "primary",
      access_token_encrypted: encryptSecret(tokens.access_token),
      refresh_token_encrypted: encryptSecret(tokens.refresh_token),
      token_expires_at: new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000).toISOString(),
      scopes: tokens.scope,
    }, { onConflict: "provider" });
  }

  return NextResponse.redirect(new URL("/admin?calendar=connected", origin));
}
