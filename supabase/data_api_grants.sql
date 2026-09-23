-- Apply this file once to an existing Garden House Supabase project. It is
-- additive and records the server privileges the application depends on.
-- The same block is included in schema.sql and schema_safe.sql for clean installs.

grant select, insert, update, delete
on table
  public.clients,
  public.projects,
  public.project_files,
  public.invoices,
  public.payments,
  public.contract_templates,
  public.contracts,
  public.events,
  public.mailing_list_subscribers,
  public.marketing_notes,
  public.marketing_assets
to service_role;

notify pgrst, 'reload schema';
