import { createContext, useContext } from "react";
import type { FavoriteItem, FavoriteKind } from "../types/favorites";

export interface FavoritesContextValue {
  favorites: FavoriteItem[];
  isSaved: (kind: FavoriteKind, id: string) => boolean;
  toggle: (item: Omit<FavoriteItem, "savedAt">) => boolean;
  remove: (kind: FavoriteKind, id: string) => void;
}

export const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites must be used inside FavoritesProvider.");
  return context;
}
