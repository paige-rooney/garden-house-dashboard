import { NextResponse, type NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

const PUBLIC_PREFIXES = [
  "/admin/login",
  "/auth/callback",
  "/sign/",
  "/book",
  "/api/auth/login",
  "/api/auth/magic-link",
  "/api/auth/callback",
  "/api/contact",
  "/api/events",
  "/api/health",
  "/api/stripe/webhook",
  "/api/contracts/webhook",
  "/api/contracts/sign",
  "/api/contracts/view",
  "/api/bookings/public",
  "/api/calendar/oauth/callback",
];

function isPublicPath(pathname: string) {
  if (PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`) || pathname.startsWith(prefix))) {
    return true;
  }
  if (pathname.startsWith("/api/bookings/public")) return true;
  if (pathname.startsWith("/_next")) return true;
  return false;
}

function isAdminPage(pathname: string) {
  return pathname.startsWith("/admin") || pathname.startsWith("/studio-green-room");
}

function isPrivilegedApi(pathname: string) {
  return (
    pathname.startsWith("/api/dashboard") ||
    pathname.startsWith("/api/r2") ||
    pathname.startsWith("/api/files") ||
    pathname.startsWith("/api/staff") ||
    pathname.startsWith("/api/marketing") ||
    pathname.startsWith("/api/brand") ||
    pathname.startsWith("/api/calendar") ||
    pathname.startsWith("/api/bookings") && !pathname.startsWith("/api/bookings/public") ||
    pathname === "/api/contracts/send" ||
    pathname.startsWith("/api/resend")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { user, response } = await updateSupabaseSession(request);

  if (pathname === "/studio-green-room" || pathname === "/studio-green-room/") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/studio-green-room/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = user ? "/admin" : "/admin/login";
    return NextResponse.redirect(url);
  }

  if (isPublicPath(pathname) && pathname === "/admin/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  if ((isAdminPage(pathname) || isPrivilegedApi(pathname)) && !isPublicPath(pathname) && !user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/studio-green-room/:path*", "/api/:path*"],
};
