import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { useSurah, useSurahs, useTafsir } from "../hooks/useContent";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { SurahContent } from "../types/content";
import { ContentActions, LoadingState, SearchBox, SourceNote, StatusState } from "../components/content";
import { PageHeading } from "../components/AppShell";

export interface LastReading {
  surah: number;
  ayah: number;
}

function SurahRow({ surah }: { surah: { number: number; name: string; englishName: string; englishNameTranslation: string; numberOfAyahs?: number } }) {
  return (
    <Link className="surah-row" to={`/quran/${surah.number}`} aria-label={`قراءة سورة ${surah.name}`}>
      <span className="surah-number">{surah.number}</span>
      <span className="surah-info"><strong>{surah.englishName}</strong><small>{surah.englishNameTranslation}{surah.numberOfAyahs ? ` · ${surah.numberOfAyahs} آية` : ""}</small></span>
      <span className="surah-arabic">{surah.name}</span>
    </Link>
  );
}

export function QuranListPage() {
  const [query, setQuery] = useState("");
  const { data, error, loading, source, retry } = useSurahs();
  const [lastReading] = useLocalStorage<LastReading | null>("moshafk-last-reading", null);
  const surahs = useMemo(() => (data ?? []).filter((surah) => `${surah.name} ${surah.englishName} ${surah.englishNameTranslation} ${surah.number}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())), [data, query]);
  const lastSurah = data?.find((surah) => surah.number === lastReading?.surah);
  return (
    <main className="page-wrap">
      <PageHeading eyebrow="القرآن الكريم" title="اقرأ على مهل" intro="اختر سورة لتبدأ التلاوة، ويُحفظ موضعك لتعود إليه حين تشاء." />
      {lastReading && lastSurah && <div className="panel continue-card" style={{ marginBottom: 18 }}>
        <div><h2>متابعة القراءة</h2><p>سورة {lastSurah.name} · الآية {lastReading.ayah}</p></div>
        <Link className="button" to={`/quran/${lastReading.surah}`}>تابع <ArrowRight size={16} /></Link>
      </div>}
      <section className="panel panel-pad" aria-labelledby="surah-list-heading">
        <div className="section-top"><div><h2 className="section-label" id="surah-list-heading">السور</h2><span className="section-meta">{data ? `${data.length} سورة` : "قائمة السور"}</span></div><SourceNote source={source} /></div>
        <div className="toolbar" style={{ marginBottom: 17 }}><SearchBox value={query} onChange={setQuery} placeholder="ابحث باسم السورة أو رقمها" /></div>
        {loading && <LoadingState label="جارٍ تحميل قائمة السور" />}
        {!loading && error && <StatusState title="تعذّر تحميل قائمة السور" message={error} action={retry} actionLabel="إعادة المحاولة" />}
        {!loading && !error && surahs.length === 0 && <StatusState title="لا توجد نتائج" message={query ? "جرّب اسمًا أو رقمًا مختلفًا." : "لا تتوفر سور للعرض الآن."} />}
        {!loading && !error && surahs.length > 0 && <div className="surah-list">{surahs.map((surah) => <SurahRow key={surah.number} surah={surah} />)}</div>}
        {query && data && <p className="section-meta" style={{ marginTop: 14 }}>البحث ضمن السور المحمّلة فقط.</p>}
      </section>
    </main>
  );
}

export function QuranReaderPage() {
  const params = useParams();
  const number = Number(params.surahNumber);
  const validNumber = Number.isInteger(number) && number >= 1 && number <= 114 ? number : null;
  const { data, error, loading, source, retry } = useSurah(validNumber);
  const { data: surahs } = useSurahs();
  const [, setLastReading] = useLocalStorage<LastReading | null>("moshafk-last-reading", null);
  const [fontSize, setFontSize] = useState(29);
  useEffect(() => {
    if (data) setLastReading((previous) => ({ surah: data.number, ayah: previous?.surah === data.number ? previous.ayah : 1 }));
  }, [data, setLastReading]);
  const title = data ? `سورة ${data.name}` : "قراءة القرآن";
  return (
    <main className="page-wrap">
      <PageHeading eyebrow="القرآن الكريم" title={title} intro="نصّ الآيات كما ورد في المصحف، مع حفظ موضع قراءتك على هذا الجهاز." />
      <div className="reader-toolbar">
        <Link to="/quran" className="quiet-button"><ArrowRight size={16} /> قائمة السور</Link>
        <SourceNote source={source} />
        <div className="reading-size" aria-label="حجم خط الآيات">
          <span>حجم الخط</span>
          <button type="button" onClick={() => setFontSize((size) => Math.max(22, size - 2))} aria-label="تصغير الخط"><Minus size={14} /></button>
          <button type="button" onClick={() => setFontSize((size) => Math.min(42, size + 2))} aria-label="تكبير الخط"><Plus size={14} /></button>
        </div>
      </div>
      {loading && <div style={{ marginTop: 20 }}><LoadingState label="جارٍ تحميل السورة" /></div>}
      {!loading && error && <StatusState title="تعذّرت قراءة السورة" message={error} action={retry} actionLabel="إعادة المحاولة" />}
      {!loading && !error && data && <SurahReader surah={data} fontSize={fontSize} setLastReading={setLastReading} />}
      {data && surahs && <div className="reader-toolbar" style={{ marginTop: 24 }}>
        {number > 1 && <Link className="quiet-button" to={`/quran/${number - 1}`}>السورة السابقة</Link>}
        <span className="section-meta">{number} من 114</span>
        {number < 114 && <Link className="quiet-button" to={`/quran/${number + 1}`}>السورة التالية</Link>}
      </div>}
    </main>
  );
}

function SurahReader({ surah, fontSize, setLastReading }: { surah: SurahContent; fontSize: number; setLastReading: (next: LastReading | ((previous: LastReading | null) => LastReading)) => void }) {
  const beginsWithBasmala = surah.number !== 1 && surah.number !== 9;
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting);
      const latest = visible.at(-1)?.target;
      const ayahNumber = latest ? Number((latest as HTMLElement).dataset.ayah) : 0;
      if (ayahNumber > 0) {
        setLastReading((previous) => previous?.surah === surah.number && previous.ayah === ayahNumber
          ? previous
          : { surah: surah.number, ayah: ayahNumber });
      }
    }, { rootMargin: "-18% 0px -66% 0px", threshold: 0 });
    list.querySelectorAll<HTMLElement>("[data-ayah]").forEach((ayah) => observer.observe(ayah));
    return () => observer.disconnect();
  }, [surah.number, surah.ayahs.length, setLastReading]);
  return (
    <>
      <div className="surah-cover">
        <h2>{surah.name}</h2>
        <p>{surah.englishName} · {surah.numberOfAyahs ?? surah.ayahs.length} آية · {surah.revelationType === "Meccan" ? "مكية" : surah.revelationType === "Medinan" ? "مدنية" : ""}</p>
        {beginsWithBasmala && <div className="basmala">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>}
      </div>
      <div className="ayah-list" ref={listRef}>
        {surah.ayahs.map((ayah) => {
          const citation = `سورة ${surah.name} · الآية ${ayah.numberInSurah}`;
          return <article className="ayah-card" key={ayah.number} data-ayah={ayah.numberInSurah}>
            <p className="ayah-text" style={{ fontSize }} lang="ar">{ayah.text}</p>
            <div className="ayah-footer">
              <span className="ayah-no">{String(ayah.numberInSurah).padStart(3, "0")}</span>
              <ContentActions kind="ayah" id={`${surah.number}:${ayah.numberInSurah}`} text={ayah.text} citation={citation} />
            </div>
          </article>;
        })}
      </div>
    </>
  );
}

export function TafsirPage() {
  const { data: surahs, loading: surahsLoading } = useSurahs();
  const [selected, setSelected] = useState(1);
  const { data, error, loading, source, retry } = useTafsir(selected);
  const current = surahs?.find((surah) => surah.number === selected);
  return (
    <main className="page-wrap">
      <PageHeading eyebrow="التفسير" title="التفسير الميسّر" intro="عرض التفسير المنقول من مصدره عند توفره، دون استبداله بنص آخر." />
      <section className="panel panel-pad">
        <div className="section-top"><div><h2 className="section-label">اختر سورة</h2><span className="section-meta">التفسير الميسّر</span></div><SourceNote source={source} /></div>
        <label className="field-label" htmlFor="tafsir-surah">السورة</label>
        <select className="select-field" id="tafsir-surah" value={selected} onChange={(event) => setSelected(Number(event.target.value))} disabled={surahsLoading || !surahs}>
          {(surahs ?? []).map((surah) => <option key={surah.number} value={surah.number}>{surah.number}. {surah.name}</option>)}
        </select>
        <div className="divider" />
        {loading && <LoadingState label="جارٍ تحميل التفسير" />}
        {!loading && error && <StatusState title="المصدر غير متاح الآن" message="تعذّر الوصول إلى التفسير الميسّر من مصدره. حاول مرة أخرى لاحقًا؛ لن نستبدل النص بمحتوى غير موثّق." action={retry} actionLabel="إعادة المحاولة" />}
        {!loading && !error && data?.length === 0 && <StatusState title="لا يوجد تفسير متاح" message="لم يُعِد المصدر آيات لهذه السورة." />}
        {!loading && !error && data && data.length > 0 && <div className="ayah-list">{data.map((ayah) => <article className="ayah-card" key={ayah.numberInSurah}>
          <p className="ayah-no">الآية {ayah.numberInSurah} · سورة {current?.name ?? selected}</p>
          <p className="ayah-text" style={{ fontSize: 25 }}>{ayah.arabicText}</p>
          <p className="tafseer-translation">{ayah.translation}</p>
        </article>)}</div>}
      </section>
    </main>
  );
}
