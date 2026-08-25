-- Garden House production foundation
-- Safe for existing data: IF NOT EXISTS / ADD COLUMN IF NOT EXISTS / drop-and-readd checks.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.staff_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  role text not null check (role in ('owner', 'admin', 'staff')),
  status text not null default 'active' check (status in ('active', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.staff_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role text not null check (role in ('owner', 'admin', 'staff')),
  invited_by uuid references public.staff_profiles(id) on delete set null,
  accepted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now()
);

create unique index if not exists staff_invites_open_email
  on public.staff_invites (lower(email))
  where accepted_at is null;

alter table public.clients add column if not exists archived_at timestamptz;
alter table public.clients add column if not exists updated_at timestamptz not null default now();
alter table public.clients add column if not exists stripe_customer_id text;
alter table public.clients add column if not exists website text;
alter table public.clients add column if not exists socials jsonb not null default '{}'::jsonb;

alter table public.projects add column if not exists archived_at timestamptz;
alter table public.projects add column if not exists updated_at timestamptz not null default now();

create table if not exists public.project_status_history (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by uuid references public.staff_profiles(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

alter table public.project_files add column if not exists client_id uuid references public.clients(id) on delete cascade;
alter table public.project_files add column if not exists byte_size bigint;
alter table public.project_files add column if not exists mime_type text;
alter table public.project_files add column if not exists visibility text not null default 'private';
alter table public.project_files add column if not exists uploaded_by uuid references public.staff_profiles(id) on delete set null;
alter table public.project_files add column if not exists environment text not null default 'development';
alter table public.project_files add column if not exists purpose text not null default 'project';
alter table public.project_files add column if not exists updated_at timestamptz not null default now();

do $$
begin
  alter table public.invoices drop constraint if exists invoices_status_check;
exception
  when undefined_object then null;
end $$;

alter table public.invoices add column if not exists updated_at timestamptz not null default now();
alter table public.invoices add column if not exists hosted_invoice_url text;
alter table public.invoices add column if not exists payment_terms text;
alter table public.invoices add column if not exists description text;
alter table public.invoices add column if not exists stripe_status text;

alter table public.invoices
  add constraint invoices_status_check
  check (status in ('draft', 'due', 'paid', 'failed', 'overdue', 'void', 'refunded', 'plan'));

do $$
begin
  alter table public.payments drop constraint if exists payments_status_check;
exception
  when undefined_object then null;
end $$;

alter table public.payments add column if not exists updated_at timestamptz not null default now();
alter table public.payments add column if not exists stripe_charge_id text;
alter table public.payments add column if not exists kind text not null default 'payment';

alter table public.payments
  add constraint payments_status_check
  check (status in ('paid', 'pending', 'failed', 'refunded'));

alter table public.contract_templates add column if not exists updated_at timestamptz not null default now();
alter table public.contract_templates add column if not exists is_active boolean not null default true;
alter table public.contract_templates add column if not exists legal_disclaimer text;

alter table public.contracts add column if not exists client_id uuid references public.clients(id) on delete cascade;
alter table public.contracts add column if not exists updated_at timestamptz not null default now();
alter table public.contracts add column if not exists title text;
alter table public.contracts add column if not exists body text;
alter table public.contracts add column if not exists provider text not null default 'studio';
alter table public.contracts add column if not exists provider_id text;
alter table public.contracts add column if not exists sign_token_hash text unique;
alter table public.contracts add column if not exists signed_file_key text;
alter table public.contracts add column if not exists viewed_at timestamptz;
alter table public.contracts add column if not exists declined_at timestamptz;
alter table public.contracts add column if not exists expired_at timestamptz;
alter table public.contracts add column if not exists cancelled_at timestamptz;
alter table public.contracts add column if not exists reminder_sent_at timestamptz;

create table if not exists public.contract_activity (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  action text not null,
  actor_email text,
  detail text,
  created_at timestamptz not null default now()
);

create table if not exists public.session_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  duration_minutes int not null,
  buffer_minutes int not null default 30,
  price_usd numeric(10,2),
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  weekday int not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  timezone text not null default 'America/Chicago',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  session_type_id uuid references public.session_types(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  guest_name text,
  guest_email text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'rescheduled', 'completed')),
  google_event_id text,
  notes text,
  cancellation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status text not null default 'draft'
    check (status in ('draft', 'scheduled', 'posted', 'cancelled')),
  channel text not null default 'instagram',
  scheduled_date date,
  caption text,
  notes text,
  month text,
  created_by uuid references public.staff_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.marketing_notes add column if not exists updated_by uuid references public.staff_profiles(id) on delete set null;
alter table public.marketing_assets add column if not exists campaign_id uuid references public.marketing_campaigns(id) on delete set null;
alter table public.marketing_assets add column if not exists visibility text not null default 'private';
alter table public.marketing_assets add column if not exists byte_size bigint;
alter table public.marketing_assets add column if not exists mime_type text;
alter table public.marketing_assets add column if not exists updated_at timestamptz not null default now();

create table if not exists public.brand_assets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'other'
    check (category in ('logo', 'font', 'color', 'template', 'photo', 'video', 'document', 'other')),
  r2_key text not null,
  mime_type text,
  byte_size bigint,
  visibility text not null default 'private',
  version_label text,
  notes text,
  archived_at timestamptz,
  uploaded_by uuid references public.staff_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.staff_profiles(id) on delete set null,
  actor_email text,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null,
  event_type text,
  status text not null default 'processed',
  error text,
  created_at timestamptz not null default now(),
  unique (provider, event_id)
);

create table if not exists public.rate_limit_buckets (
  bucket_key text not null,
  window_start timestamptz not null,
  count int not null default 0,
  primary key (bucket_key, window_start)
);

create table if not exists public.email_deliveries (
  id uuid primary key default gen_random_uuid(),
  template_key text not null,
  to_email text not null,
  provider_id text,
  status text not null default 'sent',
  error text,
  dedupe_key text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.integration_accounts (
  id uuid primary key default gen_random_uuid(),
  provider text not null unique,
  account_email text,
  calendar_id text,
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  scopes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_clients_archived_at on public.clients (archived_at);
create index if not exists idx_projects_archived_at on public.projects (archived_at);
create index if not exists idx_project_status_history_project on public.project_status_history (project_id, created_at desc);
create index if not exists idx_bookings_range on public.bookings (starts_at, ends_at);
create index if not exists idx_audit_logs_created on public.audit_logs (created_at desc);
create index if not exists idx_contracts_client on public.contracts (client_id);
create index if not exists idx_marketing_campaigns_month on public.marketing_campaigns (month);

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at before update on public.invoices
for each row execute function public.set_updated_at();

drop trigger if exists staff_profiles_set_updated_at on public.staff_profiles;
create trigger staff_profiles_set_updated_at before update on public.staff_profiles
for each row execute function public.set_updated_at();

alter table public.staff_profiles enable row level security;
alter table public.staff_invites enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.project_status_history enable row level security;
alter table public.project_files enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.contract_templates enable row level security;
alter table public.contracts enable row level security;
alter table public.contract_activity enable row level security;
alter table public.events enable row level security;
alter table public.mailing_list_subscribers enable row level security;
alter table public.marketing_notes enable row level security;
alter table public.marketing_assets enable row level security;
alter table public.marketing_campaigns enable row level security;
alter table public.brand_assets enable row level security;
alter table public.audit_logs enable row level security;
alter table public.webhook_events enable row level security;
alter table public.rate_limit_buckets enable row level security;
alter table public.email_deliveries enable row level security;
alter table public.integration_accounts enable row level security;
alter table public.session_types enable row level security;
alter table public.availability_rules enable row level security;
alter table public.bookings enable row level security;

-- Browser clients use the anon key only for Auth. All CRM data goes through
-- server routes that use the service role after verifying a staff session.
-- No policies are granted to anon/authenticated for operational tables.

insert into public.session_types (name, slug, duration_minutes, buffer_minutes, price_usd, description)
values
  ('Pre-production call', 'pre-production-call', 30, 15, 0, 'Planning call before a session'),
  ('3-hour session', 'session-3h', 180, 30, 0, 'Standard studio session'),
  ('4-hour session', 'session-4h', 240, 30, 0, 'Half-day studio session'),
  ('6-hour session', 'session-6h', 360, 30, 0, 'Full-day tracking block'),
  ('Cowrite', 'cowrite', 180, 30, 0, 'Collaborative writing session')
on conflict (slug) do nothing;

insert into public.availability_rules (weekday, start_time, end_time, timezone)
select weekday, '09:00'::time, '18:00'::time, 'America/Chicago'
from generate_series(1, 6) as weekday
where not exists (select 1 from public.availability_rules);

insert into public.contract_templates (name, body, legal_disclaimer)
select
  'Single Song Production Agreement',
  'This production agreement is between Garden House Recording Studios and {{client_name}} ({{client_email}}) for the project "{{project_title}}".\n\nScope: studio production for {{song_count}} song(s).\nBudget: ${{budget_usd}}\nDue: {{due_date}}\n\nClient signature: {{signature}}\nDate: {{signed_date}}\n',
  'This template is an operational draft. Have an attorney review it before using it as a legally binding contract.'
where not exists (select 1 from public.contract_templates);

notify pgrst, 'reload schema';
