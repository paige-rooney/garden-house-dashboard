"use client";

import { FormEvent, useMemo, useState } from "react";
import { FileUploader } from "@/components/admin/file-uploader";
import { DashboardData } from "@/lib/types";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function MarketingPanel({ data, onDataChanged }: { data: DashboardData; onDataChanged: () => Promise<void> }) {
  const [month, setMonth] = useState(months[new Date().getMonth()]);
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [channel, setChannel] = useState("instagram");
  const [message, setMessage] = useState("");

  const campaigns = useMemo(
    () =>
      data.campaigns.filter((campaign) => {
        const matchMonth = !campaign.month || campaign.month === month;
        const haystack = `${campaign.title} ${campaign.caption ?? ""} ${campaign.notes ?? ""}`.toLowerCase();
        return matchMonth && haystack.includes(query.toLowerCase());
      }),
    [data.campaigns, month, query],
  );

  async function createCampaign(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/marketing/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, caption, channel, month, status: "draft" }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(payload.error || "Could not save.");
      return;
    }
    setTitle("");
    setCaption("");
    setMessage("Saved to the shared studio plan.");
    await onDataChanged();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl bg-brand-surface p-4 shadow-soft">
        <h3 className="mb-3 font-semibold">Shared monthly planning</h3>
        <div className="mb-3 flex flex-wrap gap-2">
          {months.map((item) => (
            <button key={item} onClick={() => setMonth(item)} className={`rounded px-3 py-1 text-xs ${month === item ? "bg-brand-green text-white" : "bg-white"}`}>
              {item}
            </button>
          ))}
        </div>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search campaigns" className="mb-3 w-full rounded-lg border border-brand-green/20 px-3 py-2 text-sm" />
        {campaigns.length === 0 && <p className="text-sm text-brand-muted">No campaigns for this month yet.</p>}
        <ul className="space-y-2 text-sm">
          {campaigns.map((campaign) => (
            <li key={campaign.id} className="rounded-lg border border-brand-green/20 p-3">
              <p className="font-medium">{campaign.title}</p>
              <p className="text-xs text-brand-muted">{campaign.channel} · {campaign.status}</p>
              {campaign.caption && <p className="mt-1 text-xs">{campaign.caption}</p>}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl bg-brand-surface p-4 shadow-soft">
        <h3 className="mb-3 font-semibold">New campaign</h3>
        <form className="grid gap-2" onSubmit={createCampaign}>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Campaign title" className="rounded-lg border border-brand-green/20 px-3 py-2 text-sm" />
          <select value={channel} onChange={(e) => setChannel(e.target.value)} className="rounded-lg border border-brand-green/20 px-3 py-2 text-sm">
            <option value="instagram">Instagram</option>
            <option value="email">Email</option>
            <option value="in-studio">In studio</option>
          </select>
          <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption / notes" className="h-28 rounded-lg border border-brand-green/20 p-2 text-sm" />
          <button className="rounded bg-brand-green px-3 py-2 text-sm text-white" type="submit">Save to database</button>
        </form>
        {message && <p className="mt-2 text-xs text-brand-green">{message}</p>}
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium">Upload a marketing asset</p>
          <FileUploader purpose="marketing" onUploaded={onDataChanged} />
        </div>
      </div>
    </div>
  );
}
