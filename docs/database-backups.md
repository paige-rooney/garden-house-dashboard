# Database backups

Supabase already stores your data. Turn on backups you can restore.

## Daily (recommended)

1. Open the Garden House project on [supabase.com](https://supabase.com).
2. Go to **Project Settings** → **Database**.
3. Confirm **Point-in-time recovery** / backups are enabled on the paid plan you use.
4. If you are on a free plan, once a week: **Project Settings** → **Database** → download a backup, or use **SQL Editor** only for read-only exports with a developer.

## Before a risky change

Ask the developer to snapshot the project or duplicate it. Do not click **Reset database**.

## Recovery

1. In Supabase, open **Database** backups.
2. Restore the time from **before** the problem.
3. In Vercel, promote the last good deployment (see operations doc).
4. Sign in at `/admin/login` and confirm clients and invoices still appear.

Do not restore over a newer backup unless you understand you will lose later work.
