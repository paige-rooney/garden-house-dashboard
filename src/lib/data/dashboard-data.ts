import { HttpError } from "@/lib/http";
import { buildRevenueFromPayments } from "@/lib/revenue";
import { getSupabaseServiceClient } from "@/lib/supabase/admin";
import {
  BrandAsset,
  Booking,
  Client,
  ContractRecord,
  ContractTemplate,
  DashboardData,
  EventItem,
  Invoice,
  InvoiceStatus,
  MarketingCampaign,
  Payment,
  Project,
  ProjectFile,
  SessionType,
} from "@/lib/types";

function deriveInvoiceStatus(status: string, dueDate: string | null): InvoiceStatus {
  if (status === "due" && dueDate && new Date(dueDate) < new Date()) return "overdue";
  return status as InvoiceStatus;
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    throw new HttpError(
      503,
      "The studio database is not connected. Add Supabase keys in the hosting settings, then reload.",
      "db_unconfigured",
    );
  }

  const [
    clientsResult,
    projectsResult,
    invoicesResult,
    paymentsResult,
    eventsResult,
    filesResult,
    contractsResult,
    templatesResult,
    campaignsResult,
    brandResult,
    bookingsResult,
    sessionTypesResult,
  ] = await Promise.all([
    supabase.from("clients").select("*").is("archived_at", null).order("created_at", { ascending: false }),
    supabase.from("projects").select("*").is("archived_at", null).order("created_at", { ascending: false }),
    supabase.from("invoices").select("*").order("created_at", { ascending: false }),
    supabase.from("payments").select("*").order("created_at", { ascending: false }),
    supabase.from("events").select("*").order("date", { ascending: true }),
    supabase.from("project_files").select("*").order("created_at", { ascending: false }),
    supabase.from("contracts").select("*").order("created_at", { ascending: false }),
    supabase.from("contract_templates").select("*").eq("is_active", true).order("created_at", { ascending: false }),
    supabase.from("marketing_campaigns").select("*").order("updated_at", { ascending: false }),
    supabase.from("brand_assets").select("*").is("archived_at", null).order("created_at", { ascending: false }),
    supabase.from("bookings").select("*").order("starts_at", { ascending: true }),
    supabase.from("session_types").select("*").eq("is_active", true).order("duration_minutes"),
  ]);

  const firstError =
    clientsResult.error ||
    projectsResult.error ||
    invoicesResult.error ||
    paymentsResult.error ||
    eventsResult.error;

  if (firstError) {
    throw new HttpError(
      503,
      `The studio database could not be read (${firstError.message}). If you just updated the app, run the SQL migration in Supabase.`,
      "db_read",
    );
  }

  const clients: Client[] = (clientsResult.data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? "",
    instagram: row.instagram ?? undefined,
    website: row.website ?? undefined,
    status: row.status,
    notes: row.notes ?? "",
    archivedAt: row.archived_at,
    stripeCustomerId: row.stripe_customer_id,
  }));

  const projects: Project[] = (projectsResult.data ?? []).map((row) => ({
    id: row.id,
    clientId: row.client_id,
    title: row.title,
    songCount: row.song_count ?? 1,
    status: row.status,
    dueDate: row.due_date ?? "",
    budgetUsd: Number(row.budget_usd ?? 0),
    notes: row.notes ?? "",
    archivedAt: row.archived_at,
  }));

  const invoices: Invoice[] = (invoicesResult.data ?? []).map((row) => ({
    id: row.id,
    clientId: row.client_id,
    projectId: row.project_id,
    amountUsd: Number(row.amount_usd ?? 0),
    status: deriveInvoiceStatus(row.status, row.due_date),
    dueDate: row.due_date ?? "",
    stripeInvoiceId: row.stripe_invoice_id ?? null,
    hostedInvoiceUrl: row.hosted_invoice_url ?? null,
    paymentTerms: row.payment_terms ?? null,
    description: row.description ?? null,
  }));

  const payments: Payment[] = (paymentsResult.data ?? []).map((row) => ({
    id: row.id,
    invoiceId: row.invoice_id,
    amountUsd: Number(row.amount_usd ?? 0),
    status: row.status,
    paidAt: row.paid_at ?? null,
    stripePaymentIntentId: row.stripe_payment_intent_id ?? null,
  }));

  const events: EventItem[] = (eventsResult.data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    dateIso: row.date,
    location: row.location,
    description: row.description ?? "",
  }));

  const files: ProjectFile[] = (filesResult.error ? [] : filesResult.data ?? []).map((row) => ({
    id: row.id,
    projectId: row.project_id,
    clientId: row.client_id,
    fileName: row.file_name,
    fileKey: row.file_key,
    fileType: row.file_type,
    mimeType: row.mime_type,
    byteSize: row.byte_size,
    visibility: row.visibility ?? "private",
    purpose: row.purpose ?? "project",
  }));

  const contracts: ContractRecord[] = (contractsResult.error ? [] : contractsResult.data ?? []).map((row) => ({
    id: row.id,
    projectId: row.project_id,
    clientId: row.client_id,
    templateId: row.template_id,
    title: row.title ?? "Contract",
    status: row.status,
    sentTo: row.sent_to,
    signedAt: row.signed_at,
    provider: row.provider ?? "studio",
  }));

  const templates: ContractTemplate[] = (templatesResult.error ? [] : templatesResult.data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    body: row.body,
    isActive: row.is_active !== false,
  }));

  const campaigns: MarketingCampaign[] = (campaignsResult.error ? [] : campaignsResult.data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status,
    channel: row.channel,
    scheduledDate: row.scheduled_date,
    caption: row.caption,
    notes: row.notes,
    month: row.month,
  }));

  const brandAssets: BrandAsset[] = (brandResult.error ? [] : brandResult.data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    r2Key: row.r2_key,
    mimeType: row.mime_type,
    visibility: row.visibility,
    versionLabel: row.version_label,
    notes: row.notes,
    archivedAt: row.archived_at,
  }));

  const bookings: Booking[] = (bookingsResult.error ? [] : bookingsResult.data ?? []).map((row) => ({
    id: row.id,
    sessionTypeId: row.session_type_id,
    clientId: row.client_id,
    guestName: row.guest_name,
    guestEmail: row.guest_email,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    notes: row.notes,
    googleEventId: row.google_event_id,
  }));

  const sessionTypes: SessionType[] = (sessionTypesResult.error ? [] : sessionTypesResult.data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    durationMinutes: row.duration_minutes,
    bufferMinutes: row.buffer_minutes,
    priceUsd: Number(row.price_usd ?? 0),
    description: row.description,
  }));

  return {
    clients,
    projects,
    invoices,
    payments,
    events,
    files,
    contracts,
    templates,
    campaigns,
    brandAssets,
    bookings,
    sessionTypes,
    revenue: buildRevenueFromPayments(payments),
    source: "database",
  };
}

export async function getUpcomingEvents(window: "month" | "threeMonths") {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return [];

  const now = new Date();
  const end = new Date(now);
  end.setMonth(now.getMonth() + (window === "month" ? 1 : 3));

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .gte("date", now.toISOString().slice(0, 10))
    .lte("date", end.toISOString().slice(0, 10))
    .order("date", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    dateIso: row.date,
    location: row.location,
    description: row.description ?? "",
  }));
}
