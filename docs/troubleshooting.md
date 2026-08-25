# Troubleshooting

## I cannot sign in

- Use `/admin/login`, not the old PIN page.
- Confirm you were invited, or that your email is the owner bootstrap email.
- Check the email junk folder for magic links.
- If the link expired, request a new one.

## Dashboard says the database needs a migration

The SQL file in `supabase/migrations` has not been run on this Supabase project. Follow [admin-setup.md](admin-setup.md) step 1.

## Public website shows no events

That is normal until you add rows to the `events` table. It will not invent demo concerts.

## Invoice created in Stripe but not in the dashboard

The error message will include the Stripe invoice id. Tell the developer. Do not create a second invoice until that is fixed.

## Files will not upload

R2 keys or CORS are missing. In Cloudflare R2 → bucket → **Settings** → **CORS**, allow your site origin for PUT.

## I still see `/studio-green-room`

That address now redirects to `/admin`. Update any bookmarks.
