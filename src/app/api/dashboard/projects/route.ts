import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth/staff";
import { jsonError } from "@/lib/http";
import { writeAudit } from "@/lib/security/audit";
import { getSupabaseServiceClient } from "@/lib/supabase/admin";
import { createProjectSchema, updateProjectSchema } from "@/lib/validators/forms";

export async function POST(request: NextRequest) {
  try {
    const { staff } = await requireStaff(request);
    const supabase = getSupabaseServiceClient();
    if (!supabase) return NextResponse.json({ error: "Database is unavailable." }, { status: 503 });

    const parsed = createProjectSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: "Check the project details and try again." }, { status: 400 });

    const { data, error } = await supabase
      .from("projects")
      .insert({
        client_id: parsed.data.clientId,
        title: parsed.data.title,
        song_count: parsed.data.songCount,
        status: parsed.data.status,
        due_date: parsed.data.dueDate || null,
        budget_usd: parsed.data.budgetUsd,
        notes: parsed.data.notes,
      })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase.from("project_status_history").insert({
      project_id: data.id,
      from_status: null,
      to_status: parsed.data.status,
      changed_by: staff.id,
    });
    await writeAudit({
      actorId: staff.id,
      actorEmail: staff.email,
      action: "project.create",
      entityType: "project",
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

    const parsed = updateProjectSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: "Check the project details and try again." }, { status: 400 });

    const existing = await supabase.from("projects").select("status").eq("id", parsed.data.id).maybeSingle();
    const { id, archived, ...rest } = parsed.data;
    const payload: Record<string, unknown> = {};
    if (rest.title !== undefined) payload.title = rest.title;
    if (rest.songCount !== undefined) payload.song_count = rest.songCount;
    if (rest.status !== undefined) payload.status = rest.status;
    if (rest.dueDate !== undefined) payload.due_date = rest.dueDate || null;
    if (rest.budgetUsd !== undefined) payload.budget_usd = rest.budgetUsd;
    if (rest.notes !== undefined) payload.notes = rest.notes;
    if (archived === true) payload.archived_at = new Date().toISOString();
    if (archived === false) payload.archived_at = null;

    const { error } = await supabase.from("projects").update(payload).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (rest.status && existing.data && existing.data.status !== rest.status) {
      await supabase.from("project_status_history").insert({
        project_id: id,
        from_status: existing.data.status,
        to_status: rest.status,
        changed_by: staff.id,
      });
    }

    await writeAudit({
      actorId: staff.id,
      actorEmail: staff.email,
      action: archived ? "project.archive" : "project.update",
      entityType: "project",
      entityId: id,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
