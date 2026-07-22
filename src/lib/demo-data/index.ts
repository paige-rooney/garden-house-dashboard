import {
  Client,
  DashboardData,
  EventItem,
  Invoice,
  Payment,
  PortfolioItem,
  Project,
  RevenuePoint,
  Testimonial,
} from "@/lib/types";

export const slogan =
  "Collaboration, creativity, and cultivation for artists south of Nashville.";

export const services = [
  {
    name: "Production & Recording",
    description:
      "Song development, arrangement, and capture in a focused creative room.",
  },
  {
    name: "Mixing",
    description:
      "Balanced, emotional mixes that translate across streaming and live playback.",
  },
  {
    name: "Cowrite Room",
    description:
      "Collaborative writing sessions designed to sharpen artistry and storytelling.",
  },
  {
    name: "Events",
    description:
      "Community showcases and workshops to connect creatives and build momentum.",
  },
];

export const portfolio: PortfolioItem[] = [
  {
    id: "pf1",
    artist: "Maya Hill",
    projectTitle: "Late Bloom",
    service: "Production + Mix",
  },
  {
    id: "pf2",
    artist: "Cedar Lane",
    projectTitle: "Homegrown EP",
    service: "Mixing",
  },
  {
    id: "pf3",
    artist: "Knox Wilder",
    projectTitle: "Southbound",
    service: "Cowrite + Production",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote:
      "Garden House gave me the clarity and confidence to release my best songs.",
    name: "Maya Hill",
    role: "Independent Artist",
  },
  {
    id: "t2",
    quote:
      "The collaboration process felt intentional, musical, and deeply supportive.",
    name: "Cedar Lane",
    role: "Singer-Songwriter",
  },
];

export const events: EventItem[] = [
  {
    id: "e1",
    title: "Open Session Night",
    dateIso: "2026-06-12",
    location: "Garden House Studio",
    description: "Community showcase and networking for local artists.",
  },
  {
    id: "e2",
    title: "Songwriting Circle",
    dateIso: "2026-07-02",
    location: "Garden House Studio",
    description: "Cowrite format with rotating prompts and peer feedback.",
  },
  {
    id: "e3",
    title: "Mix Feedback Lab",
    dateIso: "2026-08-16",
    location: "Garden House Studio",
    description: "Bring your rough mix for group critique and workflow tips.",
  },
];

export const clients: Client[] = [
  {
    id: "c1",
    name: "Maya Hill",
    email: "maya@example.com",
    phone: "615-555-1001",
    instagram: "@mayahillmusic",
    status: "active",
    notes: "Launching single in July.",
  },
  {
    id: "c2",
    name: "Cedar Lane",
    email: "cedar@example.com",
    phone: "615-555-1002",
    instagram: "@cedarlanemusic",
    status: "active",
    notes: "EP sequencing in progress.",
  },
  {
    id: "c3",
    name: "Knox Wilder",
    email: "knox@example.com",
    phone: "615-555-1003",
    status: "inactive",
    notes: "Wrapped album project in 2025.",
  },
];

export const projects: Project[] = [
  {
    id: "p1",
    clientId: "c1",
    title: "Bloom Single",
    songCount: 1,
    status: "mixing",
    dueDate: "2026-06-30",
    budgetUsd: 1200,
    notes: "Awaiting vocal revision.",
  },
  {
    id: "p2",
    clientId: "c2",
    title: "Homegrown EP",
    songCount: 5,
    status: "tracking",
    dueDate: "2026-07-20",
    budgetUsd: 4800,
    notes: "Drum edits underway.",
  },
  {
    id: "p3",
    clientId: "c3",
    title: "Southbound Album",
    songCount: 10,
    status: "complete",
    dueDate: "2025-12-01",
    budgetUsd: 9800,
    notes: "Archive stems to R2.",
  },
];

export const invoices: Invoice[] = [
  {
    id: "i1",
    clientId: "c1",
    projectId: "p1",
    amountUsd: 600,
    status: "due",
    dueDate: "2026-06-15",
  },
  {
    id: "i2",
    clientId: "c2",
    projectId: "p2",
    amountUsd: 1600,
    status: "plan",
    dueDate: "2026-06-20",
  },
  {
    id: "i3",
    clientId: "c3",
    projectId: "p3",
    amountUsd: 9800,
    status: "paid",
    dueDate: "2025-11-15",
  },
];

export const payments: Payment[] = [
  { id: "pay1", invoiceId: "i1", amountUsd: 300, status: "pending", paidAt: null },
  { id: "pay2", invoiceId: "i2", amountUsd: 800, status: "pending", paidAt: null },
  { id: "pay3", invoiceId: "i3", amountUsd: 9800, status: "paid", paidAt: "2025-11-12" },
];

export const revenue: RevenuePoint[] = [
  { month: "Jan", monthly: 4200, quarterly: 4200, ytd: 4200, oneYear: 4200, fiveYear: 4200 },
  { month: "Feb", monthly: 5300, quarterly: 9500, ytd: 9500, oneYear: 9500, fiveYear: 9500 },
  { month: "Mar", monthly: 6100, quarterly: 15600, ytd: 15600, oneYear: 15600, fiveYear: 15600 },
  { month: "Apr", monthly: 4700, quarterly: 16100, ytd: 20300, oneYear: 20300, fiveYear: 20300 },
  { month: "May", monthly: 5800, quarterly: 16600, ytd: 26100, oneYear: 26100, fiveYear: 26100 },
];

export const dashboardDemoData: DashboardData = {
  clients,
  projects,
  invoices,
  payments,
  events,
  revenue,
};
