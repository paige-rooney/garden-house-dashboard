-- Booking policy update: 3-hour cowrites, 4-hour sessions, Mon-Sat 9am-6pm America/Chicago.

update public.session_types
set duration_minutes = 180,
    buffer_minutes = 30,
    description = 'Collaborative writing session'
where slug = 'cowrite';

insert into public.session_types (name, slug, duration_minutes, buffer_minutes, price_usd, description)
values ('4-hour session', 'session-4h', 240, 30, 0, 'Half-day studio session')
on conflict (slug) do update
set duration_minutes = excluded.duration_minutes,
    buffer_minutes = excluded.buffer_minutes,
    description = excluded.description,
    is_active = true;

delete from public.availability_rules;

insert into public.availability_rules (weekday, start_time, end_time, timezone, is_active)
select weekday, '09:00'::time, '18:00'::time, 'America/Chicago', true
from generate_series(1, 6) as weekday;
