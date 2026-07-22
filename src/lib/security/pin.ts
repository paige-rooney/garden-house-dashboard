import { createHash, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

function hashWithSalt(pin: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${pin}`).digest("hex");
}

export function isValidPinFormat(pin: string): boolean {
  return /^\d{6}$/.test(pin);
}

export function verifyPin(pin: string): boolean {
  if (!isValidPinFormat(pin)) return false;

  const fallbackHash = hashWithSalt("246810", env.ADMIN_PIN_SALT);
  const expected = env.ADMIN_PIN_HASH || fallbackHash;
  const actual = hashWithSalt(pin, env.ADMIN_PIN_SALT);

  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(actual);
  if (expectedBuf.length !== actualBuf.length) return false;

  return timingSafeEqual(expectedBuf, actualBuf);
}
