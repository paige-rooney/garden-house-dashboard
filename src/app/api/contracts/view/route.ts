import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") || "";
  const supabase = getSupabaseServiceClient();
  if (!supabase || !token) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const hash = createHash("sha256").update(token).digest("hex");
  const { data } = await supabase.from("contracts").select("id, title, status, sent_to").eq("sign_token_hash", hash).maybeSingle();
  if (!data) return NextResponse.json({ error: "This signing link is invalid." }, { status: 404 });
  if (data.status === "sent") {
    await supabase.from("contracts").update({ status: "viewed", viewed_at: new Date().toISOString() }).eq("id", data.id);
    await supabase.from("contract_activity").insert({ contract_id: data.id, action: "viewed", actor_email: data.sent_to });
  }
  return NextResponse.json({ ok: true, title: data.title, status: data.status });
}
