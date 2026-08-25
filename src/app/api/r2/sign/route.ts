import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth/staff";
import { jsonError } from "@/lib/http";
import { getSignedUploadUrl } from "@/lib/integrations/r2";

export async function POST(request: NextRequest) {
  try {
    await requireStaff(request);
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Use /api/files for uploads." },
        { status: 400 },
      );
    }
    const formData = await request.formData();
    const filename = String(formData.get("filename") ?? "").trim();
    if (!filename) return NextResponse.json({ error: "Filename is required" }, { status: 400 });
    const signed = await getSignedUploadUrl(`legacy/${Date.now()}-${filename}`);
    if (!signed) {
      return NextResponse.json({ error: "File storage is not connected yet." }, { status: 400 });
    }
    return NextResponse.json({ ok: true, ...signed });
  } catch (error) {
    return jsonError(error);
  }
}
