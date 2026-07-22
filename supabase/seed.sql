truncate table
  public.project_files,
  public.payments,
  public.invoices,
  public.contracts,
  public.projects,
  public.clients,
  public.events,
  public.mailing_list_subscribers,
  public.marketing_notes,
  public.marketing_assets,
  public.contract_templates
restart identity cascade;

insert into clients (id, name, email, phone, instagram, status, notes) values
  ('00000000-0000-0000-0000-000000000001', 'Maya Hill', 'maya@example.com', '615-555-1001', '@mayahillmusic', 'active', 'Launching single in July.'),
  ('00000000-0000-0000-0000-000000000002', 'Cedar Lane', 'cedar@example.com', '615-555-1002', '@cedarlanemusic', 'active', 'EP sequencing in progress.'),
  ('00000000-0000-0000-0000-000000000003', 'Knox Wilder', 'knox@example.com', '615-555-1003', '@knoxwilder', 'inactive', 'Wrapped album project in 2025.')
;

insert into projects (id, client_id, title, song_count, status, due_date, budget_usd, notes) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Bloom Single', 1, 'mixing', '2026-06-30', 1200, 'Awaiting vocal revision.'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Homegrown EP', 5, 'tracking', '2026-07-20', 4800, 'Drum edits underway.'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Southbound Album', 10, 'complete', '2025-12-01', 9800, 'Archive stems to R2.')
;

insert into invoices (id, project_id, client_id, amount_usd, status, due_date) values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 600, 'due', '2026-06-15'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 1600, 'plan', '2026-06-20'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 9800, 'paid', '2025-11-15')
;

insert into payments (id, invoice_id, stripe_payment_intent_id, amount_usd, status, paid_at) values
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', null, 300, 'pending', null),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', null, 800, 'pending', null),
  ('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'pi_demo_paid_1', 9800, 'paid', '2025-11-12T10:00:00Z')
;

insert into events (id, title, date, location, description) values
  ('30000000-0000-0000-0000-000000000001', 'Open Session Night', '2026-06-12', 'Garden House Studio', 'Community showcase and networking for local artists.'),
  ('30000000-0000-0000-0000-000000000002', 'Songwriting Circle', '2026-07-02', 'Garden House Studio', 'Cowrite format with rotating prompts and peer feedback.'),
  ('30000000-0000-0000-0000-000000000003', 'Mix Feedback Lab', '2026-08-16', 'Garden House Studio', 'Bring your rough mix for group critique and workflow tips.')
;

insert into contract_templates (name, body) values
  ('Single Song Production Agreement', 'Template content placeholder.'),
  ('EP Production + Mixing Agreement', 'Template content placeholder.'),
  ('Cowrite Collaboration Agreement', 'Template content placeholder.');
