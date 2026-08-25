import { getSupabaseServiceClient } from "@/lib/supabase/admin";
import { logWarn } from "@/lib/logging";

export async function writeAudit(entry: {
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    logWarn("audit_skipped_no_database", { action: entry.action });
    return;
  }

  const { error } = await supabase.from("audit_logs").insert({
    actor_id: entry.actorId ?? null,
    actor_email: entry.actorEmail ?? null,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId ?? null,
    metadata: entry.metadata ?? {},
  });

  if (error) {
    logWarn("audit_write_failed", { action: entry.action, message: error.message });
  }
}
