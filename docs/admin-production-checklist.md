# Garden House Admin — Production Checklist

This file tracks implementation of the production admin dashboard.

## Baseline (2026-08-24)

- [x] Repository confirmed: `https://github.com/paige-rooney/garden-house-dashboard.git`
- [x] Working branch: `cursor/production-admin-dashboard`
- [x] pnpm lockfile install, typecheck, lint, production build
- [x] Public website and admin login visually checked
- [x] Unit tests and Playwright auth tests passing

## Phase 1 — Authentication and security

- [x] Replace PIN with Supabase Auth (password + magic link)
- [x] Roles: owner, admin, staff
- [x] Protect admin pages and privileged APIs with session + role
- [x] Logout and expired-session redirect
- [x] Remove hardcoded PIN fallback (`/api/auth/pin` now returns 410)
- [x] Debug schema locked unless `ALLOW_DEBUG_ENDPOINTS` and owner
- [x] CSRF origin checks on mutations
- [x] Durable rate limiting table with memory fallback
- [x] Security headers
- [x] Zod on request bodies
- [x] Audit log writes
- [x] Service-role server-side only
- [x] Tests: unauthenticated users cannot access admin/APIs
- [x] `/admin` with redirects from `/studio-green-room`

## Phase 2 — Database

- [x] Versioned migration `supabase/migrations/20260824000000_production_foundation.sql`
- [x] Staff, CRM extensions, files, contracts, bookings, marketing, brand, audit, webhooks, rate limits
- [x] RLS enabled (no public table access)
- [x] Fictional `supabase/seed_dev.sql`
- [x] No silent demo CRM data
- [x] Backup instructions in `docs/database-backups.md`
- [ ] **You still need to run the SQL file in the Supabase SQL Editor**

## Phase 3 — CRM and projects

- [x] Create, edit, archive, search, filter
- [x] Projects with status history, files, invoices, contracts
- [x] Loading, errors, empty states, confirmations

## Phase 4 — Cloudflare R2

- [x] Signed uploads, progress, sanitization, MIME/size limits
- [x] Metadata in Supabase, namespaced keys
- [x] CORS documented
- [x] Cloudflare account ID, access key, secret, and public bucket URL saved locally (not in GitHub)

## Phase 5 — Stripe (test mode)

- [x] Invoice create, webhook sync, idempotency, refund/void handling
- [x] Revenue from successful payments + CSV
- [x] Stay in test mode
- [x] Stripe test secret key saved locally (must start with `sk_test_`)
- [ ] Stripe test webhook secret after a public preview URL exists

## Phase 6 — Contracts

- [x] Templates, merge fields, send to CRM email, signing page, activity
- [x] Legal disclaimer
- [x] Dropbox Sign not subscribed (built-in signing used)

## Phase 7 — Resend

- [x] Contact, contracts, bookings use logged transactional send
- [x] Dev redirect via `EMAIL_SAFE_RECIPIENT` (`paige.rooney817@gmail.com` saved locally)

## Phase 8 — Marketing and brand kit

- [x] Campaigns in Supabase (not localStorage)
- [x] Brand kit gallery wired to R2 uploads

## Phase 9 — Google Calendar and bookings

- [x] Hours: Monday–Saturday 9:00 a.m.–6:00 p.m. Chicago time
- [x] Session types: pre-production, 3h, 4h, 6h, 3h cowrite
- [x] Public `/book`, overlap + hours checks, confirm/cancel emails
- [x] OAuth start/callback with encrypted token storage
- [x] No minimum notice yet (deferred)
- [x] No payment plans
- [x] No social auto-posting
- [x] Google client ID, secret, and calendar ID saved locally
- [ ] Connect Google from the admin Calendar tab (OAuth click-through) after SQL is run

## Phase 10 — Production quality and deployment

- [x] Unit + e2e tests, error boundaries, health check, docs
- [x] `.env.example` updated (no secrets)
- [ ] Vercel preview after GitHub push
- [ ] Staging walkthrough after you run the SQL migration and add missing keys
