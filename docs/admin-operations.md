# Day-to-day operations

Sign in at `/admin/login` with your own email. Then use the tabs at the top.

## Invite staff

1. Open **Staff**.
2. Type their email, choose **staff**, **admin**, or **owner**, and click **Invite**.
3. They sign in at `/admin/login`.
4. Only an **owner** can invite.

## Reset access

1. Ask the person to use **Use a magic link instead** on the sign-in page.
2. Or in Supabase → Authentication → Users, choose the user → **Send password recovery**.
3. To disable someone, an owner must mark their staff profile as disabled in the database (ask the developer) — do not share passwords.

## Add clients and projects

1. Open **Client CRM** to add a person (name, email, phone, Instagram, notes).
2. Open **Projects**, pick the client, and create a project (title, songs, due date, budget).
3. Use **Archive** only when you are sure. Archived records leave the main list.

## Send invoices

1. Open the project.
2. Type the amount in USD and click **Create Stripe invoice**.
3. Stripe emails the client if test/live email is configured.
4. Use **Open Stripe** / **Open hosted invoice** to see the payment page.
5. Stay in **test mode** until live payments are approved.

## Manage contracts

1. Open **Contracts**.
2. Pick a template and project.
3. Click **Send to client email**. It always uses the email stored on the client, never a hardcoded inbox.
4. The client opens the signing link, types their name, and signs.
5. Treat templates as drafts until an attorney reviews them.

## Manage files

1. On a client or project, use the file picker.
2. Wait for the progress bar and the “Uploaded” message.
3. Click a file name to download (the link expires quickly on purpose).

## Manage bookings

1. Share `/book` for public requests.
2. In **Calendar**, **Confirm** or **Cancel**.
3. The system refuses overlapping times.
4. Google Calendar sync starts after you click **Connect Google Calendar** (owner) and finish Google’s permission screen.

## Read revenue

1. Open **Monthly Revenue**.
2. Numbers come from **successful payments**, not due dates.
3. Click **Download CSV** for a spreadsheet.

## Recognize integration failures

| What you see | What it usually means | Who to contact |
| --- | --- | --- |
| “Database is not connected” / migration message | Supabase SQL not run, or keys missing | Developer, then [supabase.com](https://supabase.com) |
| Stripe invoice error about keys | Stripe test key missing | [dashboard.stripe.com](https://dashboard.stripe.com) |
| File upload asks for R2 | Cloudflare storage keys missing | [dash.cloudflare.com](https://dash.cloudflare.com) |
| Email could not send | Resend domain or key | [resend.com](https://resend.com) |
| Google connect error | OAuth client not created | [console.cloud.google.com](https://console.cloud.google.com) |

## Roll back a failed deployment (Vercel)

1. Open the Garden House project on Vercel.
2. Click **Deployments**.
3. Find the last deployment that worked.
4. Click the **⋯** menu → **Promote to Production**.
5. Tell the developer so the database is not left in a mixed state.
