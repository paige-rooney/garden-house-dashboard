import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "PIN login has been removed. Sign in at /admin/login with your staff email." },
    { status: 410 },
  );
}
