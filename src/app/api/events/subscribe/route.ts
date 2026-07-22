import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getResendClient } from "@/lib/integrations/resend";
import { getSupabaseServiceClient } from "@/lib/integrations/supabase";
import { eventSubscribeSchema } from "@/lib/validators/forms";

export async function POST(request: NextRequest) {
  const raw = await request.json().catch(() => ({}));
  const parsed = eventSubscribeSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();
  if (supabase) {
    await supabase.from("mailing_list_subscribers").upsert(
      {
        email: parsed.data.email,
        recipient_group: parsed.data.recipientGroup,
      },
      { onConflict: "email" },
    );
  }

  const resend = getResendClient();
  if (resend && env.RESEND_FROM && env.RESEND_EVENTS_LIST) {
    await resend.emails.send({
      from: env.RESEND_FROM,
      to: [env.RESEND_EVENTS_LIST],
      subject: "New event mailing list subscriber",
      text: `Subscriber: ${parsed.data.email}\nPreference: ${parsed.data.recipientGroup}`,
    });
  }

  return NextResponse.json({ ok: true, demo: !resend });
}
