# Admin setup (non-technical)

This gets the dashboard ready the first time. You do not need to use the terminal.

## 1. Run the database update in Supabase

1. Open [https://supabase.com](https://supabase.com) and sign in.
2. Open the **Garden House** project.
3. In the left sidebar click **SQL Editor**.
4. Click **New query**.
5. On your computer, open the project folder, then `supabase` → `migrations` → `20260824000000_production_foundation.sql`.
6. Select all of that file, copy it, paste it into the Supabase SQL box, and click **Run**.
7. If it succeeds, you will see a success message. If it errors, copy the error and send it to the developer.

## 2. Create your owner login

1. Open the dashboard sign-in page: `/admin/login`.
2. Use the owner email that was saved as `OWNER_BOOTSTRAP_EMAIL`.
3. Either set a password in Supabase → **Authentication** → **Users** → **Add user**, or use **Email me a link** on the sign-in page.
4. After you sign in once, you become the owner. Invite other staff from the **Staff** tab.

## 3. Connect the other accounts when you have them

Follow [integrations.md](integrations.md) for Stripe, Resend, Cloudflare R2, and Google Calendar.

Do **not** turn on Stripe live mode until you explicitly say to.

## 4. Hosting (Vercel)

1. Open [https://vercel.com](https://vercel.com) and sign in with GitHub.
2. Import `paige-rooney/garden-house-dashboard`.
3. In **Settings → Environment Variables**, add every name from `.env.example` (Preview and Production separately).
4. Paste the values from your password manager. Never put them in the GitHub repo.
5. Deploy.
6. After the live web address is known, update Stripe, Google, and Resend to use that address (see [deployment.md](deployment.md)).
