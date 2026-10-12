import type { CallWindow } from "./types";

export const CALL_WINDOWS: { id: CallWindow; label: string; hint: string }[] = [
  { id: "morning", label: "7:30–8:00 AM", hint: "Before the first job" },
  { id: "midday", label: "12:00–12:30 PM", hint: "Lunch window" },
  { id: "evening", label: "5:15–6:00 PM", hint: "Crews rolling back" },
];

const WINDOW_TIME: Record<CallWindow, string> = {
  morning: "7:42 AM",
  midday: "12:10 PM",
  evening: "5:28 PM",
};

export function windowTime(window: CallWindow) {
  return WINDOW_TIME[window];
}

type Parts = {
  weekday: string;
  hour: number;
  minute: number;
  year: number;
  month: number;
  day: number;
};

export function zonedParts(date: Date, timeZone: string): Parts {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hourCycle: "h23",
  });
  const map = Object.fromEntries(fmt.formatToParts(date).map((part) => [part.type, part.value]));
  return {
    weekday: map.weekday,
    hour: Number(map.hour),
    minute: Number(map.minute),
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
  };
}

function zoneOffsetMinutes(date: Date, timeZone: string) {
  const parts = zonedParts(date, timeZone);
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, 0);
  return Math.round((asUtc - date.getTime()) / 60000);
}

export function zonedTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
) {
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const offset = zoneOffsetMinutes(guess, timeZone);
  return new Date(guess.getTime() - offset * 60 * 1000);
}

export function isEmailWindow(date: Date, timeZone: string) {
  const parts = zonedParts(date, timeZone);
  if (!["Mon", "Tue", "Wed", "Thu"].includes(parts.weekday)) return false;
  const minutes = parts.hour * 60 + parts.minute;
  return minutes >= 6 * 60 + 45 && minutes <= 7 * 60 + 30;
}

export function nextEmailSlot(from = new Date(), timeZone = "America/New_York") {
  if (isEmailWindow(from, timeZone)) return from;
  const start = zonedParts(from, timeZone);
  for (let add = 0; add < 14; add += 1) {
    const noon = new Date(Date.UTC(start.year, start.month - 1, start.day + add, 16, 0, 0));
    const day = zonedParts(noon, timeZone);
    if (!["Mon", "Tue", "Wed", "Thu"].includes(day.weekday)) continue;
    const slot = zonedTimeToUtc(day.year, day.month, day.day, 6, 45, timeZone);
    if (slot.getTime() >= from.getTime() - 1000) return slot;
  }
  return from;
}

export function activeCallWindow(date = new Date(), timeZone = "America/New_York"): CallWindow | null {
  const parts = zonedParts(date, timeZone);
  const minutes = parts.hour * 60 + parts.minute;
  if (minutes >= 7 * 60 + 30 && minutes <= 8 * 60) return "morning";
  if (minutes >= 12 * 60 && minutes <= 12 * 60 + 30) return "midday";
  if (minutes >= 17 * 60 + 15 && minutes <= 18 * 60) return "evening";
  return null;
}

export function formatWhen(value: string | Date, timeZone = "America/New_York") {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function weekdayName(value: string | Date, timeZone = "America/New_York") {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-US", { timeZone, weekday: "long" }).format(date);
}
