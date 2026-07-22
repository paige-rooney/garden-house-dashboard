import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServiceClient } from "@/lib/integrations/supabase";

const projectStatus = z.enum(["tracking", "mixing", "mastering", "complete"]);

const createProjectSchema = z.object({
  clientId: z.string().uuid(),
  title: z.string().min(1),
  songCount: z.number().int().min(1).default(1),
  status: projectStatus.default("tracking"),
  dueDate: z.string().optional().default(""),
  budgetUsd: z.number().min(0).default(0),
  notes: z.string().optional().default(""),
});

const updateProjectSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).optional(),
  songCount: z.number().int().min(1).optional(),
  status: projectStatus.optional(),
  dueDate: z.string().optional(),
  budgetUsd: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { error } = await supabase.from("projects").insert({
    client_id: parsed.data.clientId,
    title: parsed.data.title,
    song_count: parsed.data.songCount,
    status: parsed.data.status,
    due_date: parsed.data.dueDate || null,
    budget_usd: parsed.data.budgetUsd,
    notes: parsed.data.notes,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: NextRequest) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = updateProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { id, ...rest } = parsed.data;
  const payload: Record<string, unknown> = {};
  if (rest.title !== undefined) payload.title = rest.title;
  if (rest.songCount !== undefined) payload.song_count = rest.songCount;
  if (rest.status !== undefined) payload.status = rest.status;
  if (rest.dueDate !== undefined) payload.due_date = rest.dueDate || null;
  if (rest.budgetUsd !== undefined) payload.budget_usd = rest.budgetUsd;
  if (rest.notes !== undefined) payload.notes = rest.notes;

  const { error } = await supabase.from("projects").update(payload).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
