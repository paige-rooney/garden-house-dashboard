-- Unique indexes so Stripe webhooks can upsert reliably.
-- Run in Supabase SQL Editor.

create unique index if not exists idx_invoices_stripe_invoice_id
  on public.invoices (stripe_invoice_id)
  where stripe_invoice_id is not null;

create unique index if not exists idx_payments_stripe_payment_intent_id
  on public.payments (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;
