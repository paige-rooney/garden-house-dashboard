import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") return undefined;
    return value;
  }, schema.optional());

export const env = createEnv({
  server: {
    APP_ENV: z.enum(["development", "preview", "production"]).default("development"),
    OWNER_BOOTSTRAP_EMAIL: emptyToUndefined(z.string().email()),
    INTEGRATION_ENCRYPTION_KEY: emptyToUndefined(z.string().min(32)),
    SUPABASE_URL: emptyToUndefined(z.string().url()),
    SUPABASE_ANON_KEY: emptyToUndefined(z.string().min(1)),
    SUPABASE_SERVICE_ROLE_KEY: emptyToUndefined(z.string().min(1)),
    STRIPE_SECRET_KEY: emptyToUndefined(z.string().min(1)),
    STRIPE_WEBHOOK_SECRET: emptyToUndefined(z.string().min(1)),
    STRIPE_MODE: z.enum(["test", "live"]).default("test"),
    RESEND_API_KEY: emptyToUndefined(z.string().min(1)),
    RESEND_FROM: emptyToUndefined(z.string().email()),
    RESEND_CONTACT_TO: emptyToUndefined(z.string().email()),
    RESEND_EVENTS_LIST: emptyToUndefined(z.string().email()),
    EMAIL_SAFE_RECIPIENT: emptyToUndefined(z.string().email()),
    R2_ACCOUNT_ID: emptyToUndefined(z.string().min(1)),
    R2_ACCESS_KEY_ID: emptyToUndefined(z.string().min(1)),
    R2_SECRET_ACCESS_KEY: emptyToUndefined(z.string().min(1)),
    R2_BUCKET: emptyToUndefined(z.string().min(1)),
    R2_PUBLIC_BASE_URL: emptyToUndefined(z.string().url()),
    CONTRACTS_PROVIDER: z.enum(["studio", "dropbox_sign"]).default("studio"),
    DROPBOX_SIGN_API_KEY: emptyToUndefined(z.string().min(1)),
    GOOGLE_CLIENT_ID: emptyToUndefined(z.string().min(1)),
    GOOGLE_CLIENT_SECRET: emptyToUndefined(z.string().min(1)),
    GOOGLE_CALENDAR_ID: emptyToUndefined(z.string().min(1)),
    GOOGLE_REDIRECT_URI: emptyToUndefined(z.string().url()),
    STUDIO_TIMEZONE: z.string().default("America/Chicago"),
    ALLOW_DEBUG_ENDPOINTS: z.preprocess((value) => value === "true", z.boolean()).default(false),
    SENTRY_DSN: emptyToUndefined(z.string().url()),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
    NEXT_PUBLIC_SUPABASE_URL: emptyToUndefined(z.string().url()),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: emptyToUndefined(z.string().min(1)),
  },
  runtimeEnv: {
    APP_ENV: process.env.APP_ENV,
    OWNER_BOOTSTRAP_EMAIL: process.env.OWNER_BOOTSTRAP_EMAIL,
    INTEGRATION_ENCRYPTION_KEY: process.env.INTEGRATION_ENCRYPTION_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_MODE: process.env.STRIPE_MODE,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM: process.env.RESEND_FROM,
    RESEND_CONTACT_TO: process.env.RESEND_CONTACT_TO,
    RESEND_EVENTS_LIST: process.env.RESEND_EVENTS_LIST,
    EMAIL_SAFE_RECIPIENT: process.env.EMAIL_SAFE_RECIPIENT,
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET: process.env.R2_BUCKET,
    R2_PUBLIC_BASE_URL: process.env.R2_PUBLIC_BASE_URL,
    CONTRACTS_PROVIDER: process.env.CONTRACTS_PROVIDER,
    DROPBOX_SIGN_API_KEY: process.env.DROPBOX_SIGN_API_KEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALENDAR_ID: process.env.GOOGLE_CALENDAR_ID,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
    STUDIO_TIMEZONE: process.env.STUDIO_TIMEZONE,
    ALLOW_DEBUG_ENDPOINTS: process.env.ALLOW_DEBUG_ENDPOINTS,
    SENTRY_DSN: process.env.SENTRY_DSN,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
  },
});

export function isProductionRuntime() {
  return process.env.APP_ENV === "production";
}

export function supabasePublicConfig() {
  // Read process.env directly so the login page never touches t3 server-only keys.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}
