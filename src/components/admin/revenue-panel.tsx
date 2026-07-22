"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RevenuePoint } from "@/lib/types";

const views = ["monthly", "quarterly", "ytd", "oneYear", "fiveYear"] as const;
type View = (typeof views)[number];

type Props = {
  revenue: RevenuePoint[];
};

export function RevenuePanel({ revenue }: Props) {
  const [view, setView] = useState<View>("monthly");

  const data = useMemo(() => revenue.map((row) => ({ month: row.month, value: row[view] })), [view]);

  return (
    <div className="rounded-2xl bg-brand-surface p-4 shadow-soft">
      <h3 className="mb-3 font-semibold">Monthly Revenue</h3>
      <div className="mb-3 flex flex-wrap gap-2">
        {views.map((item) => (
          <button
            key={item}
            onClick={() => setView(item)}
            className={`rounded px-3 py-1 text-xs ${view === item ? "bg-brand-green text-white" : "bg-white text-brand-dark"}`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
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
