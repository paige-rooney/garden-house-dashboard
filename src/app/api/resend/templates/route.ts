import { NextResponse } from "next/server";

const templates = [
  { id: "contact-notification", name: "Contact Notification" },
  { id: "event-subscribe-notification", name: "Event Subscribe Notification" },
  { id: "contract-send-notification", name: "Contract Send Notification" },
];

export async function GET() {
  return NextResponse.json({ templates });
}
