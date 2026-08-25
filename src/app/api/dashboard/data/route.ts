import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth/staff";
import { getDashboardData } from "@/lib/data/dashboard-data";
import { jsonError } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireStaff(request);
    const data = await getDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    return jsonError(error);
  }
}
