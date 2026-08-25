import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth/staff";
import { weekRange } from "@/lib/bookings/week-range";
import { jsonError } from "@/lib/http";
import { env } from "@/lib/env";
import { listGoogleCalendarEvents } from "@/lib/integrations/google-calendar";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { staff } = await requireStaff(request);
    const weekParam = request.nextUrl.searchParams.get("week");
    const anchor = weekParam && /^\d{4}-\d{2}-\d{2}$/.test(weekParam)
      ? new Date(`${weekParam}T12:00:00.000Z`)
      : new Date();
    const week = weekRange(anchor, env.STUDIO_TIMEZONE);

    try {
      const listed = await listGoogleCalendarEvents(week.timeMin, week.timeMax);
      return NextResponse.json({
        ...listed.connection,
        canReconnect: staff.role === "owner",
        week: {
          mondayKey: week.mondayKey,
          sundayKey: week.sundayKey,
          label: week.label,
          days: week.days,
        },
        events: listed.events,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load Google Calendar.";
      const needsReconnect = /expired|reconnect|not connected/i.test(message);
      return NextResponse.json({
        connected: false,
        needsReconnect,
        calendarId: env.GOOGLE_CALENDAR_ID ?? "primary",
        accountEmail: null,
        error: message,
        canReconnect: staff.role === "owner",
        week: {
          mondayKey: week.mondayKey,
          sundayKey: week.sundayKey,
          label: week.label,
          days: week.days,
        },
        events: [],
      });
    }
  } catch (error) {
    return jsonError(error);
  }
}
