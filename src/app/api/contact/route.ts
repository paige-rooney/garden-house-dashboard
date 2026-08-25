import { NextRequest, NextResponse } from "next/server";
import { sendTransactionalEmail } from "@/lib/email/send";
import { env } from "@/lib/env";
import { contactFormSchema } from "@/lib/validators/forms";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { clientIp } from "@/lib/http";
import { jsonError } from "@/lib/http";

export async function POST(request: NextRequest) {
  try {
    await enforceRateLimit({ key: `contact:${clientIp(request)}`, limit: 8, windowMs: 15 * 60_000 });
    const parsed = contactFormSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ error: "Please complete the required fields." }, { status: 400 });
    }

    const to = env.RESEND_CONTACT_TO ?? env.RESEND_EVENTS_LIST;
    if (!to) {
      return NextResponse.json({ error: "The studio mailbox is not configured yet." }, { status: 503 });
    }

    const result = await sendTransactionalEmail({
      templateKey: "contact_form",
      to: [to],
      subject: `New contact form: ${parsed.data.firstName} ${parsed.data.lastName}`,
      text: [
        `Name: ${parsed.data.firstName} ${parsed.data.lastName}`,
        `Email: ${parsed.data.email}`,
        `Instagram: ${parsed.data.instagram ?? "N/A"}`,
        `Location: ${parsed.data.location ?? "N/A"}`,
        `Message: ${parsed.data.message}`,
      ].join("\n"),
      dedupeKey: `contact:${parsed.data.email}:${parsed.data.message.slice(0, 40)}`,
    });

    if (!result.ok) {
      return NextResponse.json({ error: "Could not send that message right now." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
