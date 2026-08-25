import { getSupabaseServiceClient } from "@/lib/supabase/admin";
import { logWarn } from "@/lib/logging";

const memory = new Map<string, { count: number; windowStart: number }>();

export async function consumeRateLimit(options: {
  key: string;
  limit: number;
  windowMs: number;
}): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date(Math.floor(Date.now() / options.windowMs) * options.windowMs);
  const supabase = getSupabaseServiceClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("rate_limit_buckets")
      .select("count")
      .eq("bucket_key", options.key)
      .eq("window_start", windowStart.toISOString())
      .maybeSingle();

    if (!error) {
      const current = data?.count ?? 0;
      if (current >= options.limit) {
        return { allowed: false, remaining: 0 };
      }
      const next = current + 1;
      await supabase.from("rate_limit_buckets").upsert({
        bucket_key: options.key,
        window_start: windowStart.toISOString(),
        count: next,
      });
      return { allowed: true, remaining: Math.max(0, options.limit - next) };
    }
    logWarn("rate_limit_table_unavailable", { message: error.message });
  }

  const memKey = `${options.key}:${windowStart.getTime()}`;
  const existing = memory.get(memKey);
  const count = (existing?.count ?? 0) + 1;
  memory.set(memKey, { count, windowStart: windowStart.getTime() });
  if (count > options.limit) return { allowed: false, remaining: 0 };
  return { allowed: true, remaining: Math.max(0, options.limit - count) };
}

export async function enforceRateLimit(options: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const result = await consumeRateLimit(options);
  if (!result.allowed) {
    const { HttpError } = await import("@/lib/http");
    throw new HttpError(429, "Too many attempts. Please wait and try again.", "rate_limited");
  }
  return result;
}
