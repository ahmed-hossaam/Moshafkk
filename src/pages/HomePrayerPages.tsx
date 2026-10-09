import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Clock3, HandHeart, ScrollText, Sparkles, ArrowLeft, MapPin, Bookmark } from "lucide-react";
import { usePrayerTimes, useSurahs } from "../hooks/useContent";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { PageHeading } from "../components/AppShell";
import { LoadingState, SourceNote, StatusState, FavoriteCard } from "../components/content";
import { useFavorites } from "../hooks/useFavorites";
import type { FavoriteItem } from "../types/favorites";
import { prayerCalculationMethods } from "../services/content";
import { getPrayerProgress, isPrayerDateToday } from "../utils/prayer";

interface SavedLocation { city: string; country: string; method?: string }
const initialLocation: SavedLocation = { city: "", country: "" };

export function HomePage() {
  const { data: surahs, loading: surahsLoading } = useSurahs();
  const [lastReading] = useLocalStorage<{ surah: number; ayah: number } | null>("moshafk-last-reading", null);
  const [location] = useLocalStorage<SavedLocation>("moshafk-prayer-location", initialLocation);
  const lastSurah = surahs?.find((surah) => surah.number === lastReading?.surah);
  return (
    <main className="page-wrap">
      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">رفيقك اليومي</p>
          <h1>لحظة سكينة،<br />وقلبٌ أقرب.</h1>
          <p>افتح المصحف على مهل، واحتفظ بأذكارك وموضع قراءتك في مساحة هادئة لك.</p>
          <div className="hero-actions">
            <Link className="button" to={lastReading ? `/quran/${lastReading.surah}` : "/quran"}>{lastReading ? "أكمل قراءتك" : "ابدأ القراءة"} <BookOpen size={16} /></Link>
            <Link className="quiet-button" to="/prayer">مواقيت الصلاة <Clock3 size={16} /></Link>
          </div>
        </div>
        <div className="hero-ornament" aria-hidden="true"><div className="ornament-ring"><span>اقرأ</span></div></div>
      </section>

      <nav className="quick-links" aria-label="الوصول السريع">
        <Link to="/quran" className="quick-link"><span className="quick-icon"><BookOpen size={18} /></span><span><strong>القرآن الكريم</strong><small>تلاوة وموضع محفوظ</small></span></Link>
        <Link to="/hadith" className="quick-link"><span className="quick-icon"><ScrollText size={18} /></span><span><strong>الحديث الشريف</strong><small>سنن أبي داود</small></span></Link>
        <Link to="/dua" className="quick-link"><span className="quick-icon"><HandHeart size={18} /></span><span><strong>الأدعية</strong><small>من المصدر المتاح</small></span></Link>
        <Link to="/azkar" className="quick-link"><span className="quick-icon"><Sparkles size={18} /></span><span><strong>الأذكار</strong><small>وردك اليومي</small></span></Link>
      </nav>

      <div className="content-grid">
        <section className="panel continue-card">
          <div>
            <p className="eyebrow">موضع القراءة</p>
            <h2>{surahsLoading ? "جارٍ استعادة موضعك" : lastSurah ? `سورة ${lastSurah.name}` : "ابدأ من حيث تشاء"}</h2>
            <p>{lastSurah && lastReading ? `آخر موضع محفوظ: الآية ${lastReading.ayah}` : "سيُحفظ موضعك تلقائيًا على هذا الجهاز."}</p>
          </div>
          <Link className="quiet-button" to={lastReading ? `/quran/${lastReading.surah}` : "/quran"}>{lastReading ? "متابعة" : "قائمة السور"} <ArrowLeft size={15} /></Link>
        </section>
        <section className="panel prayer-mini">
          <div className="section-top"><div><h2 className="section-label">مواقيت الصلاة</h2><span className="section-meta">{location.city ? `${location.city}، ${location.country}` : "أدخل مدينتك لعرض المواقيت"}</span></div><Link to="/prayer" className="small-icon" aria-label="إعداد مواقيت الصلاة"><MapPin size={16} /></Link></div>
          {location.city && location.country ? <PrayerOverview location={location} compact /> : <div className="status-box"><p>لا نطلب موقعك تلقائيًا. اكتب مدينتك ودولتك لعرض المواقيت.</p><Link to="/prayer" className="quiet-button">إعداد المدينة</Link></div>}
        </section>
      </div>
    </main>
  );
}

function PrayerOverview({ location, compact = false }: { location: SavedLocation; compact?: boolean }) {
  const method = location.method ?? "5";
  const { data, error, loading, source, retry } = usePrayerTimes(location.city, location.country, method);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const progress = useMemo(() => data ? getPrayerProgress(data, now) : null, [data, now]);
  const dateMatches = useMemo(() => data ? isPrayerDateToday(data, now) : false, [data, now]);
  const countdown = progress
    ? `${String(Math.floor(progress.secondsUntilNext / 3600)).padStart(2, "0")}:${String(Math.floor((progress.secondsUntilNext % 3600) / 60)).padStart(2, "0")}:${String(progress.secondsUntilNext % 60).padStart(2, "0")}`
    : "";
  if (loading) return <LoadingState label="جارٍ تحميل مواقيت الصلاة" />;
  if (error) return <StatusState title="تعذّر جلب المواقيت" message={error} action={retry} actionLabel="إعادة المحاولة" />;
  if (!data || !progress) return <StatusState
    title={data && !dateMatches ? "المواقيت المحفوظة ليست لليوم" : "لا تتوفر المواقيت"}
    message={data && !dateMatches ? "لن نعرض عدًّا تنازليًا لمواقيت يوم سابق. اتصل بالإنترنت ثم أعد المحاولة." : "لم تُعِد الخدمة مواقيت مكتملة لهذه المدينة."}
    action={retry}
    actionLabel="إعادة المحاولة"
  />;
  return compact ? <>
    <div className="section-meta"><SourceNote source={source} /> {data.hijriDate}</div>
    <p className="prayer-now">{progress.current.label} <span style={{ fontSize: 14, fontWeight: 400 }}>الآن</span></p>
    <p className="section-meta">الصلاة التالية: {progress.next.label} · <span dir="ltr">{countdown}</span></p>
    <div className="prayer-time-list">{data.times.map((entry) => <div className="prayer-chip" key={entry.name}><small>{entry.label}</small><strong>{entry.time}</strong></div>)}</div>
  </> : <>
    <div className="prayer-hero">
      <p className="eyebrow">موعد الصلاة</p>
      <h2>{location.city}، {location.country}</h2>
      <p>{data.hijriDate} · {data.date} · {data.timezone}</p>
      <p className="prayer-now">{progress.current.label} <span style={{ fontSize: 15, fontWeight: 400 }}>حاليًا</span></p>
      <p className="countdown">الصلاة التالية: {progress.next.label} · {countdown}</p>
    </div>
    <div className="section-top" style={{ marginTop: 22 }}><h2 className="section-label">مواقيت اليوم</h2><SourceNote source={source} /></div>
    <div className="prayer-grid">{data.times.map((entry) => <div className={`prayer-tile ${entry.name === progress.next.name ? "is-current" : ""}`} key={entry.name}>
      <span>{entry.label}{entry.name === progress.next.name ? " · التالية" : ""}</span><strong>{entry.time}</strong>
    </div>)}</div>
    <p className="section-meta" style={{ marginTop: 17 }}>طريقة الحساب: {prayerCalculationMethods.find((item) => item.id === method)?.label ?? data.method}</p>
  </>;
}

export function PrayerPage() {
  const [location, setLocation] = useLocalStorage<SavedLocation>("moshafk-prayer-location", initialLocation);
  const [city, setCity] = useState(location.city);
  const [country, setCountry] = useState(location.country);
  const [method, setMethod] = useState(location.method ?? "5");
  const [submitted, setSubmitted] = useState(Boolean(location.city && location.country));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = { city: city.trim(), country: country.trim(), method };
    if (!next.city || !next.country) return;
    setLocation(next);
    setSubmitted(true);
  };
  return (
    <main className="page-wrap">
      <PageHeading eyebrow="الصلاة" title="مواقيت يومك" intro="اكتب المدينة والدولة يدويًا. لا نطلب إذن الوصول إلى موقعك." />
      <section className="panel panel-pad">
        <form onSubmit={submit}>
          <div className="form-row prayer-form-row">
            <div><label className="field-label" htmlFor="prayer-city">المدينة</label><input id="prayer-city" className="text-field" value={city} onChange={(event) => setCity(event.target.value)} placeholder="مثال: القاهرة" required autoComplete="address-level2" /></div>
            <div><label className="field-label" htmlFor="prayer-country">الدولة</label><input id="prayer-country" className="text-field" value={country} onChange={(event) => setCountry(event.target.value)} placeholder="مثال: مصر" required autoComplete="country-name" /></div>
            <div><label className="field-label" htmlFor="prayer-method">طريقة الحساب</label><select id="prayer-method" className="select-field" value={method} onChange={(event) => setMethod(event.target.value)}>{prayerCalculationMethods.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
            <button type="submit" className="button">عرض المواقيت</button>
          </div>
        </form>
        {!submitted && <div style={{ marginTop: 20 }} className="status-box"><p>ستُحفظ المدينة على هذا الجهاز لتسهيل العودة إليها. اختر مدينة ودولة للبدء.</p></div>}
      </section>
      {submitted && location.city && location.country && <section style={{ marginTop: 18 }}><PrayerOverview location={location} /></section>}
    </main>
  );
}

export function FavoritesPage() {
  const { favorites, remove } = useFavorites();
  const [filter, setFilter] = useState("الكل");
  const kinds = ["الكل", "ayah", "hadith", "dua", "dhikr"];
  const labels: Record<string, string> = { الكل: "الكل", ayah: "آيات", hadith: "أحاديث", dua: "أدعية", dhikr: "أذكار" };
  const filtered = favorites.filter((item: FavoriteItem) => filter === "الكل" || item.kind === filter);
  return (
    <main className="page-wrap">
      <PageHeading eyebrow="مساحتك الخاصة" title="المحفوظات" intro="كل ما تحفظه يبقى على هذا الجهاز وحده، دون حساب أو مزامنة." />
      <section className="panel panel-pad">
        <div className="section-top"><div><h2 className="section-label">ما احتفظت به</h2><span className="section-meta">{favorites.length} عنصر</span></div><Bookmark size={18} color="var(--color-secondary)" /></div>
        <div className="category-pills" aria-label="تصفية المحفوظات">
          {kinds.map((kind) => <button type="button" className="pill" key={kind} aria-pressed={filter === kind} onClick={() => setFilter(kind)}>{labels[kind]}</button>)}
        </div>
        {filtered.length === 0 ? <StatusState title={favorites.length ? "لا توجد عناصر في هذا النوع" : "مساحتك تبدأ هنا"} message={favorites.length ? "اختر نوعًا آخر من المحفوظات." : "احفظ آية أو حديثًا أو دعاءً أو ذكرًا لتجده هنا."} /> :
          <div className="favorite-list">{filtered.map((item) => <FavoriteCard key={`${item.kind}-${item.id}`} item={item} onRemove={() => remove(item.kind, item.id)} />)}</div>}
      </section>
    </main>
  );
}
