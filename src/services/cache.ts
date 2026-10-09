import type { DataSource, Resource } from "../types/content";

interface CacheRecord<T> {
  savedAt: number;
  data: T;
}

const PREFIX = "moshafk:v1:";
const DAY = 24 * 60 * 60 * 1000;

export function readCache<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(`${PREFIX}${key}`);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as CacheRecord<T>;
    return parsed && "data" in parsed ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}

function writeCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(
      `${PREFIX}${key}`,
      JSON.stringify({ savedAt: Date.now(), data } satisfies CacheRecord<T>),
    );
  } catch {
    // Storage can be unavailable or full; live content remains usable.
  }
}

export async function fetchResource<T>(
  key: string,
  url: string,
  validate: (value: unknown) => value is T,
): Promise<Resource<T>> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    const offlineCache = readCache<T>(key);
    if (offlineCache !== undefined && validate(offlineCache)) {
      return { data: offlineCache, source: "cache" };
    }
  }

  let requestError: Error | undefined;
  try {
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
    const payload: unknown = await response.json();
    if (!validate(payload)) throw new Error("The content source returned an unexpected response.");
    writeCache(key, payload);
    return { data: payload, source: "network" };
  } catch (error) {
    requestError = error instanceof Error ? error : new Error("Request failed.");
  }

  const cached = readCache<T>(key);
  if (cached !== undefined && validate(cached)) return { data: cached, source: "cache" };
  throw requestError;
}

export function localResource<T>(data: T): Resource<T> {
  return { data, source: "local" satisfies DataSource };
}

export const CACHE_TTL_MS = DAY;
