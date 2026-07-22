import { dashboardDemoData } from "@/lib/demo-data";
import { getSupabaseServiceClient } from "@/lib/integrations/supabase";
import { DashboardData, RevenuePoint } from "@/lib/types";

function buildRevenueFromInvoices(
  rows: Array<{ amount_usd: number | string | null; due_date: string | null }>,
): RevenuePoint[] {
  const now = new Date();
  const year = now.getFullYear();
  const monthTotals = Array.from({ length: 12 }, () => 0);

  for (const row of rows) {
    if (!row.due_date) continue;
    const date = new Date(row.due_date);
    if (Number.isNaN(date.getTime()) || date.getFullYear() !== year) continue;
    const amount = Number(row.amount_usd ?? 0);
    monthTotals[date.getMonth()] += Number.isFinite(amount) ? amount : 0;
  }

  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let ytd = 0;
  let fiveYear = 0;

  return labels.map((month, idx) => {
    const monthly = monthTotals[idx];
    ytd += monthly;
    fiveYear += monthly;
    const quarterStart = Math.floor(idx / 3) * 3;
    const quarterly = monthTotals.slice(quarterStart, idx + 1).reduce((sum, val) => sum + val, 0);

    return {
      month,
      monthly,
      quarterly,
      ytd,
      oneYear: ytd,
      fiveYear,
    };
  });
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return dashboardDemoData;

  const [clientsResult, projectsResult, invoicesResult, paymentsResult, eventsResult] = await Promise.all([
    supabase.from("clients").select("*").order("created_at", { ascending: false }),
    supabase.from("projects").select("*").order("created_at", { ascending: false }),
    supabase.from("invoices").select("*").order("created_at", { ascending: false }),
    supabase.from("payments").select("*").order("created_at", { ascending: false }),
    supabase.from("events").select("*").order("date", { ascending: true }),
  ]);

  if (
    clientsResult.error ||
    projectsResult.error ||
    invoicesResult.error ||
    paymentsResult.error ||
    eventsResult.error
  ) {
    return dashboardDemoData;
  }

  const clients = clientsResult.data.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? "",
    instagram: row.instagram ?? undefined,
    status: row.status,
    notes: row.notes ?? "",
  }));

  const projects = projectsResult.data.map((row) => ({
    id: row.id,
    clientId: row.client_id,
    title: row.title,
    songCount: row.song_count ?? 1,
    status: row.status,
    dueDate: row.due_date ?? "",
    budgetUsd: Number(row.budget_usd ?? 0),
    notes: row.notes ?? "",
  }));

  const invoices = invoicesResult.data.map((row) => ({
    id: row.id,
    clientId: row.client_id,
    projectId: row.project_id,
    amountUsd: Number(row.amount_usd ?? 0),
    status: row.status,
    dueDate: row.due_date ?? "",
  }));

  const payments = paymentsResult.data.map((row) => ({
    id: row.id,
    invoiceId: row.invoice_id,
    amountUsd: Number(row.amount_usd ?? 0),
    status: row.status,
    paidAt: row.paid_at ?? null,
  }));

  const events = eventsResult.data.map((row) => ({
    id: row.id,
    title: row.title,
    dateIso: row.date,
    location: row.location,
    description: row.description ?? "",
  }));

  const revenue = buildRevenueFromInvoices(
    invoicesResult.data.map((row) => ({ amount_usd: row.amount_usd, due_date: row.due_date })),
  );

  return {
    clients,
    projects,
    invoices,
    payments,
    events,
    revenue: revenue.some((point) => point.monthly > 0) ? revenue : dashboardDemoData.revenue,
  };
}

export async function getUpcomingEvents(window: "month" | "threeMonths") {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return dashboardDemoData.events;

  const now = new Date();
  const end = new Date(now);
  end.setMonth(now.getMonth() + (window === "month" ? 1 : 3));

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .gte("date", now.toISOString().slice(0, 10))
    .lte("date", end.toISOString().slice(0, 10))
    .order("date", { ascending: true });

  if (error || !data) return dashboardDemoData.events;

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    dateIso: row.date,
    location: row.location,
    description: row.description ?? "",
  }));
}
