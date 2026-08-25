import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
  }
}

export function jsonError(error: unknown, fallbackStatus = 500) {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
  }
  const message = error instanceof Error ? error.message : "Unexpected error";
  return NextResponse.json({ error: message }, { status: fallbackStatus });
}

export function siteOrigin() {
  try {
    return new URL(env.NEXT_PUBLIC_SITE_URL).origin;
  } catch {
    return "http://localhost:3000";
  }
}

export function allowedOrigins() {
  const origins = new Set([siteOrigin(), "http://localhost:3000", "http://127.0.0.1:3000"]);
  return origins;
}

export function assertSameOrigin(request: Request) {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return;

  const originHeader = request.headers.get("origin");
  const allowed = allowedOrigins();
  if (originHeader) {
    if (!allowed.has(originHeader)) {
      throw new HttpError(403, "This request did not come from the Garden House site.", "csrf");
    }
    return;
  }

  const referer = request.headers.get("referer");
  if (!referer) {
    throw new HttpError(403, "This request is missing a trusted origin.", "csrf");
  }
  try {
    const refererOrigin = new URL(referer).origin;
    if (!allowed.has(refererOrigin)) {
      throw new HttpError(403, "This request did not come from the Garden House site.", "csrf");
    }
  } catch {
    throw new HttpError(403, "This request did not come from the Garden House site.", "csrf");
  }
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "local";
}
