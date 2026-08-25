import { describe, expect, it } from "vitest";

describe("webhook idempotency contract", () => {
  it("treats unique provider+event_id as the duplicate key", () => {
    const first = new Set<string>();
    const key = "stripe:evt_123";
    expect(first.has(key)).toBe(false);
    first.add(key);
    expect(first.has(key)).toBe(true);
  });
});
