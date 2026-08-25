const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function chicagoDateKey(date: Date, timeZone = "America/Chicago") {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function addDateKeyDays(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const utc = new Date(Date.UTC(year, (month ?? 1) - 1, (day ?? 1) + days));
  return utc.toISOString().slice(0, 10);
}

function wallTimeAsUtcMs(year: number, month: number, day: number, hour: number, minute: number) {
  return Date.UTC(year, month - 1, day, hour, minute, 0);
}

export function zonedDateTimeToUtc(dateKey: string, timeHHmm: string, timeZone: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const [hour, minute] = timeHHmm.split(":").map(Number);
  const desiredWall = wallTimeAsUtcMs(year ?? 0, month ?? 1, day ?? 1, hour ?? 0, minute ?? 0);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const wallOf = (instant: number) => {
    const parts = formatter.formatToParts(new Date(instant));
    const get = (type: Intl.DateTimeFormatPartTypes) =>
      Number(parts.find((part) => part.type === type)?.value ?? 0);
    return wallTimeAsUtcMs(get("year"), get("month"), get("day"), get("hour"), get("minute"));
  };

  let instant = desiredWall;
  for (let i = 0; i < 3; i += 1) {
    instant = desiredWall - (wallOf(instant) - instant);
  }
  return new Date(instant);
}

export function startOfWeekDateKey(date: Date, timeZone = "America/Chicago") {
  const dateKey = chicagoDateKey(date, timeZone);
  const weekdayName = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(date);
  const weekday = WEEKDAY_SHORT.indexOf(weekdayName as (typeof WEEKDAY_SHORT)[number]);
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  return addDateKeyDays(dateKey, mondayOffset);
}

export type WeekDay = {
  dateKey: string;
  weekday: string;
  dayNumber: string;
  isToday: boolean;
};

export type WeekRange = {
  mondayKey: string;
  sundayKey: string;
  label: string;
  timeMin: Date;
  timeMax: Date;
  days: WeekDay[];
};

export function weekRange(anchor: Date, timeZone = "America/Chicago"): WeekRange {
  const mondayKey = startOfWeekDateKey(anchor, timeZone);
  const sundayKey = addDateKeyDays(mondayKey, 6);
  const todayKey = chicagoDateKey(new Date(), timeZone);
  const days: WeekDay[] = Array.from({ length: 7 }, (_, index) => {
    const dateKey = addDateKeyDays(mondayKey, index);
    return {
      dateKey,
      weekday: WEEKDAY_SHORT[(index + 1) % 7] ?? "",
      dayNumber: String(Number(dateKey.slice(8))),
      isToday: dateKey === todayKey,
    };
  });
  const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" });
  const mondayDate = new Date(`${mondayKey}T00:00:00.000Z`);
  const sundayDate = new Date(`${sundayKey}T00:00:00.000Z`);
  const sameMonth = mondayKey.slice(0, 7) === sundayKey.slice(0, 7);
  const label = sameMonth
    ? `${monthFormatter.format(mondayDate)} ${Number(mondayKey.slice(8))}–${Number(sundayKey.slice(8))}, ${mondayKey.slice(0, 4)}`
    : `${monthFormatter.format(mondayDate)} ${Number(mondayKey.slice(8))} – ${monthFormatter.format(sundayDate)} ${Number(sundayKey.slice(8))}, ${sundayKey.slice(0, 4)}`;

  return {
    mondayKey,
    sundayKey,
    label,
    timeMin: zonedDateTimeToUtc(mondayKey, "00:00", timeZone),
    timeMax: zonedDateTimeToUtc(addDateKeyDays(mondayKey, 7), "00:00", timeZone),
    days,
  };
}

export function shiftWeek(mondayKey: string, weeks: number) {
  return addDateKeyDays(mondayKey, weeks * 7);
}
