import { describe, expect, it } from "vitest";
import { getPrayerProgress } from "./prayer";
import type { PrayerTimes } from "../types/content";

const cairoSchedule: PrayerTimes = {
  city: "Cairo",
  country: "Egypt",
  date: "08-10-2026",
  hijriDate: "27 ربيع الثاني 1448",
  method: "Egyptian General Authority of Survey",
  timezone: "Africa/Cairo",
  times: [
    { name: "Fajr", label: "الفجر", time: "05:00" },
    { name: "Sunrise", label: "الشروق", time: "06:30" },
    { name: "Dhuhr", label: "الظهر", time: "12:00" },
    { name: "Asr", label: "العصر", time: "15:30" },
    { name: "Maghrib", label: "المغرب", time: "18:00" },
    { name: "Isha", label: "العشاء", time: "19:30" },
  ],
};

describe("getPrayerProgress", () => {
  it("uses the selected city's timezone and skips sunrise as a prayer", () => {
    const result = getPrayerProgress(cairoSchedule, new Date("2026-10-08T08:15:00.000Z"));
    expect(result).toMatchObject({
      current: { name: "Fajr" },
      next: { name: "Dhuhr" },
      secondsUntilNext: 2700,
    });
  });

  it("wraps to Fajr after Isha", () => {
    const result = getPrayerProgress(cairoSchedule, new Date("2026-10-08T18:00:00.000Z"));
    expect(result).toMatchObject({
      current: { name: "Isha" },
      next: { name: "Fajr" },
      secondsUntilNext: 28800,
    });
  });

  it("treats Isha as current before Fajr and counts down to Fajr", () => {
    const result = getPrayerProgress(cairoSchedule, new Date("2026-10-08T01:00:00.000Z"));
    expect(result).toMatchObject({
      current: { name: "Isha" },
      next: { name: "Fajr" },
      secondsUntilNext: 3600,
    });
  });

  it("does not show a cached countdown for a different local day", () => {
    expect(getPrayerProgress(cairoSchedule, new Date("2026-10-09T12:00:00.000Z"))).toBeNull();
  });

  it("returns no countdown if a prayer time is malformed", () => {
    const invalidSchedule = {
      ...cairoSchedule,
      times: cairoSchedule.times.map((entry) =>
        entry.name === "Asr" ? { ...entry, time: "--:--" } : entry,
      ),
    };
    expect(getPrayerProgress(invalidSchedule, new Date())).toBeNull();
  });
});
