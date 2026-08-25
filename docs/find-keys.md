# How to find the remaining keys

Stripe does **not** have a page titled “Test”. Test mode is a **switch** at the top of the Stripe dashboard. If that switch is off, you will only see live keys. Leave it **on** until Paige explicitly approves live charges.

---

## Stripe test secret key

1. Open [https://dashboard.stripe.com](https://dashboard.stripe.com) and sign in.
2. Look at the **top-right** of the orange/gray bar. Find the switch labeled **Test mode**.
3. Turn **Test mode on**. The dashboard should look like a sandbox (often a purple or orange “Test data” notice).
4. Left sidebar → **Developers** (if you do not see it, click **More** first).
5. Click **API keys**.
6. In **Standard keys**, find **Secret key**.
7. Click **Reveal test key**.
8. Copy the value. It **must** start with `sk_test_`. If it starts with `sk_live_`, Test mode is still off — go back to step 2.
9. Paste it here in chat, or into Vercel later as `STRIPE_SECRET_KEY`. Do not put it in GitHub.

---

## Stripe test webhook secret

You can skip this until the site has a public preview address. When you have that address:

1. Stay in **Test mode** (same switch as above).
2. Left sidebar → **Developers** → **Webhooks**.
3. Click **Add endpoint**.
4. Endpoint URL: `https://YOUR-PREVIEW-DOMAIN/api/stripe/webhook` (I will give you the exact URL after Vercel is connected). For local testing we can use Stripe CLI later.
5. Under events, click **Select events** and add:
   - `invoice.paid`
   - `invoice.payment_failed`
   - `invoice.voided`
   - `charge.refunded`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
6. Click **Add endpoint**.
7. Open the endpoint you just created.
8. Click **Reveal** next to **Signing secret**.
9. Copy the value. It starts with `whsec_`.
10. That is `STRIPE_WEBHOOK_SECRET`.

If you only see “live” webhooks, Test mode is off.

---

## Cloudflare access key, secret, and public URL

You already have the **account ID**. The access key is **not** on the account overview. It is created as an **R2 API token**.

### Create the bucket (if you do not have one yet)

1. Open [https://dash.cloudflare.com](https://dash.cloudflare.com) and sign in.
2. Select the account that matches Garden House.
3. Left sidebar → **R2 Object Storage** (sometimes under **Storage & databases**).
4. If you see **Create bucket**, click it.
5. Bucket name: `gh-studio-assets`.
6. Leave location as default unless you have a preference. Create bucket.

### Create the access key and secret

1. Still on the **R2** home page (the list of buckets, not inside one file).
2. Click **API** in the top-right, or **Manage R2 API Tokens**.
3. Click **Create API token**.
4. Token name: `garden-house-dashboard`.
5. Permissions: **Object Read & Write**.
6. Apply to specific bucket: `gh-studio-assets` (or all buckets if you prefer).
7. Create the token.
8. Copy **Access Key ID** → that is `R2_ACCESS_KEY_ID`.
9. Copy **Secret Access Key** → that is `R2_SECRET_ACCESS_KEY`. Cloudflare only shows the secret once.

### Public URL

Private client files do **not** need to be public. For brand images that should be linkable:

1. Open the `gh-studio-assets` bucket.
2. Click **Settings**.
3. Under **Public access**, enable **Allow Access** (r2.dev subdomain is fine for now).
4. Copy the public bucket URL. It looks like `https://pub-something.r2.dev`.
5. That is `R2_PUBLIC_BASE_URL` (no trailing slash).

### CORS (needed so the browser can upload)

1. In the same bucket → **Settings** → **CORS Policy**.
2. Add this (you can change the production domain later):

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "http://127.0.0.1:3000"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

---

## Google Calendar client ID, secret, and calendar ID

### Calendar ID

1. Open [https://calendar.google.com](https://calendar.google.com) with the studio Google account.
2. On the left, find the calendar you want bookings to use (often “Garden House” or your main calendar).
3. Click the three dots next to that calendar → **Settings and sharing**.
4. Scroll to **Integrate calendar**.
5. Copy **Calendar ID**. It looks like an email address. That is `GOOGLE_CALENDAR_ID`. If you want the primary calendar, you can use `primary`.

### Client ID and secret

1. Open [https://console.cloud.google.com](https://console.cloud.google.com) with the same Google account.
2. Top bar project picker → **New project** → name `Garden House Dashboard` → Create.
3. Left menu → **APIs & Services** → **Library**.
4. Search **Google Calendar API** → open it → **Enable**.
5. Left menu → **APIs & Services** → **OAuth consent screen**.
6. If asked, choose **External** (or Internal if this is a Google Workspace).
7. App name: `Garden House`. User support email: `paige@gardenhouserecordingstudios.com`. Save.
8. On **Test users**, add `paige@gardenhouserecordingstudios.com` and `paige.rooney817@gmail.com`.
9. Left menu → **APIs & Services** → **Credentials** → **Create credentials** → **OAuth client ID**.
10. Application type: **Web application**. Name: `Garden House local`.
11. Under **Authorized redirect URIs**, click **Add URI** and enter exactly:
    `http://localhost:3000/api/calendar/oauth/callback`
12. Create.
13. Copy **Client ID** → `GOOGLE_CLIENT_ID`.
14. Copy **Client secret** → `GOOGLE_CLIENT_SECRET`.

We will add the Vercel preview/production redirect URLs after hosting is live.

---

## What I already saved locally (not in GitHub)

- Owner email, safe test inbox, Cloudflare account ID
- Stripe test secret key
- R2 access key, secret, and public bucket URL
- Google client ID, secret, and calendar ID

Still needed later: Stripe **test** webhook signing secret (after a public web address exists), then a one-time Google Calendar connect click in the admin Calendar tab.

Do not paste these keys into GitHub. If this chat is ever shared, rotate the Stripe, R2, and Google secrets.
