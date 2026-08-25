export type AvailabilityRule = {
  weekday: number;
  start_time: string;
  end_time: string;
  is_active?: boolean | null;
};

const WEEKDAY: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

export function zonedWeekdayAndMinutes(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    weekday: WEEKDAY[get("weekday")] ?? -1,
    minutes: timeToMinutes(`${get("hour")}:${get("minute")}`),
  };
}

export function isWithinAvailability(
  startsAt: Date,
  endsAt: Date,
  rules: AvailabilityRule[],
  timeZone: string,
) {
  const start = zonedWeekdayAndMinutes(startsAt, timeZone);
  const end = zonedWeekdayAndMinutes(endsAt, timeZone);
  if (start.weekday < 0 || start.weekday !== end.weekday) return false;
  const rule = rules.find((item) => item.weekday === start.weekday && item.is_active !== false);
  if (!rule) return false;
  return start.minutes >= timeToMinutes(rule.start_time) && end.minutes <= timeToMinutes(rule.end_time);
}
