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
  try {
    const stripe = getStripeClient();
    const supabase = getSupabaseServiceClient();

    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured. Add STRIPE_SECRET_KEY in Vercel env vars and redeploy." },
        { status: 400 },
      );
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
      .select("id, title, client_id")
      .eq("id", parsed.data.projectId)
      .maybeSingle();

    if (projectError) {
      return NextResponse.json({ error: projectError.message }, { status: 500 });
    }
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, name, email")
      .eq("id", project.client_id)
      .maybeSingle();

    if (clientError) {
      return NextResponse.json({ error: clientError.message }, { status: 500 });
    }
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
      parsed.data.description?.trim() || `Garden House — ${project.title}`;

    await stripe.invoiceItems.create({
      customer: customer.id,
      amount: amountCents,
      currency: "usd",
      description,
    });

    const stripeInvoice = await stripe.invoices.create({
      customer: customer.id,
      collection_method: "send_invoice",
      days_until_due: 14,
      metadata: {
        project_id: project.id,
        client_id: client.id,
      },
      auto_advance: false,
    });

    if (!stripeInvoice.id) {
      return NextResponse.json({ error: "Stripe did not return an invoice id" }, { status: 500 });
    }

    const finalized = await stripe.invoices.finalizeInvoice(stripeInvoice.id);
    if (!finalized.id) {
      return NextResponse.json({ error: "Stripe finalize did not return an invoice id" }, { status: 500 });
    }

    let hostedInvoiceUrl = finalized.hosted_invoice_url;
    try {
      const sent = await stripe.invoices.sendInvoice(finalized.id);
      hostedInvoiceUrl = sent.hosted_invoice_url ?? hostedInvoiceUrl;
    } catch (sendError) {
      // Test mode can still create/finalize even if email send is restricted.
      console.error("Stripe sendInvoice warning:", sendError);
    }

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
        {
          error:
            insertError?.message ??
            "Stripe invoice created, but saving to Supabase failed. Run supabase/stripe_indexes.sql if needed.",
          stripeInvoiceId: finalized.id,
          hostedInvoiceUrl,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      invoiceId: localInvoice.id,
      stripeInvoiceId: finalized.id,
      hostedInvoiceUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invoice creation failed";
    console.error("Create invoice error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
