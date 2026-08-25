import { NextRequest, NextResponse } from "next/server";
import { jsonError, clientIp } from "@/lib/http";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { getSupabaseServiceClient } from "@/lib/supabase/admin";
import { bookingPublicSchema } from "@/lib/validators/forms";
import { sendTransactionalEmail } from "@/lib/email/send";
import { env } from "@/lib/env";
import { isWithinAvailability } from "@/lib/bookings/availability";

export async function GET() {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return NextResponse.json({ sessionTypes: [], rules: [] });
  const [{ data: sessionTypes }, { data: rules }] = await Promise.all([
    supabase.from("session_types").select("*").eq("is_active", true),
    supabase.from("availability_rules").select("*").eq("is_active", true),
  ]);
  return NextResponse.json({
    sessionTypes: sessionTypes ?? [],
    rules: rules ?? [],
    timezone: env.STUDIO_TIMEZONE,
  });
}

export async function POST(request: NextRequest) {
  try {
    await enforceRateLimit({ key: `book:${clientIp(request)}`, limit: 10, windowMs: 15 * 60_000 });
    const parsed = bookingPublicSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: "Check the booking details." }, { status: 400 });
    const supabase = getSupabaseServiceClient();
    if (!supabase) return NextResponse.json({ error: "Booking is temporarily unavailable." }, { status: 503 });

    const { data: sessionType } = await supabase
      .from("session_types")
      .select("*")
      .eq("id", parsed.data.sessionTypeId)
      .maybeSingle();
    if (!sessionType) return NextResponse.json({ error: "Unknown session type." }, { status: 400 });

    const startsAt = new Date(parsed.data.startsAt);
    const endsAt = new Date(startsAt.getTime() + sessionType.duration_minutes * 60_000);
    const { data: rules } = await supabase.from("availability_rules").select("*").eq("is_active", true);
    if (
      !isWithinAvailability(startsAt, endsAt, rules ?? [], env.STUDIO_TIMEZONE)
    ) {
      return NextResponse.json(
        { error: "That time is outside studio hours (Monday–Saturday, 9:00 a.m.–6:00 p.m. Chicago time)." },
        { status: 400 },
      );
    }
    const { data: conflicts } = await supabase
      .from("bookings")
      .select("id")
      .lt("starts_at", endsAt.toISOString())
      .gt("ends_at", startsAt.toISOString())
      .in("status", ["pending", "confirmed"]);
    if (conflicts && conflicts.length > 0) {
      return NextResponse.json({ error: "That time is already booked." }, { status: 409 });
    }

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        session_type_id: sessionType.id,
        guest_name: parsed.data.guestName,
        guest_email: parsed.data.guestEmail,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        status: "pending",
        notes: parsed.data.notes,
      })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await sendTransactionalEmail({
      templateKey: "booking_requested",
      to: [parsed.data.guestEmail],
      subject: "Garden House booking request received",
      text: `Thanks ${parsed.data.guestName}. We received your ${sessionType.name} request for ${startsAt.toISOString()}.`,
      dedupeKey: `booking-request-${data.id}`,
    });

    return NextResponse.json({ ok: true, id: data.id });
  } catch (error) {
    return jsonError(error);
  }
}
