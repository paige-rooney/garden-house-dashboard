import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { getResendClient } from "@/lib/integrations/resend";

const schema = z.object({
  template: z.string().min(1),
  projectId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const raw = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const resend = getResendClient();
  if (resend && env.RESEND_FROM) {
    await resend.emails.send({
      from: env.RESEND_FROM,
      to: ["contracts@gardenhouserecordingstudios.com"],
      subject: `Contract queued for ${parsed.data.projectId}`,
      text: `Template: ${parsed.data.template}\nProject: ${parsed.data.projectId}\nIncludes signature and date fields.`,
    });
  }

  return NextResponse.json({ ok: true, demo: !resend });
}
