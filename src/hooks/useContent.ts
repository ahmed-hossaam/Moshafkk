import { useCallback, useEffect, useState } from "react";
import {
  getAzkar,
  getDuas,
  getHadithPage,
  getPrayerTimes,
  getSurah,
  getSurahs,
  getTafsir,
} from "../services/content";
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

interface AsyncResource<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  source: Resource<T>["source"] | null;
  retry: () => void;
}

interface ResolvedResource<T> {
  key: string;
  data: T | null;
  error: string | null;
  source: Resource<T>["source"] | null;
}

function useResource<T>(
  loader: () => Promise<Resource<T>>,
  dependencies: unknown[],
): AsyncResource<T> {
  const [resolved, setResolved] = useState<ResolvedResource<T> | null>(null);
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  const requestKey = JSON.stringify([...dependencies, attempt]);

  useEffect(() => {
    let current = true;
    loader()
      .then((result) => {
        if (!current) return;
        setResolved({
          key: requestKey,
          data: result.data,
          error: null,
          source: result.source,
        });
      })
      .catch((reason: unknown) => {
        if (!current) return;
        setResolved({
          key: requestKey,
          data: null,
          source: null,
          error: reason instanceof Error ? reason.message : "تعذر تحميل البيانات حاليًا.",
        });
      });
    return () => {
      current = false;
    };
    // Loaders are defined by the caller from stable primitive dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  const active = resolved?.key === requestKey ? resolved : null;
  return {
    data: active?.data ?? null,
    error: active?.error ?? null,
    loading: active === null,
    source: active?.source ?? null,
    retry,
  };
}

export function useSurahs() {
  return useResource<Surah[]>(getSurahs, []);
}

export function useSurah(number: number | null) {
  return useResource<SurahContent>(
    () => (number ? getSurah(number) : Promise.reject(new Error("اختر سورة للقراءة."))),
    [number],
  );
}

export function useHadithPage(page: number) {
  return useResource<HadithPage>(() => getHadithPage(page), [page]);
}

export function useDuas() {
  return useResource<Dua[]>(getDuas, []);
}

export function useAzkar(category: string) {
  return useResource<Dhikr[]>(() => getAzkar(category), [category]);
}

export function usePrayerTimes(city: string, country: string, method = "5") {
  return useResource<PrayerTimes>(
    () => getPrayerTimes(city, country, method),
    [city, country, method],
  );
}

export function useTafsir(number: number | null) {
  return useResource<TafsirAyah[]>(
    () => (number ? getTafsir(number) : Promise.reject(new Error("اختر سورة."))),
    [number],
  );
}
