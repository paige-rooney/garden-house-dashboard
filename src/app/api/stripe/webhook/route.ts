import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { env } from "@/lib/env";
import { getStripeClient } from "@/lib/integrations/stripe";
import {
  syncStripeInvoiceEvent,
  syncStripePaymentIntentEvent,
} from "@/lib/integrations/stripe-sync";
import { claimWebhookEvent, finishWebhookEvent } from "@/lib/security/webhooks";
import { getSupabaseServiceClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Stripe webhooks are not configured. Add STRIPE_WEBHOOK_SECRET in hosting settings." },
      { status: 503 },
    );
  }

  const signature = (await headers()).get("stripe-signature");
  const body = await request.text();
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const claimed = await claimWebhookEvent("stripe", event.id, event.type);
  if (claimed.duplicate) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "invoice.paid": {
        await syncStripeInvoiceEvent(event.data.object as Stripe.Invoice, "paid");
        break;
      }
      case "invoice.payment_failed": {
        await syncStripeInvoiceEvent(event.data.object as Stripe.Invoice, "due");
        break;
      }
      case "invoice.voided": {
        await syncStripeInvoiceEvent(event.data.object as Stripe.Invoice, "due");
        await markInvoiceStatus(event.data.object as Stripe.Invoice, "void");
        break;
      }
      case "charge.refunded":
      case "charge.refund.updated": {
        await markRefund(event.data.object as Stripe.Charge);
        break;
      }
      case "payment_intent.succeeded": {
        await syncStripePaymentIntentEvent(event.data.object as Stripe.PaymentIntent, "paid");
        break;
      }
      case "payment_intent.payment_failed": {
        await syncStripePaymentIntentEvent(event.data.object as Stripe.PaymentIntent, "failed");
        break;
      }
      default:
        break;
    }
    await finishWebhookEvent("stripe", event.id, "processed");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook handler failed";
    await finishWebhookEvent("stripe", event.id, "failed", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function markInvoiceStatus(invoice: Stripe.Invoice, status: string) {
  const supabase = getSupabaseServiceClient();
  if (!supabase || !invoice.id) return;
  await supabase.from("invoices").update({ status }).eq("stripe_invoice_id", invoice.id);
}

async function markRefund(charge: Stripe.Charge) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return;
  const paymentIntent = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
  if (!paymentIntent) return;
  await supabase.from("payments").update({ status: "refunded" }).eq("stripe_payment_intent_id", paymentIntent);
  const { data } = await supabase
    .from("payments")
    .select("invoice_id")
    .eq("stripe_payment_intent_id", paymentIntent)
    .maybeSingle();
  if (data?.invoice_id) {
    await supabase.from("invoices").update({ status: "refunded" }).eq("id", data.invoice_id);
  }
}
