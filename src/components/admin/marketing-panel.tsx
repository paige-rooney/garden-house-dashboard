"use client";

import { useEffect, useState } from "react";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function MarketingPanel() {
  const [month, setMonth] = useState("Jan");
  const [notesByMonth, setNotesByMonth] = useState<Record<string, string>>({});

  useEffect(() => {
    const saved = localStorage.getItem("gh-marketing-notes");
    if (saved) setNotesByMonth(JSON.parse(saved));
  }, []);

  function update(value: string) {
    setNotesByMonth((prev) => {
      const next = { ...prev, [month]: value };
      localStorage.setItem("gh-marketing-notes", JSON.stringify(next));
      return next;
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl bg-brand-surface p-4 shadow-soft">
        <h3 className="mb-3 font-semibold">Social media planning</h3>
        <div className="mb-3 flex flex-wrap gap-2">
          {months.map((m) => (
            <button
              key={m}
              onClick={() => setMonth(m)}
              className={`rounded px-3 py-1 text-xs ${month === m ? "bg-brand-green text-white" : "bg-white text-brand-dark"}`}
            >
              {m}
            </button>
          ))}
        </div>
        <textarea
          className="h-48 w-full rounded-lg border border-brand-green/20 p-3"
          value={notesByMonth[month] ?? ""}
          onChange={(e) => update(e.target.value)}
          placeholder="Campaign ideas, reels plan, captions, and collab notes..."
        />
      </div>
      <div className="rounded-2xl bg-brand-surface p-4 shadow-soft">
        <h3 className="mb-3 font-semibold">Social media assets (R2)</h3>
        <p className="mb-3 text-sm text-brand-muted">
          Upload images/videos for reels and carousels. Files are stored in Cloudflare R2 via
          signed upload URLs.
        </p>
        <form action="/api/r2/sign" method="post" className="grid gap-2">
          <input
            name="filename"
            placeholder="example-reel-cover.jpg"
            className="rounded-lg border border-brand-green/20 px-3 py-2"
          />
          <button className="rounded-lg bg-brand-green px-3 py-2 text-sm text-white" type="submit">
            Request Upload URL
          </button>
        </form>
      </div>
    </div>
  );
}
