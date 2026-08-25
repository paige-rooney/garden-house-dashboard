"use client";

import { DashboardData } from "@/lib/types";

export function CalendarPanel({ data, onDataChanged }: { data: DashboardData; onDataChanged: () => Promise<void> }) {
  async function confirmBooking(id: string) {
    await fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "confirmed" }),
    });
    await onDataChanged();
  }
  async function cancelBooking(id: string) {
    if (!window.confirm("Cancel this booking?")) return;
    await fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "cancelled" }),
    });
    await onDataChanged();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl bg-brand-surface p-4 shadow-soft">
        <h3 className="mb-2 font-semibold">Studio calendar</h3>
        <p className="mb-3 text-sm text-brand-muted">
          Hours are Monday–Saturday, 9:00 a.m.–6:00 p.m. Chicago time. Session types: pre-production
          call, 3-hour, 4-hour, 6-hour, and 3-hour cowrite. Connect Google Calendar after you have the
          Google client ID. Bookings still save here and refuse overlapping times.
        </p>
        <a className="rounded bg-brand-green px-3 py-2 text-sm text-white" href="/api/calendar/oauth/start">
          Connect Google Calendar
        </a>
        <p className="mt-3 text-xs text-brand-muted">Public booking page: /book</p>
      </div>
      <div className="rounded-2xl bg-brand-surface p-4 shadow-soft">
        <h3 className="mb-3 font-semibold">Bookings</h3>
        {data.bookings.length === 0 && <p className="text-sm text-brand-muted">No bookings yet.</p>}
        <ul className="space-y-2 text-sm">
          {data.bookings.map((booking) => (
            <li key={booking.id} className="rounded-lg border border-brand-green/20 p-3">
              <p className="font-medium">{booking.guestName || "Guest"} · {booking.status}</p>
              <p className="text-xs text-brand-muted">{booking.startsAt} → {booking.endsAt}</p>
              <div className="mt-2 flex gap-2">
                {booking.status === "pending" && (
                  <button className="rounded bg-brand-green px-2 py-1 text-xs text-white" onClick={() => void confirmBooking(booking.id)}>Confirm</button>
                )}
                {booking.status !== "cancelled" && (
                  <button className="rounded border px-2 py-1 text-xs" onClick={() => void cancelBooking(booking.id)}>Cancel</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
