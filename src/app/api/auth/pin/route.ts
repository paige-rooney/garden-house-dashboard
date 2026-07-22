import { NextRequest, NextResponse } from "next/server";
import { verifyPin } from "@/lib/security/pin";
import { createAdminSession } from "@/lib/security/session";

const attempts = new Map<string, { count: number; last: number }>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return "local";
}

function isRateLimited(ip: string): boolean {
  const current = attempts.get(ip);
  if (!current) return false;
  if (Date.now() - current.last > 60_000) {
    attempts.delete(ip);
    return false;
  }
  return current.count >= 5;
}

function addAttempt(ip: string): void {
  const current = attempts.get(ip);
  if (!current) {
    attempts.set(ip, { count: 1, last: Date.now() });
    return;
  }
  attempts.set(ip, { count: current.count + 1, last: Date.now() });
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const pin = String(body.pin ?? "");
  if (!verifyPin(pin)) {
    addAttempt(ip);
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }

  await createAdminSession();
  attempts.delete(ip);
  return NextResponse.json({ ok: true });
}
