"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BrandKitPanel } from "@/components/admin/brand-kit-panel";
import { CalendarPanel } from "@/components/admin/calendar-panel";
import { ClientsPanel } from "@/components/admin/clients-panel";
import { ContractsPanel } from "@/components/admin/contracts-panel";
import { MarketingPanel } from "@/components/admin/marketing-panel";
import { PaymentsPanel } from "@/components/admin/payments-panel";
import { ProjectsPanel } from "@/components/admin/projects-panel";
import { RevenuePanel } from "@/components/admin/revenue-panel";
import { StaffPanel } from "@/components/admin/staff-panel";
import { DashboardData } from "@/lib/types";

const tabs = [
  "Projects",
  "Client CRM",
  "Payments",
  "Contracts",
  "Monthly Revenue",
  "Marketing",
  "Calendar",
  "Brand Kit",
  "Staff",
] as const;

type Tab = (typeof tabs)[number];

export function AdminTabs() {
  const [active, setActive] = useState<Tab>("Projects");
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    const response = await fetch("/api/dashboard/data", { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload.error || "Could not load dashboard data.");
      return;
    }
    setError(null);
    setData(payload as DashboardData);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      await refreshData();
      if (!cancelled) setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [refreshData]);

  const body = useMemo(() => {
    if (!data) return null;
    if (active === "Projects") return <ProjectsPanel data={data} onDataChanged={refreshData} />;
    if (active === "Client CRM") return <ClientsPanel data={data} onDataChanged={refreshData} />;
    if (active === "Payments") return <PaymentsPanel data={data} />;
    if (active === "Contracts") return <ContractsPanel data={data} onDataChanged={refreshData} />;
    if (active === "Monthly Revenue") return <RevenuePanel data={data} />;
    if (active === "Marketing") return <MarketingPanel data={data} onDataChanged={refreshData} />;
    if (active === "Calendar") return <CalendarPanel data={data} onDataChanged={refreshData} />;
    if (active === "Staff") return <StaffPanel />;
    return <BrandKitPanel data={data} onDataChanged={refreshData} />;
  }, [active, data, refreshData]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-2xl bg-brand-surface p-3 shadow-soft">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`rounded-lg px-3 py-2 text-sm ${active === tab ? "bg-brand-green text-white" : "bg-white text-brand-dark"}`}
          >
            {tab}
          </button>
        ))}
      </div>
      {loading && <p className="text-sm text-brand-muted">Loading studio data…</p>}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}
      {!loading && !error && data && body}
    </div>
  );
}
