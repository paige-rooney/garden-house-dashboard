export type ClientStatus = "active" | "inactive";

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  instagram?: string;
  status: ClientStatus;
  notes: string;
};

export type ProjectStatus = "tracking" | "mixing" | "mastering" | "complete";

export type Project = {
  id: string;
  clientId: string;
  title: string;
  songCount: number;
  status: ProjectStatus;
  dueDate: string;
  budgetUsd: number;
  notes: string;
};

export type InvoiceStatus = "paid" | "due" | "overdue" | "plan";

export type Invoice = {
  id: string;
  clientId: string;
  projectId: string;
  amountUsd: number;
  status: InvoiceStatus;
  dueDate: string;
};

export type PaymentStatus = "paid" | "pending" | "failed";

export type Payment = {
  id: string;
  invoiceId: string;
  amountUsd: number;
  status: PaymentStatus;
  paidAt?: string | null;
};

export type EventItem = {
  id: string;
  title: string;
  dateIso: string;
  location: string;
  description: string;
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
  revenue: RevenuePoint[];
};
