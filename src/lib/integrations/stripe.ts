import Stripe from "stripe";
import { env } from "@/lib/env";

let stripe: Stripe | null = null;

export function getStripeClient(): Stripe | null {
  if (!env.STRIPE_SECRET_KEY) return null;
  // Live keys stay disabled until STRIPE_MODE=live is explicitly approved.
  if (env.STRIPE_MODE !== "live" && env.STRIPE_SECRET_KEY.startsWith("sk_live_")) {
    return null;
  }
  if (!stripe) {
    // Use the SDK default API version for compatibility with the installed stripe package.
    stripe = new Stripe(env.STRIPE_SECRET_KEY);
  }
  return stripe;
}
