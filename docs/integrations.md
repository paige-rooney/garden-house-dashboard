# Integrations

Never paste live secrets into this file.

## Supabase

- Auth + database.
- Server uses the service role only after a staff session is verified.
- Browser uses the anon key only to sign in. Row Level Security is on; CRM tables have no public policies.

## Stripe (test mode)

- Create invoice: `POST /api/dashboard/invoices`
- Webhook: `POST /api/stripe/webhook`
- Events: `invoice.paid`, `invoice.payment_failed`, `invoice.voided`, `charge.refunded`, `payment_intent.succeeded`, `payment_intent.payment_failed`
- Duplicate delivery is ignored using `webhook_events`
- Live mode requires written approval (`STRIPE_MODE=live`)

Webhook URL (production): `https://YOUR-DOMAIN/api/stripe/webhook`

## Resend

- Contact: `POST /api/contact`
- Event subscribe: `POST /api/events/subscribe`
- Contracts and booking emails use `src/lib/email/send.ts`
- Development mail is redirected to `EMAIL_SAFE_RECIPIENT` when set

## Cloudflare R2

- Upload/download: `POST`/`PUT`/`GET /api/files`
- Keys look like `{environment}/{purpose}/{clientId}/{projectId}/{id}-filename`
- Bucket CORS (S3 API): allow `PUT` and `GET` from `http://localhost:3000` and the production domain, headers `Content-Type`, `Authorization`

## Contracts

- Default provider: built-in signing page `/sign/{token}`
- Dropbox Sign is optional and not enabled without `DROPBOX_SIGN_API_KEY` and owner approval

## Google Calendar

- Owner visits `/api/calendar/oauth/start`
- Callback: `GOOGLE_REDIRECT_URI` (local, preview, and production each need their own authorized redirect)
- Tokens are encrypted with `INTEGRATION_ENCRYPTION_KEY`

Redirect URLs to add in Google Cloud:

- `http://localhost:3000/api/calendar/oauth/callback`
- `https://YOUR-PREVIEW-DOMAIN/api/calendar/oauth/callback`
- `https://YOUR-PRODUCTION-DOMAIN/api/calendar/oauth/callback`
