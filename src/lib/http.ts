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

function originFromHost(host: string | undefined) {
  if (!host) return null;
  try {
    return new URL(host.includes("://") ? host : `https://${host}`).origin;
  } catch {
    return null;
  }
}

export function siteOrigin() {
  try {
    return new URL(env.NEXT_PUBLIC_SITE_URL).origin;
  } catch {
    return "http://localhost:3000";
  }
}

/** Origin for links we send or show (signing pages, etc.). Prefer this request's host on Vercel previews. */
export function publicAppOrigin(request: Request) {
  try {
    const origin = new URL(request.url).origin;
    if (origin && origin !== "null") return origin;
  } catch {
    // fall through
  }
  return (
    originFromHost(process.env.VERCEL_BRANCH_URL) ||
    originFromHost(process.env.VERCEL_URL) ||
    siteOrigin()
  );
}

export function allowedOrigins(request?: Request) {
  const origins = new Set([siteOrigin(), "http://localhost:3000", "http://127.0.0.1:3000"]);

  for (const host of [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]) {
    const origin = originFromHost(host);
    if (origin) origins.add(origin);
  }

  if (request) {
    try {
      origins.add(new URL(request.url).origin);
    } catch {
      // Ignore malformed request URLs; the allowlist above still applies.
    }
  }

  return origins;
}

export function assertSameOrigin(request: Request) {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return;

  const originHeader = request.headers.get("origin");
  const allowed = allowedOrigins(request);
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
