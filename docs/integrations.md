# Integrations

## Resend
- Contact form endpoint: `POST /api/contact`
- Event subscribe endpoint: `POST /api/events/subscribe`
- Contracts send endpoint: `POST /api/contracts/send`
- Template catalog endpoint: `GET /api/resend/templates`

## Stripe
- Webhook endpoint: `POST /api/stripe/webhook`
- Handles `invoice.paid`, `invoice.payment_failed`, `payment_intent.succeeded`, and `payment_intent.payment_failed`
- Updates matching Supabase `invoices` / `payments` rows (matched by Stripe ids or metadata)
- Create invoice from admin: `POST /api/dashboard/invoices` (creates Stripe invoice + local row)

## Cloudflare R2
- Signed upload URL endpoint: `POST /api/r2/sign`
- Use returned URL for direct upload from client.

## Admin PIN
- Access page: `/studio-green-room`
- Dashboard: `/studio-green-room/dashboard`
- API verifier: `POST /api/auth/pin`
