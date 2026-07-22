create extension if not exists pgcrypto;

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  instagram text,
  status text not null check (status in ('active', 'inactive')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  title text not null,
  song_count int not null default 1,
  status text not null check (status in ('tracking', 'mixing', 'mastering', 'complete')),
  due_date date,
  budget_usd numeric(10,2),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  file_name text not null,
  file_key text not null,
  file_type text,
  created_at timestamptz not null default now()
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  stripe_invoice_id text,
  amount_usd numeric(10,2) not null,
  status text not null check (status in ('paid', 'due', 'overdue', 'plan')),
  due_date date,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  stripe_payment_intent_id text,
  amount_usd numeric(10,2) not null,
  status text not null check (status in ('paid', 'pending', 'failed')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists contract_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  template_id uuid references contract_templates(id),
  status text not null default 'draft',
  signed_at timestamptz,
  sent_to text,
  created_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  location text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists mailing_list_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  recipient_group text not null,
  created_at timestamptz not null default now()
);

create table if not exists marketing_notes (
  id uuid primary key default gen_random_uuid(),
  month text not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists marketing_assets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  r2_key text not null,
  media_type text,
  created_at timestamptz not null default now()
);

create index if not exists idx_clients_status on clients(status);
create index if not exists idx_projects_client_id on projects(client_id);
create index if not exists idx_invoices_project_id on invoices(project_id);
create index if not exists idx_payments_invoice_id on payments(invoice_id);
create index if not exists idx_events_date on events(date);
