import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
const template = await readFile(resolve(dist, "index.html"), "utf8");
const origin = "https://moshafk.vercel.app";

const pages = [
  {
    path: "/quran",
    title: "القرآن الكريم",
    description: "تصفّح سور القرآن الكريم واقرأ آياتها مع حفظ موضع القراءة على جهازك.",
  },
  {
    path: "/hadith",
    title: "سنن أبي داود",
    description: "تصفّح نصوصًا عربية من سنن أبي داود مع رقم الحديث ومصدر النص.",
  },
  {
    path: "/dua",
    title: "الأدعية",
    description: "أدعية من الأقسام المتاحة، مع إظهار المرجع حين يقدّمه المصدر.",
  },
  {
    path: "/azkar",
    title: "الأذكار",
    description: "أذكار يومية مع عدّاد يحفظ تقدّمك محليًا على جهازك.",
  },
  {
    path: "/prayer",
    title: "مواقيت الصلاة",
    description: "اعرض مواقيت الصلاة لمدينة تختارها يدويًا وطريقة الحساب المناسبة.",
  },
  {
    path: "/tafseer",
    title: "التفسير الميسّر",
    description: "اقرأ التفسير الميسّر بجوار الآيات كما يورده المصدر.",
  },
  {
    path: "/favorites",
    title: "المحفوظات",
    description: "ارجع إلى الآيات والأحاديث والأدعية والأذكار التي حفظتها على جهازك.",
  },
];

const escapeHtml = (value) =>
  value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");

function updateTag(html, regex, replacement) {
  if (!regex.test(html)) throw new Error(`SEO template tag not found: ${regex}`);
  return html.replace(regex, replacement);
}

function makePage(path, title, description) {
  const safeTitle = escapeHtml(`${title} — مُصْحَفُكَ`);
  const safeDescription = escapeHtml(description);
  const canonical = `${origin}${path === "/" ? "/" : path}`;
  let html = template;
  html = updateTag(html, /<title>[\s\S]*?<\/title>/, `<title>${safeTitle}</title>`);
  html = updateTag(
    html,
    /<meta\s+name="description"[\s\S]*?\/>/,
    `<meta name="description" content="${safeDescription}" />`,
  );
  html = updateTag(
    html,
    /<meta\s+property="og:title"[\s\S]*?\/>/,
    `<meta property="og:title" content="${safeTitle}" />`,
  );
  html = updateTag(
    html,
    /<meta\s+property="og:description"[\s\S]*?\/>/,
    `<meta property="og:description" content="${safeDescription}" />`,
  );
  html = updateTag(
    html,
    /<link\s+rel="canonical"[^>]*\/>/,
    `<link rel="canonical" href="${canonical}" />`,
  );
  const routeMeta = [
    `<meta property="og:url" content="${canonical}" />`,
    `<meta name="twitter:title" content="${safeTitle}" />`,
    `<meta name="twitter:description" content="${safeDescription}" />`,
  ];
  if (path === "/favorites") {
    routeMeta.push('<meta name="robots" content="noindex,follow" />');
  }
  html = updateTag(html, /<\/head>/, `${routeMeta.join("\n    ")}\n  </head>`);
  return html;
}

async function writePage(path, title, description) {
  const relativePath = path === "/" ? "index.html" : `${path.slice(1)}/index.html`;
  const outputPath = resolve(dist, relativePath);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, makePage(path, title, description));
}

await writePage(
  "/",
  "رفيقك اليومي للقرآن والذكر",
  "رفيقك اليومي لقراءة القرآن الكريم والأذكار والأدعية ومتابعة مواقيت الصلاة.",
);

for (const page of pages) {
  await writePage(page.path, page.title, page.description);
}

const surahs = JSON.parse(await readFile(resolve(root, "JS/JSON/main.json"), "utf8"));
const surahPaths = [];
for (const surah of surahs) {
  const number = Number(surah.number);
  if (!Number.isInteger(number) || number < 1 || number > 114) continue;
  const name = String(surah.name_ar).replace(/^سورة\s*/, "");
  await writePage(
    `/quran/${number}`,
    `سورة ${name}`,
    `اقرأ سورة ${name} مع حفظ موضع التلاوة على جهازك.`,
  );
  surahPaths.push(`/quran/${number}`);
}

const xmlEscape = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
const sitemapPaths = [
  "/",
  ...pages.filter((page) => page.path !== "/favorites").map((page) => page.path),
  ...surahPaths,
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapPaths
  .map((path) => `  <url><loc>${xmlEscape(`${origin}${path === "/" ? "/" : path}`)}</loc></url>`)
  .join("\n")}\n</urlset>\n`;
await writeFile(resolve(dist, "sitemap.xml"), sitemap);

console.log(`Generated SEO entry pages for ${pages.length + surahs.length + 1} routes.`);
