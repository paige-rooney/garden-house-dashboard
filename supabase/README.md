# Supabase schema

Use `schema_safe.sql` for clean installs through the Supabase SQL Editor. It
contains the explicit Data API grants required for tables created after
Supabase's October 2026 default change. `schema.sql` carries the same grant block
for compatibility with the original setup flow.

For an existing production database, apply `data_api_grants.sql` once. It only
restates the privileges production already received automatically.

Every future `public` table must include explicit grants in the same schema
change. Garden House accesses these tables only through trusted server routes,
so the schema grants table access only to `service_role`. SQL grants decide
whether a role can reach a table; RLS separately controls which rows it may
access.
