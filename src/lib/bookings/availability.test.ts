import { describe, expect, it } from "vitest";
import { isWithinAvailability } from "@/lib/bookings/availability";

const rules = [1, 2, 3, 4, 5, 6].map((weekday) => ({
  weekday,
  start_time: "09:00:00",
  end_time: "18:00:00",
  is_active: true,
}));

describe("studio hours", () => {
  it("allows a weekday 9am start in Chicago", () => {
    const start = new Date("2026-08-24T14:00:00.000Z"); // Monday 9am CDT
    const end = new Date("2026-08-24T17:00:00.000Z");
    expect(isWithinAvailability(start, end, rules, "America/Chicago")).toBe(true);
  });

  it("rejects Sunday", () => {
    const start = new Date("2026-08-23T14:00:00.000Z");
    const end = new Date("2026-08-23T17:00:00.000Z");
    expect(isWithinAvailability(start, end, rules, "America/Chicago")).toBe(false);
  });

  it("rejects a session that would run past 6pm", () => {
    const start = new Date("2026-08-24T22:00:00.000Z"); // Monday 5pm CDT
    const end = new Date("2026-08-25T01:00:00.000Z"); // 8pm CDT
    expect(isWithinAvailability(start, end, rules, "America/Chicago")).toBe(false);
  });
});
