export type DataSource = "network" | "cache" | "local";

export interface Resource<T> {
  data: T;
  source: DataSource;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs?: number;
  revelationType?: "Meccan" | "Medinan" | string;
}

export interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
}

export interface SurahContent extends Surah {
  ayahs: Ayah[];
}

export interface Hadith {
  id: string;
  number: number;
  text: string;
  collection: string;
  referenceUrl: string;
}

export interface HadithPage {
  items: Hadith[];
  page: number;
  totalPages: number;
}

export interface Dua {
  id: string;
  category: string;
  text: string;
  count?: number | null;
  description?: string;
  reference?: string;
}

export interface Dhikr extends Dua {
  category: string;
  count: number | null;
}

export type PrayerName = "Fajr" | "Sunrise" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";

export interface PrayerTimeEntry {
  name: PrayerName;
  label: string;
  time: string;
}

export interface PrayerTimes {
  city: string;
  country: string;
  date: string;
  hijriDate: string;
  method: string;
  timezone: string;
  times: PrayerTimeEntry[];
}

export interface TafsirAyah {
  numberInSurah: number;
  arabicText: string;
  translation: string;
}
