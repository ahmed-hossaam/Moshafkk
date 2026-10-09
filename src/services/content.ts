import legacySurahData from "../../JS/JSON/main.json";
import { fetchResource, localResource } from "./cache";
import type {
  Dhikr,
  Dua,
  HadithPage,
  PrayerTimes,
  Resource,
  Surah,
  SurahContent,
  TafsirAyah,
} from "../types/content";

interface QuranMetaResponse {
  code: number;
  data: { surahs: { references: Surah[] } };
}

interface QuranSurahResponse {
  code: number;
  data: Surah & {
    ayahs: Array<{ number: number; numberInSurah: number; text: string }>;
  };
}

interface LegacySurah {
  id: string;
  number: string;
  name_ar: string;
  name_en: string;
  name_en_translation: string;
  type: string;
}

interface RawHadithResponse {
  name: string;
  total: number;
  pagination: { totalPages: number };
  items: Array<{ number: number; arab: string; id?: string }>;
}

type RawSupplication = {
  category: string;
  count?: string | number;
  description?: string;
  reference?: string;
  content: string;
};
type RawSupplicationEntry = RawSupplication | RawSupplicationEntry[];
type RawSupplicationData = Record<string, RawSupplicationEntry[]>;

interface PrayerApiResponse {
  code: number;
  data: {
    timings: Record<string, string>;
    date: {
      readable: string;
      hijri: { day: string; month: { ar: string }; year: string };
      gregorian: { date: string };
    };
    meta: { method: { name: string }; timezone: string };
  };
}

const QURAN_API = "https://api.alquran.cloud/v1";
const SUPPLICATIONS_URL =
  "https://raw.githubusercontent.com/nawafalqari/azkar-api/56df51279ab6eb86dc2f6202c7de26c8948331c1/azkar.json";
const HADITH_URL = "https://hadis-api-id.vercel.app/hadith/abu-dawud";
const PRAYER_URL = "https://api.aladhan.com/v1/timingsByCity";
export const prayerCalculationMethods = [
  { id: "5", label: "الهيئة المصرية العامة للمساحة" },
  { id: "3", label: "رابطة العالم الإسلامي" },
  { id: "2", label: "الجمعية الإسلامية لأمريكا الشمالية" },
  { id: "4", label: "جامعة أم القرى" },
  { id: "8", label: "طريقة منطقة الخليج" },
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSurahMetadata(value: unknown): value is Surah {
  return (
    isRecord(value) &&
    Number.isInteger(value.number) &&
    typeof value.name === "string" &&
    typeof value.englishName === "string" &&
    typeof value.englishNameTranslation === "string" &&
    Number.isInteger(value.numberOfAyahs) &&
    typeof value.revelationType === "string"
  );
}

function isQuranMeta(value: unknown): value is QuranMetaResponse {
  return (
    isRecord(value) &&
    value.code === 200 &&
    isRecord(value.data) &&
    isRecord(value.data.surahs) &&
    Array.isArray(value.data.surahs.references) &&
    value.data.surahs.references.every(isSurahMetadata)
  );
}

function isQuranSurah(value: unknown): value is QuranSurahResponse {
  return (
    isRecord(value) &&
    value.code === 200 &&
    isRecord(value.data) &&
    isSurahMetadata(value.data) &&
    Array.isArray(value.data.ayahs) &&
    value.data.ayahs.every(
      (ayah) =>
        isRecord(ayah) &&
        Number.isInteger(ayah.number) &&
        Number.isInteger(ayah.numberInSurah) &&
        typeof ayah.text === "string",
    )
  );
}

function isRawHadithResponse(value: unknown): value is RawHadithResponse {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    isRecord(value.pagination) &&
    typeof value.pagination.totalPages === "number" &&
    Array.isArray(value.items) &&
    value.items.every(
      (item) => isRecord(item) && typeof item.number === "number" && typeof item.arab === "string",
    )
  );
}

function isSupplicationData(value: unknown): value is RawSupplicationData {
  const isEntry = (entry: unknown): entry is RawSupplicationEntry => {
    if (Array.isArray(entry)) return entry.every(isEntry);
    return (
      isRecord(entry) && typeof entry.content === "string" && typeof entry.category === "string"
    );
  };
  return (
    isRecord(value) &&
    Object.values(value).every((items) => Array.isArray(items) && items.every(isEntry))
  );
}

function isPrayerResponse(value: unknown): value is PrayerApiResponse {
  if (!isRecord(value) || value.code !== 200 || !isRecord(value.data)) return false;
  const data = value.data;
  if (!isRecord(data.timings) || !isRecord(data.date) || !isRecord(data.meta)) return false;
  const { timings, date, meta } = data;
  const gregorianData = date.gregorian;
  const hijriData = date.hijri;
  const methodData = meta.method;
  if (!isRecord(gregorianData) || !isRecord(hijriData) || !isRecord(methodData)) return false;
  const gregorian = gregorianData;
  const hijri = hijriData;
  const method = methodData;
  const hijriMonthData = hijri.month;
  if (!isRecord(hijriMonthData)) return false;
  const hijriMonth = hijriMonthData;
  const names = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
  return (
    names.every((name) => typeof timings[name] === "string") &&
    typeof gregorian.date === "string" &&
    typeof hijri.day === "string" &&
    typeof hijriMonth.ar === "string" &&
    typeof hijri.year === "string" &&
    typeof method.name === "string" &&
    typeof meta.timezone === "string"
  );
}

export const localSurahs = (legacySurahData as LegacySurah[]).map((surah) => ({
  number: Number(surah.number),
  name: surah.name_ar,
  englishName: surah.name_en,
  englishNameTranslation: surah.name_en_translation,
  revelationType: surah.type,
}));

export async function getSurahs(): Promise<Resource<Surah[]>> {
  try {
    const result = await fetchResource("quran:meta", `${QURAN_API}/meta`, isQuranMeta);
    return { data: result.data.data.surahs.references, source: result.source };
  } catch {
    return localResource(localSurahs);
  }
}

export async function getSurah(number: number): Promise<Resource<SurahContent>> {
  const result = await fetchResource(
    `quran:surah:${number}`,
    `${QURAN_API}/surah/${number}`,
    isQuranSurah,
  );
  const surah = result.data.data;
  return {
    source: result.source,
    data: {
      number: surah.number,
      name: surah.name,
      englishName: surah.englishName,
      englishNameTranslation: surah.englishNameTranslation,
      numberOfAyahs: surah.numberOfAyahs,
      revelationType: surah.revelationType,
      ayahs: surah.ayahs.map((ayah) => ({
        number: ayah.number,
        numberInSurah: ayah.numberInSurah,
        text: ayah.text,
      })),
    },
  };
}

export async function getHadithPage(page: number): Promise<Resource<HadithPage>> {
  const result = await fetchResource(
    `hadith:abu-dawud:${page}`,
    `${HADITH_URL}?page=${page}&limit=40`,
    isRawHadithResponse,
  );
  return {
    source: result.source,
    data: {
      page,
      totalPages: result.data.pagination.totalPages,
      items: result.data.items.map((item) => ({
        id: `abu-dawud-${item.number}`,
        number: item.number,
        text: item.arab,
        collection: "سنن أبي داود",
        referenceUrl: `${HADITH_URL}?page=${page}&limit=40`,
      })),
    },
  };
}

async function getSupplicationData(): Promise<Resource<RawSupplicationData>> {
  return fetchResource("supplications:source", SUPPLICATIONS_URL, isSupplicationData);
}

function flattenSupplications(entries: RawSupplicationEntry[]): RawSupplication[] {
  const flattened: RawSupplication[] = [];
  for (const entry of entries) {
    if (Array.isArray(entry)) flattened.push(...flattenSupplications(entry));
    else flattened.push(entry);
  }
  return flattened;
}

function getCount(raw: RawSupplication): number | null {
  if (raw.count === undefined || raw.count === null || raw.count === "") return null;
  const number = Number.parseInt(String(raw.count), 10);
  return Number.isFinite(number) && number > 0 ? number : null;
}

export async function getDuas(): Promise<Resource<Dua[]>> {
  const result = await getSupplicationData();
  const items = Object.entries(result.data)
    .filter(([category]) => category.startsWith("أدعية"))
    .flatMap(([category, entries]) =>
      flattenSupplications(entries).map((entry, index) => ({
        id: `dua-${category}-${index}`,
        category,
        text: entry.content,
        count: getCount(entry),
        description: entry.description || undefined,
        reference: entry.reference || undefined,
      })),
    );
  return { data: items, source: result.source };
}

export async function getAzkar(category: string): Promise<Resource<Dhikr[]>> {
  const result = await getSupplicationData();
  const entries = result.data[category];
  const normalized = Array.isArray(entries) ? flattenSupplications(entries) : [];
  return {
    source: result.source,
    data: normalized.map((entry, index) => ({
      id: `dhikr-${category}-${index}`,
      category,
      text: entry.content,
      count: getCount(entry),
      description: entry.description || undefined,
      reference: entry.reference || undefined,
    })),
  };
}

export const azkarCategories = [
  "أذكار الصباح",
  "أذكار المساء",
  "أذكار بعد السلام من الصلاة المفروضة",
  "أذكار النوم",
  "أذكار الاستيقاظ",
  "تسابيح",
] as const;

export async function getPrayerTimes(
  city: string,
  country: string,
  method = "5",
): Promise<Resource<PrayerTimes>> {
  const query = new URLSearchParams({
    city,
    country,
    method,
  });
  const result = await fetchResource(
    `prayer:${city.trim().toLowerCase()}:${country.trim().toLowerCase()}:${method}`,
    `${PRAYER_URL}?${query.toString()}`,
    isPrayerResponse,
  );
  const timings = result.data.data.timings;
  const labels = [
    ["Fajr", "الفجر"],
    ["Sunrise", "الشروق"],
    ["Dhuhr", "الظهر"],
    ["Asr", "العصر"],
    ["Maghrib", "المغرب"],
    ["Isha", "العشاء"],
  ] as const;
  return {
    source: result.source,
    data: {
      city,
      country,
      date: result.data.data.date.gregorian.date,
      hijriDate: `${result.data.data.date.hijri.day} ${result.data.data.date.hijri.month.ar} ${result.data.data.date.hijri.year}`,
      method: result.data.data.meta.method.name,
      timezone: result.data.data.meta.timezone,
      times: labels.map(([name, label]) => ({
        name,
        label,
        time: timings[name]?.match(/^\d{1,2}:\d{2}/)?.[0] ?? "",
      })),
    },
  };
}

export async function getTafsir(number: number): Promise<Resource<TafsirAyah[]>> {
  const [arabic, tafsir] = await Promise.all([
    getSurah(number),
    fetchResource(
      `tafsir:muyassar:${number}`,
      `${QURAN_API}/surah/${number}/ar.muyassar`,
      isQuranSurah,
    ),
  ]);
  return {
    source:
      arabic.source === "network" && tafsir.source === "network"
        ? "network"
        : arabic.source === "cache" || tafsir.source === "cache"
          ? "cache"
          : "local",
    data: tafsir.data.data.ayahs.map((ayah, index) => ({
      numberInSurah: ayah.numberInSurah,
      arabicText: arabic.data.ayahs[index]?.text ?? "",
      translation: ayah.text,
    })),
  };
}
