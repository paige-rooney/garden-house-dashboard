import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { jsonError } from "@/lib/http";
import { sendTransactionalEmail } from "@/lib/email/send";
import { getSupabaseServiceClient } from "@/lib/supabase/admin";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { clientIp } from "@/lib/http";

const schema = z.object({
  token: z.string().min(10),
  signatureName: z.string().min(2),
});

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    await enforceRateLimit({ key: `sign:${clientIp(request)}`, limit: 20, windowMs: 15 * 60_000 });
    const parsed = schema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: "Enter your full name to sign." }, { status: 400 });
    const supabase = getSupabaseServiceClient();
    if (!supabase) return NextResponse.json({ error: "Signing is temporarily unavailable." }, { status: 503 });

    const { data: contract } = await supabase
      .from("contracts")
      .select("*")
      .eq("sign_token_hash", hashToken(parsed.data.token))
      .maybeSingle();
    if (!contract) return NextResponse.json({ error: "This signing link is invalid or expired." }, { status: 404 });
    if (["cancelled", "expired", "declined", "signed"].includes(contract.status)) {
      return NextResponse.json({ error: `This contract is already ${contract.status}.` }, { status: 400 });
    }

    const signedBody = `${contract.body}\n\nSigned by: ${parsed.data.signatureName}\nDate: ${new Date().toISOString()}\n`;
    await supabase
      .from("contracts")
      .update({
        status: "signed",
        signed_at: new Date().toISOString(),
        body: signedBody,
      })
      .eq("id", contract.id);
    await supabase.from("contract_activity").insert({
      contract_id: contract.id,
      action: "signed",
      actor_email: contract.sent_to,
      detail: parsed.data.signatureName,
    });

    if (contract.sent_to) {
      await sendTransactionalEmail({
        templateKey: "contract_signed",
        to: [contract.sent_to],
        subject: "Your Garden House contract is signed",
        text: `Thanks. The contract "${contract.title ?? "Agreement"}" is marked signed.`,
        dedupeKey: `contract-signed-${contract.id}`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
