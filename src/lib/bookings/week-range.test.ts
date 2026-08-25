import { describe, expect, it } from "vitest";
import { startOfWeekDateKey, weekRange, zonedDateTimeToUtc } from "@/lib/bookings/week-range";

describe("week range in Chicago", () => {
  it("maps CDT midnight to 05:00 UTC", () => {
    expect(zonedDateTimeToUtc("2026-08-25", "00:00", "America/Chicago").toISOString()).toBe(
      "2026-08-25T05:00:00.000Z",
    );
  });

  it("maps CST midnight to 06:00 UTC", () => {
    expect(zonedDateTimeToUtc("2026-01-15", "00:00", "America/Chicago").toISOString()).toBe(
      "2026-01-15T06:00:00.000Z",
    );
  });

  it("starts the week on Monday for a Tuesday", () => {
    const tuesdayAfternoonCdt = new Date("2026-08-25T18:00:00.000Z");
    expect(startOfWeekDateKey(tuesdayAfternoonCdt, "America/Chicago")).toBe("2026-08-24");
    const week = weekRange(tuesdayAfternoonCdt, "America/Chicago");
    expect(week.days.map((day) => day.dateKey)).toEqual([
      "2026-08-24",
      "2026-08-25",
      "2026-08-26",
      "2026-08-27",
      "2026-08-28",
      "2026-08-29",
      "2026-08-30",
    ]);
    expect(week.timeMin.toISOString()).toBe("2026-08-24T05:00:00.000Z");
    expect(week.timeMax.toISOString()).toBe("2026-08-31T05:00:00.000Z");
  });
});
