import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth/staff";
import { jsonError } from "@/lib/http";
import { getSupabaseServiceClient } from "@/lib/supabase/admin";
import { staffInviteSchema } from "@/lib/validators/forms";
import { writeAudit } from "@/lib/security/audit";

export async function GET(request: NextRequest) {
  try {
    await requireStaff(request, { minRole: "admin" });
    const supabase = getSupabaseServiceClient();
    if (!supabase) return NextResponse.json({ error: "Database is unavailable." }, { status: 503 });
    const [{ data: staff }, { data: invites }] = await Promise.all([
      supabase.from("staff_profiles").select("id, email, full_name, role, status, created_at").order("created_at"),
      supabase.from("staff_invites").select("*").is("accepted_at", null).order("created_at", { ascending: false }),
    ]);
    return NextResponse.json({ staff: staff ?? [], invites: invites ?? [] });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { staff } = await requireStaff(request, { minRole: "owner" });
    const parsed = staffInviteSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: "Enter a valid staff email." }, { status: 400 });
    const supabase = getSupabaseServiceClient();
    if (!supabase) return NextResponse.json({ error: "Database is unavailable." }, { status: 503 });

    const { data: invite, error } = await supabase
      .from("staff_invites")
      .insert({
        email: parsed.data.email.toLowerCase(),
        role: parsed.data.role,
        invited_by: staff.id,
      })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(parsed.data.email, {
      data: { role: parsed.data.role, full_name: parsed.data.fullName ?? "" },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback?next=/admin`,
    });

    await writeAudit({
      actorId: staff.id,
      actorEmail: staff.email,
      action: "staff.invite",
      entityType: "staff_invite",
      entityId: invite.id,
      metadata: { email: parsed.data.email, role: parsed.data.role },
    });

    return NextResponse.json({
      ok: true,
      id: invite.id,
      emailInvite: inviteError ? inviteError.message : "sent",
    });
  } catch (error) {
    return jsonError(error);
  }
}
