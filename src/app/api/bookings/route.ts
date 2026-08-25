import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth/staff";
import { sendTransactionalEmail } from "@/lib/email/send";
import { jsonError } from "@/lib/http";
import { createGoogleCalendarEvent, deleteGoogleCalendarEvent } from "@/lib/integrations/google-calendar";
import { writeAudit } from "@/lib/security/audit";
import { getSupabaseServiceClient } from "@/lib/supabase/admin";
import { z } from "zod";

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "cancelled", "rescheduled", "completed"]).optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  notes: z.string().optional(),
  cancellationReason: z.string().optional(),
});

async function overlaps(supabase: NonNullable<ReturnType<typeof getSupabaseServiceClient>>, startsAt: string, endsAt: string, ignoreId?: string) {
  let query = supabase
    .from("bookings")
    .select("id")
    .lt("starts_at", endsAt)
    .gt("ends_at", startsAt)
    .in("status", ["pending", "confirmed"]);
  if (ignoreId) query = query.neq("id", ignoreId);
  const { data } = await query;
  return (data?.length ?? 0) > 0;
}

export async function GET(request: NextRequest) {
  try {
    await requireStaff(request);
    const supabase = getSupabaseServiceClient();
    if (!supabase) return NextResponse.json({ error: "Database is unavailable." }, { status: 503 });
    const { data, error } = await supabase.from("bookings").select("*").order("starts_at");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ bookings: data });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { staff } = await requireStaff(request);
    const parsed = updateSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: "Invalid booking update." }, { status: 400 });
    const supabase = getSupabaseServiceClient();
    if (!supabase) return NextResponse.json({ error: "Database is unavailable." }, { status: 503 });

    const { data: existing } = await supabase.from("bookings").select("*").eq("id", parsed.data.id).maybeSingle();
    if (!existing) return NextResponse.json({ error: "Booking not found." }, { status: 404 });

    const startsAt = parsed.data.startsAt ?? existing.starts_at;
    const endsAt = parsed.data.endsAt ?? existing.ends_at;
    if (parsed.data.status === "confirmed" || parsed.data.startsAt) {
      if (await overlaps(supabase, startsAt, endsAt, parsed.data.id)) {
        return NextResponse.json({ error: "That time overlaps another booking." }, { status: 409 });
      }
    }

    const payload: Record<string, unknown> = {};
    if (parsed.data.status) payload.status = parsed.data.status;
    if (parsed.data.startsAt) payload.starts_at = parsed.data.startsAt;
    if (parsed.data.endsAt) payload.ends_at = parsed.data.endsAt;
    if (parsed.data.notes !== undefined) payload.notes = parsed.data.notes;
    if (parsed.data.cancellationReason) payload.cancellation_reason = parsed.data.cancellationReason;

    const { error } = await supabase.from("bookings").update(payload).eq("id", parsed.data.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (parsed.data.status === "confirmed" && !existing.google_event_id) {
      try {
        const { data: sessionType } = existing.session_type_id
          ? await supabase.from("session_types").select("name").eq("id", existing.session_type_id).maybeSingle()
          : { data: null };
        const summary = `Garden House · ${sessionType?.name ?? "Session"} · ${existing.guest_name || "Guest"}`;
        const eventId = await createGoogleCalendarEvent({
          summary,
          description: existing.notes ?? undefined,
          startsAt: startsAt,
          endsAt: endsAt,
        });
        if (eventId) {
          await supabase.from("bookings").update({ google_event_id: eventId }).eq("id", parsed.data.id);
        }
      } catch {
        // Confirm the studio booking even if Google Calendar is unavailable.
      }
    }

    if (parsed.data.status === "cancelled" && existing.google_event_id) {
      try {
        await deleteGoogleCalendarEvent(existing.google_event_id);
      } catch {
        // Keep the cancelled booking even if Google Calendar delete fails.
      }
    }

    if (existing.guest_email && (parsed.data.status === "confirmed" || parsed.data.status === "cancelled")) {
      await sendTransactionalEmail({
        templateKey: parsed.data.status === "confirmed" ? "booking_confirmed" : "booking_cancelled",
        to: [existing.guest_email],
        subject:
          parsed.data.status === "confirmed"
            ? "Your Garden House session is confirmed"
            : "Your Garden House session was cancelled",
        text: `Status: ${parsed.data.status}\nWhen: ${startsAt}\n`,
        dedupeKey: `booking-${parsed.data.id}-${parsed.data.status}`,
      });
    }

    await writeAudit({
      actorId: staff.id,
      actorEmail: staff.email,
      action: "booking.update",
      entityType: "booking",
      entityId: parsed.data.id,
      metadata: parsed.data,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
