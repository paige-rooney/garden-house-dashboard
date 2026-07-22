import { NextRequest, NextResponse } from "next/server";
import { getUpcomingEvents } from "@/lib/data/dashboard-data";

export async function GET(request: NextRequest) {
  const value = request.nextUrl.searchParams.get("window");
  const window = value === "threeMonths" ? "threeMonths" : "month";
  const events = await getUpcomingEvents(window);
  return NextResponse.json({ events });
}
