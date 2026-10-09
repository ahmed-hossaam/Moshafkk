import { Bookmark, Check, Copy, ExternalLink, Share2 } from "lucide-react";
import { useFavorites } from "../hooks/useFavorites";
import { useToast } from "../hooks/useToast";
import { copyText, shareText } from "../utils/share";
import type { FavoriteItem, FavoriteKind } from "../types/favorites";
import type { DataSource } from "../types/content";

export function SourceNote({ source }: { source: DataSource | null }) {
  if (!source) return null;
  const labels: Record<DataSource, string> = {
    network: "مصدر مباشر",
    cache: "نسخة محفوظة",
    local: "بيانات محلية",
  };
  return (
    <span className="source-note">
      <span className="source-dot" aria-hidden="true" />
      {labels[source]}
    </span>
  );
}

export function LoadingState({ label = "جارٍ تحميل المحتوى" }: { label?: string }) {
  return (
    <div aria-label={label} aria-busy="true">
      <div className="skeleton" />
      <div className="skeleton" />
      <div className="skeleton" />
    </div>
  );
}

export function StatusState({
  title,
  message,
  action,
  actionLabel,
}: {
  title: string;
  message: string;
  action?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="status-box" role="status">
      <h3>{title}</h3>
      <p>{message}</p>
      {action && actionLabel && (
        <button type="button" className="quiet-button" onClick={action}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function SearchBox({
  value,
  onChange,
  placeholder = "ابحث في المحتوى المحمّل",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="search-wrap">
      <span className="sr-only">{placeholder}</span>
      <input
        className="search-field"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      <SearchGlyph />
    </label>
  );
}
function SearchGlyph() {
  return (
    <svg
      aria-hidden="true"
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

const kindLabels: Record<FavoriteKind, string> = {
  ayah: "آية",
  hadith: "حديث",
  dua: "دعاء",
  dhikr: "ذكر",
};
export function ContentActions({
  kind,
  id,
  text,
  citation,
  href,
}: {
  kind: FavoriteKind;
  id: string;
  text: string;
  citation: string;
  href?: string;
}) {
  const { isSaved, toggle } = useFavorites();
  const { notify } = useToast();
  const saved = isSaved(kind, id);
  const fullText = citation ? `${text}\n${citation}` : text;
  const onCopy = async () =>
    notify((await copyText(fullText)) ? "نُسخ النص مع مرجعه" : "تعذّر نسخ النص");
  const onShare = async () => {
    const result = await shareText(fullText, citation || "مُصْحَفُكَ");
    notify(
      result === "shared"
        ? "تمت المشاركة"
        : result === "copied"
          ? "تم نسخ النص للمشاركة"
          : result === "cancelled"
            ? "أُلغيت المشاركة"
            : "تعذّرت المشاركة",
    );
  };
  const onFavorite = () =>
    notify(toggle({ id, kind, text, citation }) ? "أُضيف إلى المحفوظات" : "أُزيل من المحفوظات");
  return (
    <div className="card-actions">
      <button
        type="button"
        className="small-icon"
        onClick={onCopy}
        aria-label="نسخ النص"
        title="نسخ"
      >
        <Copy size={15} />
      </button>
      <button
        type="button"
        className="small-icon"
        onClick={onShare}
        aria-label="مشاركة النص"
        title="مشاركة"
      >
        <Share2 size={15} />
      </button>
      <button
        type="button"
        className="small-icon"
        onClick={onFavorite}
        aria-label={saved ? "إزالة من المحفوظات" : "إضافة إلى المحفوظات"}
        aria-pressed={saved}
        title={saved ? "إزالة من المحفوظات" : "حفظ"}
      >
        <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
      </button>
      {href && (
        <a
          className="small-icon"
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label="فتح المصدر"
          title="المصدر"
        >
          <ExternalLink size={15} />
        </a>
      )}
    </div>
  );
}

export function FavoriteCard({ item, onRemove }: { item: FavoriteItem; onRemove: () => void }) {
  const { notify } = useToast();
  const doCopy = async () =>
    notify(
      (await copyText(`${item.text}\n${item.citation}`)) ? "نُسخ النص مع مرجعه" : "تعذّر النسخ",
    );
  const doShare = async () => {
    const result = await shareText(`${item.text}\n${item.citation}`, item.citation || "مُصْحَفُكَ");
    notify(
      result === "failed"
        ? "تعذّرت المشاركة"
        : result === "copied"
          ? "تم نسخ النص للمشاركة"
          : result === "cancelled"
            ? "أُلغيت المشاركة"
            : "تمت المشاركة",
    );
  };
  return (
    <article className="favorite-card">
      <span className="favorite-tag">{kindLabels[item.kind]}</span>
      <p className="text-card-copy">{item.text}</p>
      <div className="text-card-meta">
        <span>{item.citation}</span>
        <div className="card-actions">
          <button type="button" className="small-icon" onClick={doCopy} aria-label="نسخ النص">
            <Copy size={15} />
          </button>
          <button type="button" className="small-icon" onClick={doShare} aria-label="مشاركة النص">
            <Share2 size={15} />
          </button>
          <button
            type="button"
            className="small-icon"
            onClick={onRemove}
            aria-label="إزالة من المحفوظات"
          >
            <Check size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
