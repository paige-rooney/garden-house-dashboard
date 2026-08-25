"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DashboardData } from "@/lib/types";

const views = ["monthly", "quarterly", "ytd", "oneYear", "fiveYear"] as const;
type View = (typeof views)[number];

export function RevenuePanel({ data }: { data: DashboardData }) {
  const [view, setView] = useState<View>("monthly");
  const chart = useMemo(() => data.revenue.map((row) => ({ month: row.month, value: row[view] })), [data.revenue, view]);
  const paidTotal = data.payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amountUsd, 0);

  return (
    <div className="rounded-2xl bg-brand-surface p-4 shadow-soft">
      <h3 className="mb-1 font-semibold">Revenue from successful payments</h3>
      <p className="mb-3 text-sm text-brand-muted">
        Charts use paid payment dates, not invoice due dates. Paid total: ${paidTotal.toLocaleString()}.
      </p>
      <div className="mb-3 flex flex-wrap gap-2">
        {views.map((item) => (
          <button key={item} onClick={() => setView(item)} className={`rounded px-3 py-1 text-xs ${view === item ? "bg-brand-green text-white" : "bg-white text-brand-dark"}`}>
            {item}
          </button>
        ))}
        <a className="rounded bg-white px-3 py-1 text-xs underline" href="/api/dashboard/revenue?format=csv">
          Download CSV
        </a>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chart}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#284D2D" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
