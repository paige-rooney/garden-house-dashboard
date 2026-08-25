# Admin setup (non-technical)

This gets the dashboard ready the first time. You do not need to use the terminal.

## 1. Run the database update in Supabase

1. Open [https://supabase.com](https://supabase.com) and sign in.
2. Open the **Garden House** project.
3. In the left sidebar click **SQL Editor**.
4. Click **New query**.
5. On your computer, open the project folder, then `supabase` → `migrations`.
6. Run **both** files, in this order, as separate queries (copy all of each file, paste, **Run**):
   - `20260824000000_production_foundation.sql`
   - `20260825000000_booking_hours_and_sessions.sql`
7. If it succeeds, you will see a success message. If it errors, copy the error and send it to the developer.

## 2. Create your owner login

1. Open the dashboard sign-in page: `/admin/login`.
2. Use **paige@gardenhouserecordingstudios.com**.
3. Either set a password in Supabase → **Authentication** → **Users** → **Add user**, or use **Email me a link** on the sign-in page.
4. After you sign in once, you become the owner. Invite other staff from the **Staff** tab.

## 3. Connect the other accounts when you have them

Follow [find-keys.md](find-keys.md) for Stripe test keys, Cloudflare R2 tokens, and Google Calendar. Follow [integrations.md](integrations.md) for how those keys are used.

Do **not** turn on Stripe live mode until you explicitly say to.

## 4. Hosting (Vercel)

1. Open [https://vercel.com](https://vercel.com) and sign in with GitHub.
2. Import `paige-rooney/garden-house-dashboard`.
3. In **Settings → Environment Variables**, add every name from `.env.example` (Preview and Production separately).
4. Paste the values from your password manager. Never put them in the GitHub repo.
5. Deploy.
6. After the live web address is known, update Stripe, Google, and Resend to use that address (see [deployment.md](deployment.md)).
