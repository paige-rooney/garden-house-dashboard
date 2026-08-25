import { z } from "zod";

export const contactFormSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  instagram: z.string().optional(),
  location: z.string().optional(),
  message: z.string().min(5),
});

export const eventSubscribeSchema = z.object({
  email: z.string().email(),
  recipientGroup: z.enum(["all-events", "community-only", "workshops-only"]),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).optional(),
  mode: z.enum(["password", "magic"]).default("password"),
});

export const createClientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().default(""),
  instagram: z.string().optional().default(""),
  website: z.string().optional().default(""),
  status: z.enum(["active", "inactive"]).default("active"),
  notes: z.string().optional().default(""),
});

export const updateClientSchema = createClientSchema.partial().extend({
  id: z.string().uuid(),
  archived: z.boolean().optional(),
});

export const projectStatusSchema = z.enum(["tracking", "mixing", "mastering", "complete"]);

export const createProjectSchema = z.object({
  clientId: z.string().uuid(),
  title: z.string().min(1),
  songCount: z.number().int().min(1).default(1),
  status: projectStatusSchema.default("tracking"),
  dueDate: z.string().optional().default(""),
  budgetUsd: z.number().min(0).default(0),
  notes: z.string().optional().default(""),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  id: z.string().uuid(),
  archived: z.boolean().optional(),
});

export const createInvoiceSchema = z.object({
  projectId: z.string().uuid(),
  amountUsd: z.number().positive(),
  dueDate: z.string().optional(),
  description: z.string().optional(),
  paymentTerms: z.string().optional(),
  sendEmail: z.boolean().optional().default(true),
});

export const signUploadSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  byteSize: z.number().int().positive(),
  purpose: z.enum(["project", "contract", "marketing", "brand"]),
  clientId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  visibility: z.enum(["private", "public"]).default("private"),
});

export const completeUploadSchema = z.object({
  key: z.string().min(1),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  byteSize: z.number().int().nonnegative(),
  purpose: z.enum(["project", "contract", "marketing", "brand"]),
  clientId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  visibility: z.enum(["private", "public"]).default("private"),
  category: z.string().optional(),
  name: z.string().optional(),
});

export const contractSendSchema = z.object({
  templateId: z.string().uuid(),
  projectId: z.string().uuid(),
});

export const campaignSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  status: z.enum(["draft", "scheduled", "posted", "cancelled"]).default("draft"),
  channel: z.string().min(1).default("instagram"),
  scheduledDate: z.string().optional().nullable(),
  caption: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  month: z.string().optional(),
});

export const staffInviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["owner", "admin", "staff"]).default("staff"),
  fullName: z.string().optional(),
});

export const bookingPublicSchema = z.object({
  sessionTypeId: z.string().uuid(),
  startsAt: z.string().datetime({ offset: true }).or(z.string().min(1)),
  guestName: z.string().min(1),
  guestEmail: z.string().email(),
  notes: z.string().optional().default(""),
});
