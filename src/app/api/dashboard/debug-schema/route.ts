import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/integrations/supabase";
import { env } from "@/lib/env";

export async function GET() {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "Supabase not configured" }, { status: 400 });
  }

  const checks = await Promise.all([
    supabase.from("clients").select("id", { head: true, count: "exact" }),
    supabase.from("projects").select("id", { head: true, count: "exact" }),
    supabase.from("invoices").select("id", { head: true, count: "exact" }),
    supabase.from("events").select("id", { head: true, count: "exact" }),
  ]);

  return NextResponse.json({
    ok: true,
    supabaseUrl: env.SUPABASE_URL,
    results: {
      clients: { error: checks[0].error?.message ?? null, count: checks[0].count ?? null },
      projects: { error: checks[1].error?.message ?? null, count: checks[1].count ?? null },
      invoices: { error: checks[2].error?.message ?? null, count: checks[2].count ?? null },
      events: { error: checks[3].error?.message ?? null, count: checks[3].count ?? null },
    },
  });
}
