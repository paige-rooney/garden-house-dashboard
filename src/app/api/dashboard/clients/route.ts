import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth/staff";
import { jsonError } from "@/lib/http";
import { writeAudit } from "@/lib/security/audit";
import { getSupabaseServiceClient } from "@/lib/supabase/admin";
import { createClientSchema, updateClientSchema } from "@/lib/validators/forms";

export async function POST(request: NextRequest) {
  try {
    const { staff } = await requireStaff(request);
    const supabase = getSupabaseServiceClient();
    if (!supabase) return NextResponse.json({ error: "Database is unavailable." }, { status: 503 });

    const parsed = createClientSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: "Check the client details and try again." }, { status: 400 });

    const { data, error } = await supabase
      .from("clients")
      .insert({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        instagram: parsed.data.instagram || null,
        website: parsed.data.website || null,
        status: parsed.data.status,
        notes: parsed.data.notes,
      })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await writeAudit({
      actorId: staff.id,
      actorEmail: staff.email,
      action: "client.create",
      entityType: "client",
      entityId: data.id,
    });
    return NextResponse.json({ ok: true, id: data.id });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { staff } = await requireStaff(request);
    const supabase = getSupabaseServiceClient();
    if (!supabase) return NextResponse.json({ error: "Database is unavailable." }, { status: 503 });

    const parsed = updateClientSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: "Check the client details and try again." }, { status: 400 });

    const { id, archived, ...rest } = parsed.data;
    const payload: Record<string, unknown> = {};
    if (rest.name !== undefined) payload.name = rest.name;
    if (rest.email !== undefined) payload.email = rest.email;
    if (rest.phone !== undefined) payload.phone = rest.phone;
    if (rest.instagram !== undefined) payload.instagram = rest.instagram || null;
    if (rest.website !== undefined) payload.website = rest.website || null;
    if (rest.status !== undefined) payload.status = rest.status;
    if (rest.notes !== undefined) payload.notes = rest.notes;
    if (archived === true) payload.archived_at = new Date().toISOString();
    if (archived === false) payload.archived_at = null;

    const { error } = await supabase.from("clients").update(payload).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await writeAudit({
      actorId: staff.id,
      actorEmail: staff.email,
      action: archived ? "client.archive" : "client.update",
      entityType: "client",
      entityId: id,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
