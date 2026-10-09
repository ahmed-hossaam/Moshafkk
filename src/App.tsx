import { BrowserRouter, Route, Routes, useLocation, Link } from "react-router-dom";
import { AppShell, PageHeading } from "./components/AppShell";
import { FavoritesPage, HomePage, PrayerPage } from "./pages/HomePrayerPages";
import { AzkarPage, DuaPage, HadithPage } from "./pages/RemembrancePages";
import { QuranListPage, QuranReaderPage, TafsirPage } from "./pages/QuranPages";
import { localSurahs } from "./services/content";

const descriptions: Record<string, { title: string; description: string }> = {
  "/": {
    title: "رفيقك اليومي للقرآن والذكر",
    description: "رفيقك اليومي لقراءة القرآن الكريم والأذكار والأدعية ومتابعة مواقيت الصلاة.",
  },
  "/quran": {
    title: "القرآن الكريم",
    description: "اقرأ سور القرآن الكريم واحفظ موضعك للعودة إليه.",
  },
  "/hadith": {
    title: "سنن أبي داود",
    description: "تصفّح أحاديث سنن أبي داود مع أرقامها وإحالات المصدر.",
  },
  "/dua": { title: "الأدعية", description: "أدعية من أقسام المصدر المتاح مع مراجعها عند توفرها." },
  "/azkar": { title: "الأذكار", description: "أذكار يومية موثقة مع عدّاد يحفظ تقدمك على جهازك." },
  "/prayer": { title: "مواقيت الصلاة", description: "اعرض مواقيت الصلاة لمدينة تختارها يدويًا." },
  "/tafseer": { title: "التفسير الميسّر", description: "التفسير الميسّر من مصدره عند توفره." },
  "/favorites": { title: "المحفوظات", description: "العناصر التي حفظتها محليًا للعودة إليها." },
};

function RoutedApp() {
  const location = useLocation();
  const routePath = location.pathname.replace(/\/+$/, "") || "/";
  const surahMatch = /^\/quran\/(\d+)$/.exec(routePath);
  const requestedSurah = surahMatch
    ? localSurahs.find((surah) => surah.number === Number(surahMatch[1]))
    : undefined;
  const meta = requestedSurah
    ? {
        title: `سورة ${requestedSurah.name.replace(/^سورة\s*/, "")}`,
        description: `اقرأ سورة ${requestedSurah.name.replace(/^سورة\s*/, "")} مع حفظ موضع التلاوة على جهازك.`,
      }
    : (descriptions[routePath] ?? {
        title: "غير موجودة",
        description: "تعذّر العثور على الصفحة المطلوبة.",
      });
  return (
    <AppShell title={meta.title} description={meta.description}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quran" element={<QuranListPage />} />
        <Route path="/quran/:surahNumber" element={<QuranReaderPage />} />
        <Route path="/hadith" element={<HadithPage />} />
        <Route path="/dua" element={<DuaPage />} />
        <Route path="/azkar" element={<AzkarPage />} />
        <Route path="/prayer" element={<PrayerPage />} />
        <Route path="/tafseer" element={<TafsirPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route
          path="*"
          element={
            <main className="page-wrap">
              <PageHeading
                eyebrow="404"
                title="هذه الصفحة غير موجودة"
                intro="قد يكون الرابط تغيّر. يمكنك العودة إلى الصفحة الرئيسية أو تصفّح المصحف."
              />
              <Link to="/" className="button">
                العودة للرئيسية
              </Link>
            </main>
          }
        />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <RoutedApp />
    </BrowserRouter>
  );
}
