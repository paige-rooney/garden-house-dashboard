import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { env } from "@/lib/env";
import { getStripeClient } from "@/lib/integrations/stripe";
import {
  syncStripeInvoiceEvent,
  syncStripePaymentIntentEvent,
} from "@/lib/integrations/stripe-sync";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: true, demo: true });
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook handler failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
