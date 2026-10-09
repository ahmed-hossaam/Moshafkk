import { useMemo, useState } from "react";
import { useHadithPage, useDuas, useAzkar } from "../hooks/useContent";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { azkarCategories } from "../services/content";
import { ContentActions, LoadingState, SearchBox, SourceNote, StatusState } from "../components/content";
import { PageHeading } from "../components/AppShell";

export function HadithPage() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const { data, error, loading, source, retry } = useHadithPage(page);
  const items = useMemo(() => (data?.items ?? []).filter((item) => `${item.text} ${item.number}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())), [data, query]);
  return (
    <main className="page-wrap">
      <PageHeading eyebrow="من السنة النبوية" title="سنن أبي داود" intro="النص العربي ورقم الحديث من خدمة hadis-api-id. لا تعرض الخدمة حكمًا على درجة الحديث، لذلك لا يضيف الموقع تصنيفًا من عنده." />
      <section className="panel panel-pad">
        <div className="section-top"><div><h2 className="section-label">الأحاديث</h2><span className="section-meta">{data ? `الصفحة ${data.page} من ${data.totalPages}` : "سنن أبي داود"}</span></div><SourceNote source={source} /></div>
        <div className="toolbar" style={{ marginBottom: 16 }}><SearchBox value={query} onChange={setQuery} placeholder="ابحث في أحاديث هذه الصفحة" /></div>
        {loading && <LoadingState label="جارٍ تحميل الأحاديث" />}
        {!loading && error && <StatusState title="تعذّر تحميل الأحاديث" message={error} action={retry} actionLabel="إعادة المحاولة" />}
        {!loading && !error && items.length === 0 && <StatusState title={query ? "لا توجد نتائج في هذه الصفحة" : "لا توجد أحاديث للعرض"} message={query ? "يبحث هذا الحقل في الصفحة المحمّلة حاليًا فقط." : "لم يُعِد المصدر محتوى لهذه الصفحة."} />}
        {!loading && !error && items.map((hadith) => {
          const citation = `${hadith.collection} · رقم ${hadith.number}`;
          return <article className="text-card" key={hadith.id}>
            <p className="text-card-copy" lang="ar">{hadith.text}</p>
            <div className="text-card-meta"><span>{citation}</span><ContentActions kind="hadith" id={hadith.id} text={hadith.text} citation={citation} href={hadith.referenceUrl} /></div>
          </article>;
        })}
        {data && !loading && !error && <div className="pagination">
          <button type="button" className="quiet-button" onClick={() => { setPage((current) => Math.max(1, current - 1)); setQuery(""); }} disabled={page <= 1}>السابق</button>
          <span>صفحة {data.page} من {data.totalPages}</span>
          <button type="button" className="quiet-button" onClick={() => { setPage((current) => Math.min(data.totalPages, current + 1)); setQuery(""); }} disabled={page >= data.totalPages}>التالي</button>
        </div>}
        <p className="section-meta" style={{ marginTop: 16 }}>البحث يقتصر على الأحاديث المحمّلة في الصفحة الحالية.</p>
      </section>
    </main>
  );
}

export function DuaPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("الكل");
  const { data, error, loading, source, retry } = useDuas();
  const categories = useMemo(() => [...new Set((data ?? []).map((dua) => dua.category))], [data]);
  const filtered = useMemo(() => (data ?? []).filter((dua) => (category === "الكل" || dua.category === category) && `${dua.text} ${dua.category} ${dua.description ?? ""} ${dua.reference ?? ""}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())), [data, category, query]);
  return (
    <main className="page-wrap">
      <PageHeading eyebrow="الدعاء" title="أدعية من مصادرها" intro="تصفّح الأدعية الواردة في أقسام المصدر، مع إظهار المرجع حين يقدّمه." />
      <section className="panel panel-pad">
        <div className="section-top"><div><h2 className="section-label">الأدعية</h2><span className="section-meta">{data ? `${data.length} دعاء` : "محتوى موثّق"}</span></div><SourceNote source={source} /></div>
        <div className="toolbar" style={{ marginBottom: 15 }}><SearchBox value={query} onChange={setQuery} placeholder="ابحث في الأدعية المحمّلة" /></div>
        {categories.length > 0 && <div className="category-pills" aria-label="تصنيف الأدعية">
          {["الكل", ...categories].map((name) => <button type="button" className="pill" key={name} aria-pressed={category === name} onClick={() => setCategory(name)}>{name}</button>)}
        </div>}
        {loading && <LoadingState label="جارٍ تحميل الأدعية" />}
        {!loading && error && <StatusState title="تعذّر تحميل الأدعية" message={error} action={retry} actionLabel="إعادة المحاولة" />}
        {!loading && !error && filtered.length === 0 && <StatusState title="لا توجد أدعية مطابقة" message={query ? "جرّب كلمات أخرى ضمن المحتوى الذي تم تحميله." : "لا توجد أدعية في هذا القسم حاليًا."} />}
        {!loading && !error && filtered.map((dua) => {
          const citation = dua.reference || dua.description || dua.category;
          return <article className="text-card" key={dua.id}>
            <span className="favorite-tag">{dua.category}</span>
            <p className="text-card-copy" lang="ar">{dua.text}</p>
            {dua.description && <p className="section-meta">{dua.description}</p>}
            <div className="text-card-meta"><span>{dua.reference || dua.category}</span><ContentActions kind="dua" id={dua.id} text={dua.text} citation={citation} /></div>
          </article>;
        })}
      </section>
    </main>
  );
}

export function AzkarPage() {
  const [category, setCategory] = useState<string>(azkarCategories[0]);
  const [counts, setCounts] = useLocalStorage<Record<string, number>>("moshafk-dhikr-counts", {});
  const { data, error, loading, source, retry } = useAzkar(category);
  return (
    <main className="page-wrap">
      <PageHeading eyebrow="الذكر" title="أذكار يومك" intro="الأذكار والعدد المأثور كما وردا في المصدر. اضغط العدّاد للتسبيح؛ ويبقى تقدّمك محفوظًا على جهازك." />
      <section className="panel panel-pad">
        <div className="section-top"><div><h2 className="section-label">اختر الورد</h2><span className="section-meta">أقسام الأذكار المتاحة</span></div><SourceNote source={source} /></div>
        <div className="category-pills" aria-label="أقسام الأذكار">
          {azkarCategories.map((name) => <button type="button" className="pill" key={name} aria-pressed={category === name} onClick={() => setCategory(name)}>{name}</button>)}
        </div>
        {loading && <LoadingState label="جارٍ تحميل الأذكار" />}
        {!loading && error && <StatusState title="تعذّر تحميل الأذكار" message={error} action={retry} actionLabel="إعادة المحاولة" />}
        {!loading && !error && data?.length === 0 && <StatusState title="لا توجد أذكار في هذا القسم" message="لم يُعِد المصدر سجلات لهذا القسم." />}
        {!loading && !error && data && data.length > 0 && <div className="favorite-list">
          {data.map((dhikr) => {
            const count = counts[dhikr.id] ?? 0;
            const completed = dhikr.count !== null && count >= dhikr.count;
            const citation = dhikr.reference || dhikr.category;
            return <article className="dhikr-card" key={dhikr.id}>
              <div className="section-top"><span className="favorite-tag">{dhikr.category}</span><ContentActions kind="dhikr" id={dhikr.id} text={dhikr.text} citation={citation} /></div>
              <p className="text-card-copy" lang="ar">{dhikr.text}</p>
              {dhikr.description && <p className="section-meta">{dhikr.description}</p>}
              {dhikr.reference && <p className="section-meta">{dhikr.reference}</p>}
              <button type="button" className="dhikr-counter" onClick={() => setCounts((previous) => ({ ...previous, [dhikr.id]: dhikr.count === null ? count + 1 : Math.min(count + 1, dhikr.count) }))} disabled={completed} aria-label={dhikr.count === null ? `عداد الذكر، ${count} تكرار. اضغط للزيادة` : `عداد الذكر، ${count} من ${dhikr.count}. اضغط للزيادة`}>
                <small>{dhikr.count === null ? "لم يحدد المصدر عددًا للتكرار" : completed ? "اكتمل العدد المذكور" : "اضغط للتسبيح"}</small>
                <strong>{dhikr.count === null ? `${count} تكرار` : `${count} / ${dhikr.count}`}</strong>
              </button>
              {dhikr.count !== null && <div className="dhikr-progress" role="progressbar" aria-label="تقدّم الذكر" aria-valuenow={count} aria-valuemin={0} aria-valuemax={dhikr.count}><span style={{ width: `${(count / dhikr.count) * 100}%` }} /></div>}
              <div style={{ display: "flex", justifyContent: "center", marginTop: 13 }}>
                <button type="button" className="quiet-button" onClick={() => setCounts((previous) => ({ ...previous, [dhikr.id]: 0 }))} disabled={count === 0}>إعادة العدّ</button>
              </div>
            </article>;
          })}
        </div>}
      </section>
    </main>
  );
}
