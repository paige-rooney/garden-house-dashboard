import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { requireStaff } from "@/lib/auth/staff";
import { jsonError } from "@/lib/http";
import { getSupabaseServiceClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    if (!env.ALLOW_DEBUG_ENDPOINTS) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await requireStaff(request, { minRole: "owner" });
    const supabase = getSupabaseServiceClient();
    if (!supabase) return NextResponse.json({ ok: false, error: "Database unavailable" }, { status: 503 });
    const { error, count } = await supabase.from("clients").select("id", { head: true, count: "exact" });
    return NextResponse.json({ ok: !error, clients: count ?? 0, error: error?.message ?? null });
  } catch (error) {
    return jsonError(error);
  }
}
