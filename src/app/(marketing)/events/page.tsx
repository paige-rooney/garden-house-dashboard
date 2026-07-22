"use client";

import { useEffect, useState } from "react";
import { TopNav } from "@/components/marketing/top-nav";
import { events } from "@/lib/demo-data";
import { EventItem } from "@/lib/types";

export default function EventsPage() {
  const [window, setWindow] = useState<"month" | "threeMonths">("month");
  const [list, setList] = useState<EventItem[]>(events);
  const [email, setEmail] = useState("");
  const [recipientGroup, setRecipientGroup] = useState("all-events");
  const [state, setState] = useState("idle");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const response = await fetch(`/api/events/list?window=${window}`, { cache: "no-store" });
      if (!response.ok || cancelled) return;
      const payload = (await response.json()) as { events: EventItem[] };
      if (!cancelled && Array.isArray(payload.events)) setList(payload.events);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [window]);

  async function subscribe() {
    setState("loading");
    const response = await fetch("/api/events/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, recipientGroup }),
    });
    setState(response.ok ? "ok" : "error");
    if (response.ok) setEmail("");
  }

  return (
    <div>
      <TopNav />
      <main className="mx-auto grid max-w-5xl gap-6 px-6 py-8">
        <section className="rounded-2xl bg-brand-surface p-6 shadow-soft">
          <h1 className="text-2xl font-semibold">Events</h1>
          <div className="mt-3 flex gap-2">
            <button
              className={`rounded px-3 py-1 text-sm ${window === "month" ? "bg-brand-green text-white" : "bg-white"}`}
              onClick={() => setWindow("month")}
            >
              Next month
            </button>
            <button
              className={`rounded px-3 py-1 text-sm ${window === "threeMonths" ? "bg-brand-green text-white" : "bg-white"}`}
              onClick={() => setWindow("threeMonths")}
            >
              Next 3 months
            </button>
          </div>
          <ul className="mt-4 grid gap-3">
            {list.map((event) => (
              <li key={event.id} className="rounded-lg border border-brand-green/20 p-3">
                <p className="font-medium">{event.title}</p>
                <p className="text-sm text-brand-muted">
                  {event.dateIso} - {event.location}
                </p>
                <p className="text-sm text-brand-muted">{event.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl bg-brand-surface p-6 shadow-soft">
          <h2 className="text-xl font-semibold">Join event mailing list</h2>
          <p className="mt-1 text-sm text-brand-muted">
            Pick the email audience you want updates from.
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-[2fr_1fr_auto]">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="rounded-lg border border-brand-green/20 px-3 py-2"
            />
            <select
              value={recipientGroup}
              onChange={(e) => setRecipientGroup(e.target.value)}
              className="rounded-lg border border-brand-green/20 px-3 py-2"
            >
              <option value="all-events">All events</option>
              <option value="community-only">Community only</option>
              <option value="workshops-only">Workshops only</option>
            </select>
            <button
              onClick={subscribe}
              className="rounded-lg bg-brand-green px-4 py-2 text-sm font-medium text-white"
            >
              Subscribe
            </button>
          </div>
          {state === "ok" && <p className="mt-2 text-sm text-brand-green">Subscribed.</p>}
          {state === "error" && <p className="mt-2 text-sm text-red-600">Could not subscribe.</p>}
        </section>
      </main>
    </div>
  );
}
