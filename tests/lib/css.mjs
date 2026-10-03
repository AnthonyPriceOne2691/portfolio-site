/**
 * Весь CSS собранного сайта — где бы он ни лежал.
 *
 * ⚠ С 03.10 стили встроены в страницы (`inlineStylesheets: "always"` в
 * astro.config.mjs), а до того жили файлами `_astro/*.css`. Тест, читающий
 * только одно из двух мест, после смены настройки не падает, а СЛЕПНЕТ:
 * проверять нечего — и он зелёный. Поэтому читаются оба места сразу, а тесты
 * сами проверяют, что CSS нашёлся.
 */
import { readdirSync, readFileSync } from "node:fs";

export function builtCss(dist) {
  const files = readdirSync(dist, { recursive: true }).map(String);
  const sheets = files
    .filter((f) => f.endsWith(".css"))
    .map((f) => readFileSync(new URL(f, dist), "utf8"));
  for (const page of files.filter((f) => f.endsWith(".html"))) {
    const html = readFileSync(new URL(page, dist), "utf8");
    for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g))
      sheets.push(m[1]);
  }
  return sheets.join("\n");
}
