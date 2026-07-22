import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") return undefined;
    return value;
  }, schema.optional());

export const env = createEnv({
  server: {
    ADMIN_SECRET_SLUG: z.string().min(3).default("studio-green-room"),
    ADMIN_PIN_HASH: z.string().default(""),
    ADMIN_PIN_SALT: z.string().default("gh-demo-salt"),
    ADMIN_SESSION_SECRET: z.string().min(12).default("dev-only-change-me"),
    SUPABASE_URL: emptyToUndefined(z.string().url()),
    SUPABASE_ANON_KEY: emptyToUndefined(z.string().min(1)),
    SUPABASE_SERVICE_ROLE_KEY: emptyToUndefined(z.string().min(1)),
    STRIPE_SECRET_KEY: emptyToUndefined(z.string().min(1)),
    STRIPE_WEBHOOK_SECRET: emptyToUndefined(z.string().min(1)),
    RESEND_API_KEY: emptyToUndefined(z.string().min(1)),
    RESEND_FROM: emptyToUndefined(z.string().email()),
    RESEND_CONTACT_TO: emptyToUndefined(z.string().email()),
    RESEND_EVENTS_LIST: emptyToUndefined(z.string().email()),
    R2_ACCOUNT_ID: emptyToUndefined(z.string().min(1)),
    R2_ACCESS_KEY_ID: emptyToUndefined(z.string().min(1)),
    R2_SECRET_ACCESS_KEY: emptyToUndefined(z.string().min(1)),
    R2_BUCKET: emptyToUndefined(z.string().min(1)),
    R2_PUBLIC_BASE_URL: emptyToUndefined(z.string().url()),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  },
  runtimeEnv: {
    ADMIN_SECRET_SLUG: process.env.ADMIN_SECRET_SLUG,
    ADMIN_PIN_HASH: process.env.ADMIN_PIN_HASH,
    ADMIN_PIN_SALT: process.env.ADMIN_PIN_SALT,
    ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM: process.env.RESEND_FROM,
    RESEND_CONTACT_TO: process.env.RESEND_CONTACT_TO,
    RESEND_EVENTS_LIST: process.env.RESEND_EVENTS_LIST,
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET: process.env.R2_BUCKET,
    R2_PUBLIC_BASE_URL: process.env.R2_PUBLIC_BASE_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
});
