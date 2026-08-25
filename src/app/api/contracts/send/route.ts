import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth/staff";
import { mergeContractBody, DEFAULT_CONTRACT_DISCLAIMER } from "@/lib/contracts/merge";
import { sendTransactionalEmail } from "@/lib/email/send";
import { env } from "@/lib/env";
import { jsonError } from "@/lib/http";
import { writeAudit } from "@/lib/security/audit";
import { getSupabaseServiceClient } from "@/lib/supabase/admin";
import { contractSendSchema } from "@/lib/validators/forms";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const { staff } = await requireStaff(request, { minRole: "admin" });
    const supabase = getSupabaseServiceClient();
    if (!supabase) return NextResponse.json({ error: "Database is unavailable." }, { status: 503 });

    const parsed = contractSendSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: "Choose a template and project." }, { status: 400 });

    const { data: project } = await supabase
      .from("projects")
      .select("id, title, song_count, budget_usd, due_date, client_id")
      .eq("id", parsed.data.projectId)
      .maybeSingle();
    if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });

    const { data: client } = await supabase
      .from("clients")
      .select("id, name, email")
      .eq("id", project.client_id)
      .maybeSingle();
    if (!client?.email) {
      return NextResponse.json({ error: "This client needs an email in CRM before sending a contract." }, { status: 400 });
    }

    const { data: template } = await supabase
      .from("contract_templates")
      .select("*")
      .eq("id", parsed.data.templateId)
      .maybeSingle();
    if (!template) return NextResponse.json({ error: "Template not found." }, { status: 404 });

    const body = mergeContractBody(template.body, {
      client_name: client.name,
      client_email: client.email,
      project_title: project.title,
      song_count: project.song_count,
      budget_usd: project.budget_usd,
      due_date: project.due_date,
      signature: "",
      signed_date: "",
    });

    const token = randomBytes(24).toString("hex");
    const { data: contract, error } = await supabase
      .from("contracts")
      .insert({
        project_id: project.id,
        client_id: client.id,
        template_id: template.id,
        title: template.name,
        body,
        status: "sent",
        sent_to: client.email,
        provider: env.CONTRACTS_PROVIDER,
        sign_token_hash: hashToken(token),
      })
      .select("id")
      .single();
    if (error || !contract) return NextResponse.json({ error: error?.message ?? "Could not save contract." }, { status: 500 });

    await supabase.from("contract_activity").insert({
      contract_id: contract.id,
      action: "sent",
      actor_email: staff.email,
      detail: `Sent to ${client.email}`,
    });

    const signUrl = `${env.NEXT_PUBLIC_SITE_URL}/sign/${token}`;
    const emailed = await sendTransactionalEmail({
      templateKey: "contract_sent",
      to: [client.email],
      subject: `Contract from Garden House: ${template.name}`,
      text: `Hello ${client.name},\n\nPlease review and sign: ${signUrl}\n\n${DEFAULT_CONTRACT_DISCLAIMER}\n`,
      dedupeKey: `contract-send-${contract.id}`,
    });

    await writeAudit({
      actorId: staff.id,
      actorEmail: staff.email,
      action: "contract.send",
      entityType: "contract",
      entityId: contract.id,
      metadata: { to: client.email, emailOk: emailed.ok },
    });

    return NextResponse.json({
      ok: true,
      contractId: contract.id,
      signUrl: env.APP_ENV === "production" ? undefined : signUrl,
      email: emailed,
      disclaimer: DEFAULT_CONTRACT_DISCLAIMER,
    });
  } catch (error) {
    return jsonError(error);
  }
}
