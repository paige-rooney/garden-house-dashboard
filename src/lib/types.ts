export type StaffRole = "owner" | "admin" | "staff";
export type ClientStatus = "active" | "inactive";
export type ProjectStatus = "tracking" | "mixing" | "mastering" | "complete";
export type InvoiceStatus = "draft" | "due" | "paid" | "failed" | "overdue" | "void" | "refunded" | "plan";
export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";
export type ContractStatus = "draft" | "sent" | "viewed" | "signed" | "declined" | "expired" | "cancelled";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "rescheduled" | "completed";

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  instagram?: string;
  website?: string;
  status: ClientStatus;
  notes: string;
  archivedAt?: string | null;
  stripeCustomerId?: string | null;
};

export type Project = {
  id: string;
  clientId: string;
  title: string;
  songCount: number;
  status: ProjectStatus;
  dueDate: string;
  budgetUsd: number;
  notes: string;
  archivedAt?: string | null;
};

export type ProjectFile = {
  id: string;
  projectId: string;
  clientId?: string | null;
  fileName: string;
  fileKey: string;
  fileType?: string | null;
  mimeType?: string | null;
  byteSize?: number | null;
  visibility: string;
  purpose: string;
};

export type Invoice = {
  id: string;
  clientId: string;
  projectId: string;
  amountUsd: number;
  status: InvoiceStatus;
  dueDate: string;
  stripeInvoiceId?: string | null;
  hostedInvoiceUrl?: string | null;
  paymentTerms?: string | null;
  description?: string | null;
};

export type Payment = {
  id: string;
  invoiceId: string;
  amountUsd: number;
  status: PaymentStatus;
  paidAt?: string | null;
  stripePaymentIntentId?: string | null;
};

export type ContractTemplate = {
  id: string;
  name: string;
  body: string;
  isActive: boolean;
};

export type ContractRecord = {
  id: string;
  projectId: string;
  clientId?: string | null;
  templateId?: string | null;
  title: string;
  status: ContractStatus;
  sentTo?: string | null;
  signedAt?: string | null;
  provider: string;
};

export type EventItem = {
  id: string;
  title: string;
  dateIso: string;
  location: string;
  description: string;
};

export type MarketingCampaign = {
  id: string;
  title: string;
  status: "draft" | "scheduled" | "posted" | "cancelled";
  channel: string;
  scheduledDate?: string | null;
  caption?: string | null;
  notes?: string | null;
  month?: string | null;
};

export type BrandAsset = {
  id: string;
  name: string;
  category: string;
  r2Key: string;
  mimeType?: string | null;
  visibility: string;
  versionLabel?: string | null;
  notes?: string | null;
  archivedAt?: string | null;
};

export type Booking = {
  id: string;
  sessionTypeId?: string | null;
  clientId?: string | null;
  guestName?: string | null;
  guestEmail?: string | null;
  startsAt: string;
  endsAt: string;
  status: BookingStatus;
  notes?: string | null;
};

export type SessionType = {
  id: string;
  name: string;
  slug: string;
  durationMinutes: number;
  bufferMinutes: number;
  priceUsd: number;
  description?: string | null;
};

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
};

export type PortfolioItem = {
  id: string;
  artist: string;
  projectTitle: string;
  service: string;
};

export type RevenuePoint = {
  month: string;
  monthly: number;
  quarterly: number;
  ytd: number;
  oneYear: number;
  fiveYear: number;
};

export type DashboardData = {
  clients: Client[];
  projects: Project[];
  invoices: Invoice[];
  payments: Payment[];
  events: EventItem[];
  files: ProjectFile[];
  contracts: ContractRecord[];
  templates: ContractTemplate[];
  campaigns: MarketingCampaign[];
  brandAssets: BrandAsset[];
  bookings: Booking[];
  sessionTypes: SessionType[];
  revenue: RevenuePoint[];
  source: "database";
};

export type OperationalError = {
  error: string;
  code?: string;
};
