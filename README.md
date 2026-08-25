# Garden House Dashboard

Public website and staff operations dashboard for Garden House Recording Studios.

## What this app does

- Public site: home, story, services, events, contact, booking request
- Staff dashboard at `/admin`: clients, projects, files, Stripe invoices, contracts, marketing, brand kit, calendar, staff invites
- Individual staff sign-in (no shared PIN)

## Local setup

1. Install [Node.js](https://nodejs.org/) 20+ and [pnpm](https://pnpm.io/).
2. Copy `.env.example` to `.env.local` and fill in values. Never put secrets in git.
3. In Supabase → SQL Editor, run both files in `supabase/migrations/` in date order.
4. `pnpm install`
5. `pnpm dev`
6. Open http://127.0.0.1:3000 for the public site and http://127.0.0.1:3000/admin/login for staff.

The old address `/studio-green-room` now sends you to `/admin/login`.

## Commands

- `pnpm dev` — local site
- `pnpm typecheck` — TypeScript
- `pnpm lint` — lint
- `pnpm test` — unit tests
- `pnpm test:e2e` — browser tests
- `pnpm build` — production build

## Docs

- [Admin setup](docs/admin-setup.md)
- [Day-to-day operations](docs/admin-operations.md)
- [Integrations](docs/integrations.md)
- [Deployment](docs/deployment.md)
- [Database backups](docs/database-backups.md)
- [Troubleshooting](docs/troubleshooting.md)
- [How to find remaining keys](docs/find-keys.md)
- [Production checklist](docs/admin-production-checklist.md)
