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
