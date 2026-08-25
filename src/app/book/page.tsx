"use client";

import { FormEvent, useEffect, useState } from "react";

type SessionType = { id: string; name: string; duration_minutes: number };

export default function BookPage() {
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [sessionTypeId, setSessionTypeId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    void fetch("/api/bookings/public")
      .then((response) => response.json())
      .then((payload) => {
        setSessionTypes(payload.sessionTypes ?? []);
        setSessionTypeId(payload.sessionTypes?.[0]?.id ?? "");
      });
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/bookings/public", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionTypeId,
        startsAt: new Date(startsAt).toISOString(),
        guestName,
        guestEmail,
      }),
    });
    const payload = await response.json();
    setMessage(payload.error || "Request received. Garden House will confirm by email.");
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-2xl font-semibold">Book Garden House</h1>
      <p className="mt-2 text-sm text-brand-muted">
        Brentwood, TN. Monday–Saturday, 9:00 a.m.–6:00 p.m. America/Chicago. Staff confirm every request
        before it is locked in.
      </p>
      <form className="mt-6 grid gap-3 rounded-2xl bg-brand-surface p-6 shadow-soft" onSubmit={onSubmit}>
        <select required value={sessionTypeId} onChange={(e) => setSessionTypeId(e.target.value)} className="rounded-lg border border-brand-green/20 px-3 py-2">
          {sessionTypes.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <input required type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="rounded-lg border border-brand-green/20 px-3 py-2" />
        <input required placeholder="Your name" value={guestName} onChange={(e) => setGuestName(e.target.value)} className="rounded-lg border border-brand-green/20 px-3 py-2" />
        <input required type="email" placeholder="Email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className="rounded-lg border border-brand-green/20 px-3 py-2" />
        <button className="rounded-lg bg-brand-green px-4 py-2 text-white" type="submit">Request booking</button>
        {message && <p className="text-sm text-brand-muted">{message}</p>}
      </form>
    </main>
  );
}
