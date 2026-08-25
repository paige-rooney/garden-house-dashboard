import { getSupabaseServiceClient } from "@/lib/supabase/admin";

export async function claimWebhookEvent(provider: string, eventId: string, eventType?: string) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return { duplicate: false, skipped: true as const };

  const { data, error } = await supabase
    .from("webhook_events")
    .insert({
      provider,
      event_id: eventId,
      event_type: eventType ?? null,
      status: "processing",
    })
    .select("id")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") return { duplicate: true, skipped: false as const };
    throw error;
  }

  return { duplicate: false, skipped: false as const, id: data?.id };
}

export async function finishWebhookEvent(provider: string, eventId: string, status: "processed" | "failed", errorMessage?: string) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return;
  await supabase
    .from("webhook_events")
    .update({ status, error: errorMessage ?? null })
    .eq("provider", provider)
    .eq("event_id", eventId);
}
