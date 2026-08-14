import type Stripe from "stripe";
import { getSupabaseServiceClient } from "@/lib/integrations/supabase";

function centsToUsd(cents: number | null | undefined): number {
  return Number(((cents ?? 0) / 100).toFixed(2));
}

function unixToDateString(unix: number | null | undefined): string | null {
  if (!unix) return null;
  return new Date(unix * 1000).toISOString().slice(0, 10);
}

function paymentIntentIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const raw = invoice as Stripe.Invoice & {
    payment_intent?: string | Stripe.PaymentIntent | null;
  };
  const paymentIntent = raw.payment_intent;
  if (!paymentIntent) return null;
  return typeof paymentIntent === "string" ? paymentIntent : paymentIntent.id;
}

async function findInvoiceIdByStripeId(stripeInvoiceId: string) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("invoices")
    .select("id")
    .eq("stripe_invoice_id", stripeInvoiceId)
    .maybeSingle();

  return data?.id ?? null;
}

async function upsertPaymentForInvoice(params: {
  invoiceId: string;
  amountUsd: number;
  status: "paid" | "pending" | "failed";
  stripePaymentIntentId?: string | null;
  paidAt?: string | null;
}) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return;

  if (params.stripePaymentIntentId) {
    const { data: existing } = await supabase
      .from("payments")
      .select("id")
      .eq("stripe_payment_intent_id", params.stripePaymentIntentId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("payments")
        .update({
          amount_usd: params.amountUsd,
          status: params.status,
          paid_at: params.paidAt,
          invoice_id: params.invoiceId,
        })
        .eq("id", existing.id);
      return;
    }
  }

  await supabase.from("payments").insert({
    invoice_id: params.invoiceId,
    stripe_payment_intent_id: params.stripePaymentIntentId ?? null,
    amount_usd: params.amountUsd,
    status: params.status,
    paid_at: params.paidAt,
  });
}

export async function syncStripeInvoiceEvent(
  invoice: Stripe.Invoice,
  status: "paid" | "due",
) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return { ok: false as const, reason: "supabase_missing" };
  if (!invoice.id) return { ok: false as const, reason: "missing_stripe_invoice_id" };

  const amountUsd = centsToUsd(
    status === "paid" ? invoice.amount_paid || invoice.total : invoice.amount_due || invoice.total,
  );
  const dueDate = unixToDateString(invoice.due_date);
  const paymentIntentId = paymentIntentIdFromInvoice(invoice);

  let invoiceId = await findInvoiceIdByStripeId(invoice.id);

  if (!invoiceId) {
    const projectId = invoice.metadata?.project_id;
    const clientId = invoice.metadata?.client_id;

    if (!projectId || !clientId) {
      return { ok: false as const, reason: "invoice_not_linked" };
    }

    const { data, error } = await supabase
      .from("invoices")
      .insert({
        project_id: projectId,
        client_id: clientId,
        stripe_invoice_id: invoice.id,
        amount_usd: amountUsd,
        status,
        due_date: dueDate,
      })
      .select("id")
      .single();

    if (error || !data) {
      return { ok: false as const, reason: error?.message ?? "insert_failed" };
    }

    invoiceId = data.id;
  } else {
    await supabase
      .from("invoices")
      .update({
        status,
        amount_usd: amountUsd,
        due_date: dueDate,
      })
      .eq("id", invoiceId);
  }

  await upsertPaymentForInvoice({
    invoiceId,
    amountUsd,
    status: status === "paid" ? "paid" : "failed",
    stripePaymentIntentId: paymentIntentId,
    paidAt: status === "paid" ? new Date().toISOString() : null,
  });

  return { ok: true as const, invoiceId };
}

export async function syncStripePaymentIntentEvent(
  paymentIntent: Stripe.PaymentIntent,
  status: "paid" | "failed",
) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return { ok: false as const, reason: "supabase_missing" };

  const amountUsd = centsToUsd(paymentIntent.amount_received || paymentIntent.amount);
  const paidAt = status === "paid" ? new Date().toISOString() : null;

  const { data: existingPayment } = await supabase
    .from("payments")
    .select("id, invoice_id")
    .eq("stripe_payment_intent_id", paymentIntent.id)
    .maybeSingle();

  if (existingPayment) {
    await supabase
      .from("payments")
      .update({
        amount_usd: amountUsd,
        status,
        paid_at: paidAt,
      })
      .eq("id", existingPayment.id);

    if (status === "paid" && existingPayment.invoice_id) {
      await supabase
        .from("invoices")
        .update({ status: "paid", amount_usd: amountUsd })
        .eq("id", existingPayment.invoice_id);
    }

    return { ok: true as const, paymentId: existingPayment.id };
  }

  const invoiceIdFromMeta = paymentIntent.metadata?.invoice_id;
  const stripeInvoiceId = paymentIntent.metadata?.stripe_invoice_id;

  let invoiceId = invoiceIdFromMeta ?? null;
  if (!invoiceId && stripeInvoiceId) {
    invoiceId = await findInvoiceIdByStripeId(stripeInvoiceId);
  }

  if (!invoiceId) {
    return { ok: false as const, reason: "payment_not_linked" };
  }

  await upsertPaymentForInvoice({
    invoiceId,
    amountUsd,
    status,
    stripePaymentIntentId: paymentIntent.id,
    paidAt,
  });

  if (status === "paid") {
    await supabase.from("invoices").update({ status: "paid", amount_usd: amountUsd }).eq("id", invoiceId);
  }

  return { ok: true as const, invoiceId };
}
