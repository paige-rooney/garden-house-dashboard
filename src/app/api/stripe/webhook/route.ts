import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getStripeClient } from "@/lib/integrations/stripe";

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

  const event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  switch (event.type) {
    case "invoice.paid":
    case "invoice.payment_failed":
    case "payment_intent.succeeded":
    case "payment_intent.payment_failed":
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
