import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { requireStaff } from "@/lib/auth/staff";
import { assertAllowedUpload, buildObjectKey } from "@/lib/files";
import { jsonError } from "@/lib/http";
import { getSignedDownloadUrl, getSignedUploadUrl, r2Configured } from "@/lib/integrations/r2";
import { writeAudit } from "@/lib/security/audit";
import { getSupabaseServiceClient } from "@/lib/supabase/admin";
import { completeUploadSchema, signUploadSchema } from "@/lib/validators/forms";

export async function POST(request: NextRequest) {
  try {
    const { staff } = await requireStaff(request);
    if (!r2Configured()) {
      return NextResponse.json(
        { error: "File storage is not connected yet. Add Cloudflare R2 keys in hosting settings." },
        { status: 400 },
      );
    }
    const parsed = signUploadSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: "Choose a valid file to upload." }, { status: 400 });
    assertAllowedUpload({ mimeType: parsed.data.mimeType, byteSize: parsed.data.byteSize });
    const key = buildObjectKey({
      environment: env.APP_ENV,
      purpose: parsed.data.purpose,
      clientId: parsed.data.clientId,
      projectId: parsed.data.projectId,
      fileName: parsed.data.fileName,
    });
    const signed = await getSignedUploadUrl(key, parsed.data.mimeType);
    if (!signed) return NextResponse.json({ error: "Could not prepare the upload." }, { status: 500 });
    await writeAudit({
      actorId: staff.id,
      actorEmail: staff.email,
      action: "file.sign_upload",
      entityType: "file",
      entityId: key,
    });
    return NextResponse.json({ ok: true, ...signed });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { staff } = await requireStaff(request);
    const parsed = completeUploadSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: "Upload could not be saved." }, { status: 400 });
    const supabase = getSupabaseServiceClient();
    if (!supabase) return NextResponse.json({ error: "Database is unavailable." }, { status: 503 });

    if (parsed.data.purpose === "brand") {
      const { data, error } = await supabase
        .from("brand_assets")
        .insert({
          name: parsed.data.name || parsed.data.fileName,
          category: parsed.data.category || "other",
          r2_key: parsed.data.key,
          mime_type: parsed.data.mimeType,
          byte_size: parsed.data.byteSize,
          visibility: parsed.data.visibility,
          uploaded_by: staff.id,
        })
        .select("id")
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, id: data.id });
    }

    if (parsed.data.purpose === "marketing") {
      const { data, error } = await supabase
        .from("marketing_assets")
        .insert({
          name: parsed.data.name || parsed.data.fileName,
          r2_key: parsed.data.key,
          media_type: parsed.data.mimeType,
          mime_type: parsed.data.mimeType,
          byte_size: parsed.data.byteSize,
          visibility: parsed.data.visibility,
        })
        .select("id")
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, id: data.id });
    }

    if (!parsed.data.projectId) {
      return NextResponse.json({ error: "Choose a project before uploading a client file." }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("project_files")
      .insert({
        project_id: parsed.data.projectId,
        client_id: parsed.data.clientId ?? null,
        file_name: parsed.data.fileName,
        file_key: parsed.data.key,
        file_type: parsed.data.mimeType,
        mime_type: parsed.data.mimeType,
        byte_size: parsed.data.byteSize,
        visibility: parsed.data.visibility,
        purpose: parsed.data.purpose,
        uploaded_by: staff.id,
        environment: env.APP_ENV,
      })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, id: data.id });
  } catch (error) {
    return jsonError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireStaff(request);
    const key = new URL(request.url).searchParams.get("key");
    const projectId = new URL(request.url).searchParams.get("projectId");
    if (!key) return NextResponse.json({ error: "Missing file." }, { status: 400 });
    const supabase = getSupabaseServiceClient();
    if (supabase && projectId) {
      const { data } = await supabase
        .from("project_files")
        .select("id, project_id")
        .eq("file_key", key)
        .eq("project_id", projectId)
        .maybeSingle();
      if (!data) return NextResponse.json({ error: "That file does not belong to this project." }, { status: 403 });
    }
    const signed = await getSignedDownloadUrl(key);
    if (!signed) return NextResponse.json({ error: "Could not prepare the download." }, { status: 400 });
    return NextResponse.json(signed);
  } catch (error) {
    return jsonError(error);
  }
}
