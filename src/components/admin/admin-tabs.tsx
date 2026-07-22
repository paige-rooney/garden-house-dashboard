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
import { dashboardDemoData } from "@/lib/demo-data";
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
] as const;

type Tab = (typeof tabs)[number];

export function AdminTabs() {
  const [active, setActive] = useState<Tab>("Projects");
  const [data, setData] = useState<DashboardData>(dashboardDemoData);

  const refreshData = useCallback(async () => {
    const response = await fetch("/api/dashboard/data", { cache: "no-store" });
    if (!response.ok) return;
    const payload = (await response.json()) as DashboardData;
    setData(payload);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const response = await fetch("/api/dashboard/data", { cache: "no-store" });
      if (!response.ok || cancelled) return;
      const payload = (await response.json()) as DashboardData;
      if (cancelled) return;
      setData(payload);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const body = useMemo(() => {
    if (active === "Projects") return <ProjectsPanel data={data} onDataChanged={refreshData} />;
    if (active === "Client CRM") return <ClientsPanel data={data} onDataChanged={refreshData} />;
    if (active === "Payments") return <PaymentsPanel data={data} />;
    if (active === "Contracts") return <ContractsPanel />;
    if (active === "Monthly Revenue") return <RevenuePanel revenue={data.revenue} />;
    if (active === "Marketing") return <MarketingPanel />;
    if (active === "Calendar") return <CalendarPanel />;
    return <BrandKitPanel />;
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
      {body}
    </div>
  );
}
