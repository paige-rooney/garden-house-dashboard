import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { requireStaff } from "@/lib/auth/staff";
import { jsonError } from "@/lib/http";

export async function GET(request: NextRequest) {
  try {
    await requireStaff(request, { minRole: "owner" });
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_REDIRECT_URI) {
      return NextResponse.json(
        { error: "Google Calendar is not connected yet. Add the Google client ID and redirect URL first." },
        { status: 400 },
      );
    }
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
    url.searchParams.set("redirect_uri", env.GOOGLE_REDIRECT_URI);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");
    url.searchParams.set("scope", "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events");
    return NextResponse.redirect(url);
  } catch (error) {
    return jsonError(error);
  }
}
