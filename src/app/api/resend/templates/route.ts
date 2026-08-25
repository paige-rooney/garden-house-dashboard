import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth/staff";
import { jsonError } from "@/lib/http";

const templates = [
  { id: "contact-notification", name: "Contact Notification" },
  { id: "event-subscribe-notification", name: "Event Subscribe Notification" },
  { id: "contract-send-notification", name: "Contract Send Notification" },
  { id: "booking-confirmed", name: "Booking Confirmation" },
  { id: "booking-cancelled", name: "Booking Cancellation" },
];

export async function GET(request: NextRequest) {
  try {
    await requireStaff(request);
    return NextResponse.json({ templates });
  } catch (error) {
    return jsonError(error);
  }
}
