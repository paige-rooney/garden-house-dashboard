import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getResendClient } from "@/lib/integrations/resend";
import { contactFormSchema } from "@/lib/validators/forms";

export async function POST(request: NextRequest) {
  const raw = await request.json().catch(() => ({}));
  const parsed = contactFormSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const resend = getResendClient();
  if (!resend || !env.RESEND_FROM) {
    return NextResponse.json({ ok: true, demo: true });
  }

  const to =
    env.RESEND_CONTACT_TO ?? env.RESEND_EVENTS_LIST ?? "hello@gardenhouserecordingstudios.com";

  const { error } = await resend.emails.send({
    from: env.RESEND_FROM,
    to: [to],
    subject: `New contact form: ${parsed.data.firstName} ${parsed.data.lastName}`,
    text: [
      `Name: ${parsed.data.firstName} ${parsed.data.lastName}`,
      `Email: ${parsed.data.email}`,
      `Instagram: ${parsed.data.instagram ?? "N/A"}`,
      `Location: ${parsed.data.location ?? "N/A"}`,
      `Message: ${parsed.data.message}`,
    ].join("\n"),
  });

  if (error) {
    return NextResponse.json({ error: error.message, demo: false }, { status: 502 });
  }

  return NextResponse.json({ ok: true, demo: false });
}
