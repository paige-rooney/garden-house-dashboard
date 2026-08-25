import { env, isProductionRuntime } from "@/lib/env";
import { hasMinRole, type StaffRole } from "@/lib/auth/roles";
import { HttpError, assertSameOrigin } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceClient } from "@/lib/supabase/admin";

export type StaffUser = {
  id: string;
  email: string;
  fullName: string;
  role: StaffRole;
  status: "active" | "disabled";
};

export async function getSessionUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

async function ensureStaffProfile(user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }) {
  const email = user.email?.toLowerCase();
  if (!email) {
    throw new HttpError(403, "This account has no email address.", "no_email");
  }

  const admin = getSupabaseServiceClient();
  if (!admin) {
    throw new HttpError(503, "The studio database is unavailable. Try again in a few minutes.", "db");
  }

  const existing = await admin.from("staff_profiles").select("*").eq("id", user.id).maybeSingle();
  if (existing.data) {
    if (existing.data.status !== "active") {
      throw new HttpError(403, "This staff account is disabled.", "disabled");
    }
    return existing.data as { id: string; email: string; full_name: string; role: StaffRole; status: string };
  }
  if (existing.error && !existing.error.message.includes("staff_profiles")) {
    // continue to count check; missing table is handled below
  }

  const { count, error: countError } = await admin
    .from("staff_profiles")
    .select("id", { count: "exact", head: true });

  if (countError) {
    throw new HttpError(
      503,
      "The studio database is missing required updates. Run the latest SQL migration in Supabase, then try again.",
      "migration",
    );
  }

  const invite = await admin
    .from("staff_invites")
    .select("*")
    .ilike("email", email)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  const bootstrapEmail = env.OWNER_BOOTSTRAP_EMAIL?.toLowerCase();
  const noStaffYet = (count ?? 0) === 0;
  const allowedBootstrap =
    noStaffYet &&
    (bootstrapEmail ? bootstrapEmail === email : !isProductionRuntime());

  if (!invite.data && !allowedBootstrap) {
    throw new HttpError(403, "This email is not invited to the Garden House dashboard.", "not_invited");
  }

  const role = (invite.data?.role as StaffRole | undefined) ?? "owner";
  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : email.split("@")[0] ?? "Staff";

  const inserted = await admin
    .from("staff_profiles")
    .insert({
      id: user.id,
      email,
      full_name: fullName,
      role,
      status: "active",
    })
    .select("*")
    .single();

  if (inserted.error || !inserted.data) {
    throw new HttpError(500, inserted.error?.message ?? "Could not create staff profile.", "profile");
  }

  if (invite.data) {
    await admin
      .from("staff_invites")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invite.data.id);
  }

  return inserted.data as { id: string; email: string; full_name: string; role: StaffRole; status: string };
}

export async function requireStaff(request: Request, options?: { minRole?: StaffRole; mutate?: boolean }) {
  if (options?.mutate !== false && !["GET", "HEAD", "OPTIONS"].includes(request.method.toUpperCase())) {
    assertSameOrigin(request);
  }

  const user = await getSessionUser();
  if (!user) {
    throw new HttpError(401, "Please sign in to continue.", "unauthenticated");
  }

  const profileRow = await ensureStaffProfile(user);
  const role = profileRow.role as StaffRole;
  if (options?.minRole && !hasMinRole(role, options.minRole)) {
    throw new HttpError(403, "You do not have permission for this action.", "forbidden");
  }

  return {
    user,
    staff: {
      id: profileRow.id,
      email: profileRow.email,
      fullName: String(profileRow.full_name ?? ""),
      role,
      status: profileRow.status as "active" | "disabled",
    } satisfies StaffUser,
  };
}
