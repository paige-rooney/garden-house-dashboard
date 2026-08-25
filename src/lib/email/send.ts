import { env, isProductionRuntime } from "@/lib/env";
import { getResendClient } from "@/lib/integrations/resend";
import { getSupabaseServiceClient } from "@/lib/supabase/admin";
import { logInfo, logWarn } from "@/lib/logging";

export function resolveRecipients(intended: string[]) {
  if (!isProductionRuntime()) {
    const safe = env.EMAIL_SAFE_RECIPIENT ?? env.RESEND_CONTACT_TO;
    if (safe) return { to: [safe], redirected: true as const, original: intended };
  }
  return { to: intended, redirected: false as const, original: intended };
}

export async function sendTransactionalEmail(options: {
  templateKey: string;
  to: string[];
  subject: string;
  text: string;
  html?: string;
  dedupeKey?: string;
}) {
  const resend = getResendClient();
  if (!resend || !env.RESEND_FROM) {
    return { ok: false as const, reason: "email_not_configured" };
  }

  const supabase = getSupabaseServiceClient();
  if (options.dedupeKey && supabase) {
    const existing = await supabase
      .from("email_deliveries")
      .select("id")
      .eq("dedupe_key", options.dedupeKey)
      .maybeSingle();
    if (existing.data) return { ok: true as const, duplicate: true as const };
  }

  const resolved = resolveRecipients(options.to);
  const { data, error } = await resend.emails.send({
    from: env.RESEND_FROM,
    to: resolved.to,
    subject: resolved.redirected ? `[DEV redirect] ${options.subject}` : options.subject,
    text: resolved.redirected
      ? `Original recipients: ${resolved.original.join(", ")}\n\n${options.text}`
      : options.text,
    html: options.html,
  });

  if (error) {
    logWarn("email_send_failed", { template: options.templateKey, message: error.message });
    if (supabase) {
      await supabase.from("email_deliveries").insert({
        template_key: options.templateKey,
        to_email: resolved.to.join(","),
        status: "failed",
        error: error.message,
        dedupe_key: options.dedupeKey ?? null,
      });
    }
    return { ok: false as const, reason: error.message };
  }

  logInfo("email_sent", { template: options.templateKey, id: data?.id, redirected: resolved.redirected });
  if (supabase) {
    await supabase.from("email_deliveries").insert({
      template_key: options.templateKey,
      to_email: resolved.to.join(","),
      provider_id: data?.id ?? null,
      status: "sent",
      dedupe_key: options.dedupeKey ?? null,
    });
  }
  return { ok: true as const, id: data?.id, redirected: resolved.redirected };
}
