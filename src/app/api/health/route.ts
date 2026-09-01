import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getStripeClient } from "@/lib/integrations/stripe";
import { r2Configured } from "@/lib/integrations/r2";
import { getResendClient } from "@/lib/integrations/resend";
import { getSupabaseServiceClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabaseServiceClient();
  let database = "unconfigured";
  if (supabase) {
    const { error } = await supabase.from("clients").select("id", { head: true, count: "exact" });
    database = error ? "error" : "ok";
  }

  return NextResponse.json({
    ok: database === "ok" || database === "unconfigured",
    app: env.APP_ENV,
    stripeMode: env.STRIPE_MODE,
    checks: {
      database,
      stripe: getStripeClient() ? "configured" : "missing",
      email: getResendClient() ? "configured" : "missing",
      files: r2Configured() ? "configured" : "missing",
      googleClientId: env.GOOGLE_CLIENT_ID ? "configured" : "missing",
      googleRedirect: env.GOOGLE_REDIRECT_URI ? "configured" : "missing",
      googleCalendarId: env.GOOGLE_CALENDAR_ID ? "configured" : "missing",
      encryptionKey: env.INTEGRATION_ENCRYPTION_KEY ? "configured" : "missing",
    },
  });
}
