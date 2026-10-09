export type FavoriteKind = "ayah" | "hadith" | "dua" | "dhikr";

export interface FavoriteItem {
  id: string;
  kind: FavoriteKind;
  text: string;
  citation: string;
  savedAt: number;
}
