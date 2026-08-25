import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth/staff";
import { jsonError } from "@/lib/http";
import { getSupabaseServiceClient } from "@/lib/supabase/admin";
import { campaignSchema } from "@/lib/validators/forms";
import { writeAudit } from "@/lib/security/audit";

export async function GET(request: NextRequest) {
  try {
    await requireStaff(request);
    const supabase = getSupabaseServiceClient();
    if (!supabase) return NextResponse.json({ error: "Database is unavailable." }, { status: 503 });
    const { data, error } = await supabase.from("marketing_campaigns").select("*").order("updated_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ campaigns: data });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { staff } = await requireStaff(request);
    const parsed = campaignSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: "Check the campaign details." }, { status: 400 });
    const supabase = getSupabaseServiceClient();
    if (!supabase) return NextResponse.json({ error: "Database is unavailable." }, { status: 503 });
    const payload = {
      title: parsed.data.title,
      status: parsed.data.status,
      channel: parsed.data.channel,
      scheduled_date: parsed.data.scheduledDate || null,
      caption: parsed.data.caption,
      notes: parsed.data.notes,
      month: parsed.data.month ?? new Date().toLocaleString("en-US", { month: "short" }),
      created_by: staff.id,
    };
    const query = parsed.data.id
      ? supabase.from("marketing_campaigns").update(payload).eq("id", parsed.data.id).select("id").single()
      : supabase.from("marketing_campaigns").insert(payload).select("id").single();
    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await writeAudit({
      actorId: staff.id,
      actorEmail: staff.email,
      action: parsed.data.id ? "campaign.update" : "campaign.create",
      entityType: "campaign",
      entityId: data.id,
    });
    return NextResponse.json({ ok: true, id: data.id });
  } catch (error) {
    return jsonError(error);
  }
}
