import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  BookOpen,
  Bookmark,
  Clock3,
  Home,
  Menu,
  Moon,
  ScrollText,
  Sun,
  X,
  HandHeart,
  Sparkles,
  Languages,
} from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { ToastContext } from "../hooks/useToast";
import { FavoritesProvider } from "./FavoritesProvider";

export type ThemeChoice = "light" | "dark" | "system";

const navItems = [
  { to: "/", label: "الرئيسية", icon: Home, end: true },
  { to: "/quran", label: "القرآن الكريم", icon: BookOpen },
  { to: "/hadith", label: "الحديث", icon: ScrollText },
  { to: "/dua", label: "الأدعية", icon: HandHeart },
  { to: "/azkar", label: "الأذكار", icon: Sparkles },
  { to: "/tafseer", label: "التفسير", icon: Languages },
  { to: "/prayer", label: "مواقيت الصلاة", icon: Clock3 },
  { to: "/favorites", label: "المحفوظات", icon: Bookmark },
];

interface AppShellProps {
  children: ReactNode;
  title: string;
  description: string;
}

export function AppShell({ children, title, description }: AppShellProps) {
  const [themeChoice, setThemeChoice] = useLocalStorage<ThemeChoice>("moshafk-theme", "system");
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const location = useLocation();
  useEffect(() => {
    const apply = () => {
      const isDark =
        themeChoice === "dark" ||
        (themeChoice === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.dataset.theme = isDark ? "dark" : "light";
    };
    apply();
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [themeChoice]);
  useEffect(() => {
    const shareTitle = `${title} — مُصْحَفُكَ`;
    const routePath = location.pathname.replace(/\/+$/, "") || "/";
    const canonicalUrl = `https://moshafk.vercel.app${routePath}`;
    document.title = shareTitle;
    const setMeta = (selector: string, attribute: string, value: string) => {
      let element = document.querySelector<HTMLMetaElement>(selector);
      if (!element) {
        element = document.createElement("meta");
        const [, key, keyValue] = selector.match(/meta\[(name|property)="([^"]+)"\]/) ?? [];
        if (key && keyValue) element.setAttribute(key, keyValue);
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, value);
    };
    setMeta('meta[name="description"]', "content", description);
    setMeta(
      'meta[name="robots"]',
      "content",
      routePath === "/favorites" ? "noindex,follow" : "index,follow",
    );
    setMeta('meta[property="og:title"]', "content", shareTitle);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:url"]', "content", canonicalUrl);
    setMeta('meta[name="twitter:title"]', "content", shareTitle);
    setMeta('meta[name="twitter:description"]', "content", description);
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname, title, description]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2700);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const cycleTheme = () => {
    setThemeChoice((previous) =>
      previous === "light" ? "dark" : previous === "dark" ? "system" : "light",
    );
  };
  const ThemeIcon = themeChoice === "dark" ? Sun : themeChoice === "light" ? Moon : Sparkles;
  const themeLabel =
    themeChoice === "system"
      ? "المظهر: تلقائي"
      : themeChoice === "dark"
        ? "المظهر الداكن"
        : "المظهر الفاتح";

  return (
    <FavoritesProvider>
      <ToastContext.Provider value={{ notify: setToast }}>
        <div className="app-shell" lang="ar" dir="rtl">
          <a className="skip-link" href="#main-content">
            تخطي إلى المحتوى
          </a>
          <header className="topbar">
            <Link to="/" className="brand" aria-label="مُصْحَفُكَ، الصفحة الرئيسية">
              <span className="brand-mark" aria-hidden="true">
                م
              </span>
              <span className="brand-name">مُصْحَفُكَ</span>
            </Link>
            <nav className="main-nav" aria-label="التنقل الرئيسي">
              {navItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink key={to} to={to} end={end} className="nav-link">
                  <Icon size={15} aria-hidden="true" />
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="topbar-actions">
              <button
                type="button"
                className="icon-button"
                onClick={cycleTheme}
                aria-label={themeLabel}
                title={themeLabel}
              >
                <ThemeIcon size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="icon-button menu-toggle"
                onClick={() => setMenuOpen((open) => !open)}
                aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X size={19} /> : <Menu size={19} />}
              </button>
            </div>
          </header>
          {menuOpen && (
            <nav className="mobile-nav" aria-label="التنقل على الهاتف">
              {navItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className="nav-link"
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon size={16} aria-hidden="true" />
                  {label}
                </NavLink>
              ))}
            </nav>
          )}
          <div id="main-content">{children}</div>
          <footer className="footer">
            مُصْحَفُكَ <span aria-hidden="true">·</span> مساحة هادئة للقرآن والذكر
          </footer>
          {toast && (
            <div className="toast" role="status" aria-live="polite">
              {toast}
            </div>
          )}
        </div>
      </ToastContext.Provider>
    </FavoritesProvider>
  );
}

export function PageHeading({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <div className="page-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="page-title">{title}</h1>
      {intro && <p className="page-intro">{intro}</p>}
    </div>
  );
}
