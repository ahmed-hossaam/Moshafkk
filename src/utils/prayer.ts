import type { PrayerTimeEntry, PrayerTimes } from "../types/content";

interface ZonedClock {
  hour: number;
  minute: number;
  second: number;
}

export interface PrayerProgress {
  current: PrayerTimeEntry;
  next: PrayerTimeEntry;
  secondsUntilNext: number;
}

function getZonedClock(date: Date, timeZone: string): ZonedClock {
  const options: Intl.DateTimeFormatOptions = {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  };
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat("en-GB", options).formatToParts(date);
  } catch {
    parts = new Intl.DateTimeFormat("en-GB", {
      ...options,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }).formatToParts(date);
  }
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");
  return { hour: value("hour"), minute: value("minute"), second: value("second") };
}

function parsePrayerTime(entry: PrayerTimeEntry): number | null {
  const match = /^(\d{1,2}):(\d{2})(?:\s*\([^)]*\))?$/.exec(entry.time.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

export function isPrayerDateToday(prayerTimes: PrayerTimes, now = new Date()): boolean {
  const dateMatch = /^(\d{2})-(\d{2})-(\d{4})$/.exec(prayerTimes.date);
  if (!dateMatch) return false;

  const expected = {
    day: Number(dateMatch[1]),
    month: Number(dateMatch[2]),
    year: Number(dateMatch[3]),
  };
  const options: Intl.DateTimeFormatOptions = {
    timeZone: prayerTimes.timezone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat("en-GB", options).formatToParts(now);
  } catch {
    parts = new Intl.DateTimeFormat("en-GB", {
      ...options,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }).formatToParts(now);
  }
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");
  return (
    value("day") === expected.day &&
    value("month") === expected.month &&
    value("year") === expected.year
  );
}

export function getPrayerProgress(
  prayerTimes: PrayerTimes,
  now = new Date(),
): PrayerProgress | null {
  if (!isPrayerDateToday(prayerTimes, now)) return null;

  const dailyPrayers = prayerTimes.times
    .filter((entry) => entry.name !== "Sunrise")
    .map((entry) => ({ entry, minute: parsePrayerTime(entry) }))
    .filter((item): item is { entry: PrayerTimeEntry; minute: number } => item.minute !== null)
    .sort((first, second) => first.minute - second.minute);

  if (dailyPrayers.length !== 5) return null;

  const clock = getZonedClock(now, prayerTimes.timezone);
  const nowInMinutes = clock.hour * 60 + clock.minute;
  const nextIndex = dailyPrayers.findIndex((prayer) => prayer.minute > nowInMinutes);
  const currentIndex =
    nextIndex === -1 || nextIndex === 0 ? dailyPrayers.length - 1 : nextIndex - 1;
  const selectedNext = nextIndex === -1 ? dailyPrayers[0] : dailyPrayers[nextIndex];
  const current = dailyPrayers[currentIndex]?.entry;
  const next = selectedNext?.entry;

  if (!current || !next || !selectedNext) return null;

  const nowInSeconds = nowInMinutes * 60 + clock.second;
  const nextInSeconds = selectedNext.minute * 60;
  const secondsUntilNext = (nextInSeconds - nowInSeconds + 24 * 60 * 60) % (24 * 60 * 60);

  return { current, next, secondsUntilNext };
}
