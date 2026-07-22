import { NextRequest, NextResponse } from "next/server";
import { getSignedUploadUrl } from "@/lib/integrations/r2";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const filename = String(formData.get("filename") ?? "").trim();
  if (!filename) {
    return NextResponse.json({ error: "Filename is required" }, { status: 400 });
  }

  const key = `uploads/${Date.now()}-${filename}`;
  const signed = await getSignedUploadUrl(key);
  if (!signed) {
    return NextResponse.json({
      ok: true,
      demo: true,
      key,
      message: "R2 not configured yet",
    });
  }
  return NextResponse.json({ ok: true, ...signed });
}
