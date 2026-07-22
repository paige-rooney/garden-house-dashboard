import { Resend } from "resend";
import { env } from "@/lib/env";

export function getResendClient(): Resend | null {
  if (!env.RESEND_API_KEY) return null;
  return new Resend(env.RESEND_API_KEY);
}
