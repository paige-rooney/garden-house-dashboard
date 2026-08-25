# Deployment

## Environments

| Environment | App setting | Stripe | Email |
| --- | --- | --- | --- |
| Local | `APP_ENV=development` | test | redirect to safe inbox |
| Vercel Preview | `APP_ENV=preview` | test | redirect to safe inbox |
| Vercel Production | `APP_ENV=production` | test until approved | real recipients only after approval |

## Vercel

1. Import the GitHub repo.
2. Add environment variables for **Preview** and **Production** from `.env.example` (names only in git).
3. Deploy the `cursor/production-admin-dashboard` branch as a preview first.
4. Walk through sign-in, a fake client, a test invoice, a test contract, and a booking request.
5. Production domain: set `NEXT_PUBLIC_SITE_URL` to that domain.
6. Update Stripe webhook, Google redirect, Resend domain, and R2 CORS to match.

## Database

Run `supabase/migrations/20260824000000_production_foundation.sql` on the project **before** sending staff to production.

Create the owner by signing in with `OWNER_BOOTSTRAP_EMAIL`.

## Go-live sequence (after preview is good)

1. Keep Stripe in test mode.
2. Confirm Resend domain records.
3. Confirm R2 CORS.
4. Confirm Google redirect URLs.
5. Invite staff.
6. Only then, if you explicitly approve it, switch Stripe, email, contracts, and bookings to live sending.
