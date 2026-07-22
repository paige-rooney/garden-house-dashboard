export function CalendarPanel() {
  return (
    <div className="rounded-2xl bg-brand-surface p-4 shadow-soft">
      <h3 className="mb-2 font-semibold">Calendar (Planned)</h3>
      <p className="text-sm text-brand-muted">
        Future scope: private booking link like Calendly with pre-production calls, 3-hour
        sessions, 6-hour sessions, and cowrites.
      </p>
      <p className="mt-2 text-sm text-brand-muted">
        OAuth with Google Calendar will be designed in a later phase.
      </p>
    </div>
  );
}
