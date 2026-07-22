import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServiceClient } from "@/lib/integrations/supabase";

const createClientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().default(""),
  instagram: z.string().optional().default(""),
  status: z.enum(["active", "inactive"]).default("active"),
  notes: z.string().optional().default(""),
});

const updateClientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  instagram: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = createClientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { error } = await supabase.from("clients").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    instagram: parsed.data.instagram || null,
    status: parsed.data.status,
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
  const parsed = updateClientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { id, ...rest } = parsed.data;
  const payload: Record<string, unknown> = {};
  if (rest.name !== undefined) payload.name = rest.name;
  if (rest.email !== undefined) payload.email = rest.email;
  if (rest.phone !== undefined) payload.phone = rest.phone;
  if (rest.instagram !== undefined) payload.instagram = rest.instagram || null;
  if (rest.status !== undefined) payload.status = rest.status;
  if (rest.notes !== undefined) payload.notes = rest.notes;

  const { error } = await supabase.from("clients").update(payload).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
