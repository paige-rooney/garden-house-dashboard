import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { lookupGoogleAccountEmail, saveTokens } from "@/lib/integrations/google-calendar";
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
  const tokens = (await tokenRes.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };
  if (!tokenRes.ok || !tokens.access_token) {
    return NextResponse.redirect(new URL("/admin?calendar=error", origin));
  }

  if (!tokens.refresh_token) {
    const supabase = getSupabaseServiceClient();
    const existing = supabase
      ? await supabase
          .from("integration_accounts")
          .select("refresh_token_encrypted")
          .eq("provider", "google_calendar")
          .maybeSingle()
      : { data: null };
    if (!existing.data?.refresh_token_encrypted) {
      return NextResponse.redirect(new URL("/admin?calendar=error", origin));
    }
  }

  const accountEmail = await lookupGoogleAccountEmail(tokens.access_token);
  await saveTokens({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresIn: tokens.expires_in,
    accountEmail,
    calendarId: env.GOOGLE_CALENDAR_ID ?? "primary",
  });

  return NextResponse.redirect(new URL("/admin?calendar=connected", origin));
}
