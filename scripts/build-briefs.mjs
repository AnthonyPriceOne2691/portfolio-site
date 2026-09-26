/**
 * Сборка технических брифов: `briefs/<slug>.html` → `public/briefs/<slug>.pdf`.
 *
 *   node scripts/build-briefs.mjs
 *
 * ⚠ PDF собирается ЗДЕСЬ, руками, и коммитится, а не собирается на хостинге:
 * Cloudflare строит сайт одним `astro build`, браузера для печати у него нет.
 * Цена такого решения — PDF может отстать от исходника. Её закрывает манифест:
 * скрипт пишет в `briefs/manifest.json` хэши исходника и PDF, а
 * `tests/briefs.test.mjs` краснеет, если исходник поправили и не пересобрали
 * или PDF подменили в обход скрипта. У CV такой защиты нет (его исходник живёт
 * вне репозитория) — брифы этой беды не повторяют.
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const ROOT = new URL("../", import.meta.url);
const SRC = new URL("briefs/", ROOT);
const OUT = new URL("public/briefs/", ROOT);
const MANIFEST = new URL("manifest.json", SRC);

/** Формат брифа — ровно две страницы (см. `briefs/brief.css`). */
export const PAGES = 2;
/** Порог pre-commit `check-added-large-files`: больше — коммит не пройдёт. */
export const MAX_BYTES = 512 * 1024;

export const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

/** Хэш исходника = сам бриф + общий макет: правка макета тоже требует пересборки. */
export function sourceHash(slug) {
  const html = readFileSync(new URL(`${slug}.html`, SRC));
  const css = readFileSync(new URL("brief.css", SRC));
  return sha256(Buffer.concat([html, Buffer.from("\n/* brief.css */\n"), css]));
}

/** Число страниц PDF — по объектам /Type /Page (не /Pages). */
export const pageCount = (pdf) =>
  (pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? []).length;

export const slugs = () =>
  readdirSync(SRC)
    .filter((f) => f.endsWith(".html") && !f.startsWith("_"))
    .map((f) => f.slice(0, -".html".length))
    .sort();

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const manifest = {};
  const problems = [];
  try {
    for (const slug of slugs()) {
      const page = await browser.newPage();
      await page.goto(new URL(`${slug}.html`, SRC).href);
      await page.evaluate(() => document.fonts.ready);
      await page.emulateMedia({ media: "print" });
      // ⚠ Лист режет лишнее (`overflow: hidden`), и срезанное МОЛЧИТ: страниц
      // по-прежнему две, PDF собирается. Так однажды «Worth knowing» ушло под
      // подвал. Поэтому меряем: низ содержимого каждого листа не заходит в его
      // нижнее поле, где стоит подвал.
      const spill = await page.evaluate(() =>
        [...document.querySelectorAll(".page")].flatMap((sheet, i) => {
          const r = sheet.getBoundingClientRect();
          const limit = r.bottom - parseFloat(getComputedStyle(sheet).paddingBottom);
          return [...sheet.children]
            .filter((el) => !el.classList.contains("foot"))
            .map((el) => ({ el, bottom: el.getBoundingClientRect().bottom }))
            .filter(({ bottom }) => bottom > limit + 0.5)
            .map(({ el, bottom }) =>
              `лист ${i + 1}: <${el.tagName.toLowerCase()} class="${el.className}"> ниже поля на ${Math.round(bottom - limit)} px`,
            );
        }),
      );
      problems.push(...spill.map((s) => `${slug}: ${s}`));
      const target = new URL(`${slug}.pdf`, OUT);
      await page.pdf({
        path: target.pathname,
        preferCSSPageSize: true,
        printBackground: true,
      });
      await page.close();

      const pdf = readFileSync(target);
      const pages = pageCount(pdf);
      const bytes = statSync(target).size;
      if (pages !== PAGES) problems.push(`${slug}: страниц ${pages}, а формат — ${PAGES}`);
      if (bytes > MAX_BYTES) problems.push(`${slug}: ${bytes} байт > ${MAX_BYTES}`);
      manifest[slug] = { source: sourceHash(slug), pdf: sha256(pdf), pages, bytes };
      console.log(`${slug}: ${pages} стр., ${Math.round(bytes / 1024)} КБ`);
    }
  } finally {
    await browser.close();
  }
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  if (problems.length > 0) {
    console.error("\n" + problems.join("\n"));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
