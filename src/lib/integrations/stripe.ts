import Stripe from "stripe";
import { env } from "@/lib/env";

let stripe: Stripe | null = null;

export function getStripeClient(): Stripe | null {
  if (!env.STRIPE_SECRET_KEY) return null;
  if (!stripe) {
    // Use the SDK default API version for compatibility with the installed stripe package.
    stripe = new Stripe(env.STRIPE_SECRET_KEY);
  }
  return stripe;
}
