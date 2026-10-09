import { useCallback, useMemo, type ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { FavoritesContext } from "../hooks/useFavorites";
import type { FavoriteItem, FavoriteKind } from "../types/favorites";

const FAVORITES_KEY = "moshafk-favorites";

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useLocalStorage<FavoriteItem[]>(FAVORITES_KEY, []);
  const isSaved = useCallback(
    (kind: FavoriteKind, id: string) =>
      favorites.some((item) => item.kind === kind && item.id === id),
    [favorites],
  );
  const toggle = useCallback(
    (item: Omit<FavoriteItem, "savedAt">) => {
      const exists = favorites.some((saved) => saved.kind === item.kind && saved.id === item.id);
      setFavorites((current) =>
        exists
          ? current.filter((saved) => saved.kind !== item.kind || saved.id !== item.id)
          : [{ ...item, savedAt: Date.now() }, ...current],
      );
      return !exists;
    },
    [favorites, setFavorites],
  );
  const remove = useCallback(
    (kind: FavoriteKind, id: string) =>
      setFavorites((current) => current.filter((item) => item.kind !== kind || item.id !== id)),
    [setFavorites],
  );
  const value = useMemo(
    () => ({ favorites, isSaved, toggle, remove }),
    [favorites, isSaved, toggle, remove],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}
