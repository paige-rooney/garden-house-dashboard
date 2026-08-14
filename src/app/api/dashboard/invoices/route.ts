import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStripeClient } from "@/lib/integrations/stripe";
import { getSupabaseServiceClient } from "@/lib/integrations/supabase";

const createInvoiceSchema = z.object({
  projectId: z.string().uuid(),
  amountUsd: z.number().positive(),
  dueDate: z.string().optional(),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const stripe = getStripeClient();
  const supabase = getSupabaseServiceClient();

  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 400 });
  }
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = createInvoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, title, client_id, clients(id, name, email)")
    .eq("id", parsed.data.projectId)
    .maybeSingle();

  if (projectError || !project) {
    return NextResponse.json({ error: projectError?.message ?? "Project not found" }, { status: 404 });
  }

  const clientRelation = project.clients as
    | { id: string; name: string; email: string }
    | { id: string; name: string; email: string }[]
    | null;
  const client = Array.isArray(clientRelation) ? clientRelation[0] : clientRelation;

  if (!client?.email) {
    return NextResponse.json({ error: "Project client email is required" }, { status: 400 });
  }

  const customers = await stripe.customers.list({ email: client.email, limit: 1 });
  const customer =
    customers.data[0] ??
    (await stripe.customers.create({
      email: client.email,
      name: client.name,
      metadata: { client_id: client.id },
    }));

  const amountCents = Math.round(parsed.data.amountUsd * 100);
  const description =
    parsed.data.description?.trim() ||
    `Garden House — ${project.title}`;

  await stripe.invoiceItems.create({
    customer: customer.id,
    amount: amountCents,
    currency: "usd",
    description,
  });

  const invoiceParams: {
    customer: string;
    collection_method: "send_invoice";
    days_until_due: number;
    metadata: Record<string, string>;
    auto_advance: boolean;
  } = {
    customer: customer.id,
    collection_method: "send_invoice",
    days_until_due: 14,
    metadata: {
      project_id: project.id,
      client_id: client.id,
    },
    auto_advance: true,
  };

  const stripeInvoice = await stripe.invoices.create(invoiceParams);
  if (!stripeInvoice.id) {
    return NextResponse.json({ error: "Stripe did not return an invoice id" }, { status: 500 });
  }

  const finalized = await stripe.invoices.finalizeInvoice(stripeInvoice.id);
  if (!finalized.id) {
    return NextResponse.json({ error: "Stripe finalize did not return an invoice id" }, { status: 500 });
  }

  await stripe.invoices.sendInvoice(finalized.id);

  const dueDate =
    parsed.data.dueDate ||
    (finalized.due_date
      ? new Date(finalized.due_date * 1000).toISOString().slice(0, 10)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));

  const { data: localInvoice, error: insertError } = await supabase
    .from("invoices")
    .insert({
      project_id: project.id,
      client_id: client.id,
      stripe_invoice_id: finalized.id,
      amount_usd: parsed.data.amountUsd,
      status: "due",
      due_date: dueDate,
    })
    .select("id")
    .single();

  if (insertError || !localInvoice) {
    return NextResponse.json(
      { error: insertError?.message ?? "Failed to save invoice locally" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    invoiceId: localInvoice.id,
    stripeInvoiceId: finalized.id,
    hostedInvoiceUrl: finalized.hosted_invoice_url,
  });
}
