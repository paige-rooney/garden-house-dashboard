import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

const SESSION_COOKIE = "gh_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

function sign(payload: string): string {
  return createHmac("sha256", env.ADMIN_SESSION_SECRET).update(payload).digest("hex");
}

export async function createAdminSession(): Promise<void> {
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = `admin:${exp}`;
  const sig = sign(payload);
  const value = Buffer.from(`${payload}.${sig}`).toString("base64url");

  const store = await cookies();
  store.set(SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function hasValidAdminSession(): Promise<boolean> {
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  if (!value) return false;

  try {
    const decoded = Buffer.from(value, "base64url").toString("utf8");
    const [payload, sig] = decoded.split(".");
    if (!payload || !sig) return false;

    const expectedSig = sign(payload);
    const left = Buffer.from(sig);
    const right = Buffer.from(expectedSig);
    if (left.length !== right.length || !timingSafeEqual(left, right)) return false;

    const [, expRaw] = payload.split(":");
    const exp = Number(expRaw);
    return Number.isFinite(exp) && exp > Date.now();
  } catch {
    return false;
  }
}
