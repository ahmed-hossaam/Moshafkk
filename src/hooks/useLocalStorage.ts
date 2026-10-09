import { useCallback, useEffect, useState } from "react";

export function readStoredValue<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => readStoredValue(key, initialValue));

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // The current session still works when browser storage is unavailable.
    }
  }, [key, value]);

  const update = useCallback((next: T | ((previous: T) => T)) => {
    setValue(next);
  }, []);

  return [value, update] as const;
}
