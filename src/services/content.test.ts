import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getAzkar,
  getDuas,
  getHadithPage,
  getPrayerTimes,
  getSurah,
  getSurahs,
  getTafsir,
} from "./content";

function response(payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("content services", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loads surah metadata and falls back to the preserved local list", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        response({
          code: 200,
          data: {
            surahs: {
              references: [
                {
                  number: 1,
                  name: "سُورَةُ ٱلْفَاتِحَةِ",
                  englishName: "Al-Faatiha",
                  englishNameTranslation: "The Opening",
                  numberOfAyahs: 7,
                  revelationType: "Meccan",
                },
              ],
            },
          },
        }),
      ),
    );
    await expect(getSurahs()).resolves.toMatchObject({
      source: "network",
      data: [{ number: 1, numberOfAyahs: 7 }],
    });

    localStorage.removeItem("moshafk:v1:quran:meta");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    const fallback = await getSurahs();
    expect(fallback.source).toBe("local");
    expect(fallback.data).toHaveLength(114);
    expect(fallback.data[0]?.name).toBe("سورة الفاتحة");
  });

  it("returns exact ayah text from the requested Quran surah", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        response({
          code: 200,
          data: {
            number: 1,
            name: "سُورَةُ ٱلْفَاتِحَةِ",
            englishName: "Al-Faatiha",
            englishNameTranslation: "The Opening",
            numberOfAyahs: 1,
            revelationType: "Meccan",
            ayahs: [
              { number: 1, numberInSurah: 1, text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" },
            ],
          },
        }),
      ),
    );
    await expect(getSurah(1)).resolves.toMatchObject({
      source: "network",
      data: {
        number: 1,
        ayahs: [{ numberInSurah: 1, text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" }],
      },
    });
  });

  it("keeps the hadith collection, number, and Arabic text together", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        response({
          name: "Abu Dawud",
          total: 4419,
          pagination: { totalPages: 111 },
          items: [{ number: 1, arab: "نص الحديث العربي" }],
        }),
      ),
    );
    await expect(getHadithPage(1)).resolves.toMatchObject({
      data: {
        page: 1,
        items: [
          {
            id: "abu-dawud-1",
            number: 1,
            text: "نص الحديث العربي",
            collection: "سنن أبي داود",
          },
        ],
      },
    });
  });

  it("flattens the source format without changing Dua or Dhikr wording", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        response({
          "أدعية قرآنية": [
            [
              {
                category: "أدعية قرآنية",
                count: "3",
                description: "source description",
                reference: "source reference",
                content: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً",
              },
            ],
          ],
          "أذكار الصباح": [
            {
              category: "أذكار الصباح",
              content: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ",
            },
          ],
        }),
      ),
    );

    await expect(getDuas()).resolves.toMatchObject({
      data: [
        {
          text: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً",
          reference: "source reference",
        },
      ],
    });
    await expect(getAzkar("أذكار الصباح")).resolves.toMatchObject({
      data: [{ count: null, text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ" }],
    });
  });

  it("uses the Egyptian prayer calculation method and preserves both dates", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      response({
        code: 200,
        data: {
          timings: {
            Fajr: "05:00",
            Sunrise: "06:30",
            Dhuhr: "12:00",
            Asr: "15:30",
            Maghrib: "18:00",
            Isha: "19:30",
          },
          date: {
            readable: "08 Oct 2026",
            gregorian: { date: "08-10-2026" },
            hijri: { day: "27", month: { ar: "ربيع الثاني" }, year: "1448" },
          },
          meta: {
            method: { name: "Egyptian General Authority of Survey" },
            timezone: "Africa/Cairo",
          },
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await getPrayerTimes("Cairo", "Egypt");
    expect(new URL(String(fetchMock.mock.calls[0]?.[0])).searchParams.get("method")).toBe("5");
    expect(result.data).toMatchObject({
      hijriDate: "27 ربيع الثاني 1448",
      method: "Egyptian General Authority of Survey",
      timezone: "Africa/Cairo",
    });
    expect(result.data.times).toHaveLength(6);
    expect(result.data.times[0]).toEqual({ name: "Fajr", label: "الفجر", time: "05:00" });
  });

  it("pairs the Arabic Quran text with al-Muyassar from the verified edition endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((input: RequestInfo | URL) => {
        const url = String(input);
        if (url.endsWith("/ar.muyassar")) {
          return Promise.resolve(
            response({
              code: 200,
              data: {
                number: 1,
                name: "سُورَةُ ٱلْفَاتِحَةِ",
                englishName: "Al-Faatiha",
                englishNameTranslation: "The Opening",
                numberOfAyahs: 1,
                revelationType: "Meccan",
                ayahs: [{ number: 1, numberInSurah: 1, text: "تفسير ميسر موثوق المصدر" }],
              },
            }),
          );
        }
        return Promise.resolve(
          response({
            code: 200,
            data: {
              number: 1,
              name: "سُورَةُ ٱلْفَاتِحَةِ",
              englishName: "Al-Faatiha",
              englishNameTranslation: "The Opening",
              numberOfAyahs: 1,
              revelationType: "Meccan",
              ayahs: [{ number: 1, numberInSurah: 1, text: "نص الآية" }],
            },
          }),
        );
      }),
    );

    await expect(getTafsir(1)).resolves.toMatchObject({
      source: "network",
      data: [
        {
          numberInSurah: 1,
          arabicText: "نص الآية",
          translation: "تفسير ميسر موثوق المصدر",
        },
      ],
    });
  });
});
