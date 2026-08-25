"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { addDateKeyDays, chicagoDateKey, shiftWeek, startOfWeekDateKey } from "@/lib/bookings/week-range";
import { DashboardData } from "@/lib/types";

type GoogleEvent = {
  id: string;
  title: string;
  startsAt: string | null;
  endsAt: string | null;
  allDay: boolean;
  htmlLink?: string | null;
  location?: string | null;
};

type WeekPayload = {
  connected: boolean;
  needsReconnect: boolean;
  calendarId: string | null;
  accountEmail: string | null;
  error: string | null;
  canReconnect: boolean;
  week: {
    mondayKey: string;
    sundayKey: string;
    label: string;
    days: { dateKey: string; weekday: string; dayNumber: string; isToday: boolean }[];
  };
  events: GoogleEvent[];
};

type CalendarItem = {
  id: string;
  title: string;
  timeLabel: string;
  sortKey: string;
  source: "google" | "booking";
  status?: string;
  href?: string | null;
};

function formatTime(iso: string | null, allDay: boolean) {
  if (!iso) return "";
  if (allDay || /^\d{4}-\d{2}-\d{2}$/.test(iso)) return "All day";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatBookingWhen(startsAt: string, endsAt: string) {
  const start = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(startsAt));
  return `${start} – ${formatTime(endsAt, false)} Chicago time`;
}

function eventDateKeys(event: GoogleEvent) {
  if (event.allDay && event.startsAt) {
    const start = event.startsAt.slice(0, 10);
    const endExclusive = event.endsAt?.slice(0, 10) ?? addDateKeyDays(start, 1);
    const keys: string[] = [];
    for (let key = start; key < endExclusive && keys.length < 14; key = addDateKeyDays(key, 1)) {
      keys.push(key);
    }
    return keys.length > 0 ? keys : [start];
  }
  if (!event.startsAt) return [];
  return [chicagoDateKey(new Date(event.startsAt))];
}

export function CalendarPanel({ data, onDataChanged }: { data: DashboardData; onDataChanged: () => Promise<void> }) {
  const [weekStart, setWeekStart] = useState(() => startOfWeekDateKey(new Date()));
  const [payload, setPayload] = useState<WeekPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState("");
  const [actionError, setActionError] = useState("");

  const loadWeek = useCallback(async (mondayKey: string) => {
    setLoading(true);
    const response = await fetch(`/api/calendar/events?week=${mondayKey}`, { cache: "no-store" });
    const next = (await response.json().catch(() => ({}))) as WeekPayload & { error?: string };
    if (!response.ok && !next.week) {
      setPayload(null);
      setActionError(next.error || "Could not load the calendar.");
      setLoading(false);
      return;
    }
    setPayload(next);
    setActionError("");
    setLoading(false);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("calendar") === "connected") {
      setBanner("Google Calendar is connected. Events for this week are below.");
    }
    if (params.get("calendar") === "error") {
      setBanner("Google Calendar could not finish connecting. Try Connect again.");
    }
  }, []);

  useEffect(() => {
    void loadWeek(weekStart);
  }, [loadWeek, weekStart]);

  async function confirmBooking(id: string) {
    setActionError("");
    const response = await fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "confirmed" }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setActionError(result.error || "Could not confirm that booking.");
      return;
    }
    await onDataChanged();
    await loadWeek(weekStart);
  }

  async function cancelBooking(id: string) {
    if (!window.confirm("Cancel this booking?")) return;
    setActionError("");
    const response = await fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "cancelled" }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setActionError(result.error || "Could not cancel that booking.");
      return;
    }
    await onDataChanged();
    await loadWeek(weekStart);
  }

  const itemsByDay = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    const sessionName = (sessionTypeId?: string | null) =>
      data.sessionTypes.find((type) => type.id === sessionTypeId)?.name ?? "Session";

    for (const booking of data.bookings) {
      if (booking.status === "cancelled") continue;
      const dateKey = chicagoDateKey(new Date(booking.startsAt));
      const list = map.get(dateKey) ?? [];
      list.push({
        id: `booking-${booking.id}`,
        title: `${sessionName(booking.sessionTypeId)} · ${booking.guestName || "Guest"}`,
        timeLabel: formatTime(booking.startsAt, false),
        sortKey: booking.startsAt,
        source: "booking",
        status: booking.status,
      });
      map.set(dateKey, list);
    }

    const bookingEventIds = new Set(
      data.bookings.map((booking) => booking.googleEventId).filter((id): id is string => Boolean(id)),
    );
    for (const event of payload?.events ?? []) {
      if (bookingEventIds.has(event.id)) continue;
      for (const dateKey of eventDateKeys(event)) {
        const list = map.get(dateKey) ?? [];
        list.push({
          id: `google-${event.id}-${dateKey}`,
          title: event.title,
          timeLabel: formatTime(event.startsAt, event.allDay),
          sortKey: event.startsAt ?? dateKey,
          source: "google",
          href: event.htmlLink,
        });
        map.set(dateKey, list);
      }
    }

    for (const [key, list] of map) {
      list.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
      map.set(key, list);
    }
    return map;
  }, [data.bookings, data.sessionTypes, payload?.events]);

  const weekDays = payload?.week.days;
  const connected = Boolean(payload?.connected);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-brand-surface p-4 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="mb-1 font-semibold">Studio calendar</h3>
            <p className="text-sm text-brand-muted">
              Hours are Monday–Saturday, 9:00 a.m.–6:00 p.m. Chicago time. This week shows Google
              Calendar events plus Garden House bookings.
            </p>
            {connected && (
              <p className="mt-2 text-sm text-brand-green">
                Connected
                {payload?.accountEmail || payload?.calendarId
                  ? ` · ${payload.accountEmail || payload.calendarId}`
                  : "."}
              </p>
            )}
            {payload?.needsReconnect && (
              <p className="mt-2 text-sm text-red-700">
                {payload.error || "Google Calendar needs to be connected again."}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {!loading && payload?.canReconnect && (!connected || payload.needsReconnect) && (
              <a className="rounded bg-brand-green px-3 py-2 text-sm text-white" href="/api/calendar/oauth/start">
                {payload.needsReconnect ? "Reconnect Google Calendar" : "Connect Google Calendar"}
              </a>
            )}
            {connected && payload?.canReconnect && !payload.needsReconnect && (
              <a className="rounded border border-brand-green/30 px-3 py-2 text-sm" href="/api/calendar/oauth/start">
                Reconnect
              </a>
            )}
            <a
              className="rounded border border-brand-green/30 px-3 py-2 text-sm"
              href="https://calendar.google.com"
              target="_blank"
              rel="noreferrer"
            >
              Open Google Calendar
            </a>
          </div>
        </div>
        <p className="mt-3 text-xs text-brand-muted">Public booking page: /book</p>
        {banner && <p className="mt-3 text-sm text-brand-green">{banner}</p>}
        {actionError && <p className="mt-3 text-sm text-red-700">{actionError}</p>}
        {payload?.error && connected === false && !payload.needsReconnect && (
          <p className="mt-3 text-sm text-red-700">{payload.error}</p>
        )}
      </div>

      <div className="rounded-2xl bg-brand-surface p-4 shadow-soft">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              className="rounded border px-3 py-1 text-sm"
              type="button"
              onClick={() => setWeekStart((current) => shiftWeek(current, -1))}
            >
              Previous week
            </button>
            <button
              className="rounded border px-3 py-1 text-sm"
              type="button"
              onClick={() => setWeekStart(startOfWeekDateKey(new Date()))}
            >
              This week
            </button>
            <button
              className="rounded border px-3 py-1 text-sm"
              type="button"
              onClick={() => setWeekStart((current) => shiftWeek(current, 1))}
            >
              Next week
            </button>
          </div>
          <p className="text-sm font-medium">{payload?.week.label ?? "This week"}</p>
        </div>
        {loading && <p className="text-sm text-brand-muted">Loading this week…</p>}
        {weekDays && (
          <div className="grid gap-2 md:grid-cols-7">
            {weekDays.map((day) => {
              const items = itemsByDay.get(day.dateKey) ?? [];
              return (
                <section
                  key={day.dateKey}
                  className={`min-h-40 rounded-xl border p-2 ${
                    day.isToday ? "border-brand-green bg-white" : "border-brand-green/15 bg-white/60"
                  }`}
                >
                  <header className="mb-2 flex items-baseline justify-between">
                    <span className="text-xs font-medium uppercase text-brand-muted">{day.weekday}</span>
                    <span className={`text-sm ${day.isToday ? "font-semibold text-brand-green" : ""}`}>
                      {day.dayNumber}
                    </span>
                  </header>
                  {items.length === 0 && <p className="text-xs text-brand-muted">No events</p>}
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li
                        key={item.id}
                        className={`rounded-lg border px-2 py-1 text-xs ${
                          item.source === "booking"
                            ? item.status === "pending"
                              ? "border-amber-300 bg-amber-50"
                              : "border-brand-green/40 bg-brand-green/10"
                            : "border-brand-green/20 bg-white"
                        }`}
                      >
                        <p className="font-medium text-brand-dark">{item.timeLabel}</p>
                        {item.href ? (
                          <a className="underline" href={item.href} target="_blank" rel="noreferrer">
                            {item.title}
                          </a>
                        ) : (
                          <p>{item.title}</p>
                        )}
                        {item.source === "booking" && item.status && (
                          <p className="mt-1 capitalize text-brand-muted">{item.status}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-brand-surface p-4 shadow-soft">
        <h3 className="mb-3 font-semibold">Booking requests</h3>
        {data.bookings.filter((booking) => booking.status !== "cancelled").length === 0 && (
          <p className="text-sm text-brand-muted">No bookings yet. New requests from /book appear here.</p>
        )}
        <ul className="space-y-2 text-sm">
          {data.bookings
            .filter((booking) => booking.status !== "cancelled")
            .map((booking) => (
              <li key={booking.id} className="rounded-lg border border-brand-green/20 p-3">
                <p className="font-medium">
                  {booking.guestName || "Guest"} · {booking.status}
                </p>
                <p className="text-xs text-brand-muted">{formatBookingWhen(booking.startsAt, booking.endsAt)}</p>
                <div className="mt-2 flex gap-2">
                  {booking.status === "pending" && (
                    <button
                      className="rounded bg-brand-green px-2 py-1 text-xs text-white"
                      onClick={() => void confirmBooking(booking.id)}
                    >
                      Confirm
                    </button>
                  )}
                  {booking.status !== "cancelled" && (
                    <button className="rounded border px-2 py-1 text-xs" onClick={() => void cancelBooking(booking.id)}>
                      Cancel
                    </button>
                  )}
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
