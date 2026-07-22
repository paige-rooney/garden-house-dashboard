import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "gh_admin_session";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (!path.startsWith("/studio-green-room/dashboard")) {
    return NextResponse.next();
  }

  const session = request.cookies.get(SESSION_COOKIE)?.value;
  if (!session) {
    return NextResponse.redirect(new URL("/studio-green-room", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/studio-green-room/dashboard/:path*"],
};
