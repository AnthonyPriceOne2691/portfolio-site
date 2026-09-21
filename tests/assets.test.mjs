/**
 * Ссылки на свои файлы ведут на существующие файлы.
 *
 * ⚠ Этот класс уже дважды прошёл мимо всех проверок. В `<head>` каждой
 * страницы стоял `og:image` → `/og.png`, а файла в проекте не было вовсе:
 * сборка зелёная, тесты зелёные, ошибку видно только на РАЗВЁРНУТОМ сайте и
 * только тем, кто за ней пойдёт — Telegram, hh, LinkedIn. Владелец превью
 * своей ссылки не запрашивает, поэтому узнать об этом было неоткуда.
 *
 * Проверяется собранный `dist/`, а не исходник: ссылка появляется на шаге
 * рендера, и мета-теги собираются шаблоном, а не пишутся руками.
 */
import { strict as assert } from "node:assert";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const DIST = fileURLToPath(new URL("../dist/", import.meta.url));
const ORIGIN = "https://portfolio-site.anthony-priceone.workers.dev";

/*
 * ⚠ Объявленный долг, а не исключение «чтобы зеленело». Файл резюме в
 * репозиторий не кладут — его нет ни у кого, кроме владельца, — а кнопка на
 * `/about/` на него уже ссылается. Пока строка здесь, гейт не молчит: он
 * называет долг по имени при каждом прогоне. Появится файл — проверка ниже
 * потребует убрать строку, чтобы список не сгнил.
 */
const DECLARED_MISSING = ["/cv.pdf"];

function pages(dir = DIST, found = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}${e.name}${e.isDirectory() ? "/" : ""}`;
    if (e.isDirectory()) pages(p, found);
    else if (e.name.endsWith(".html")) found.push([p.slice(DIST.length), readFileSync(p, "utf8")]);
  }
  return found;
}

/** Свои файлы, на которые ссылается страница. Маршруты без расширения — не файлы. */
function localAssets(html) {
  const out = new Set();
  for (const m of html.matchAll(/(?:href|src|content)="([^"]+)"/g)) {
    let v = m[1];
    if (v.startsWith(ORIGIN)) v = v.slice(ORIGIN.length);
    if (!v.startsWith("/")) continue;              // внешние и якоря — не наши
    if (!/\.[a-z0-9]{2,5}$/i.test(v)) continue;    // `/about/` — маршрут, не файл
    out.add(v.split("?")[0].split("#")[0]);
  }
  return out;
}

const HTML = pages();

test("есть что проверять: сайт собран", () => {
  assert.ok(HTML.length > 0, "в dist/ нет страниц — сначала npm run build");
  const refs = new Set(HTML.flatMap(([, h]) => [...localAssets(h)]));
  assert.ok(refs.size > 0, "ни одна страница не ссылается на свои файлы — проверка пуста");
});

test("каждый файл, на который ссылается страница, существует", () => {
  const missing = new Map();
  for (const [page, html] of HTML) {
    for (const ref of localAssets(html)) {
      if (DECLARED_MISSING.includes(ref)) continue;
      if (!existsSync(`${DIST}${ref.slice(1)}`)) {
        missing.set(ref, [...(missing.get(ref) ?? []), page]);
      }
    }
  }
  assert.deepEqual(
    [...missing.keys()], [],
    "ссылка ведёт на несуществующий файл:\n" +
      [...missing].map(([r, ps]) => `  ${r} — со страниц: ${ps.join(", ")}`).join("\n") +
      "\n  Положи файл в public/ (оттуда он попадёт в корень сайта) либо, если " +
      "его пока нет, внеси путь в DECLARED_MISSING с объяснением — тогда долг " +
      "будет назван, а не спрятан",
  );
});

test("фото в кружке: либо настоящее, либо заглушка — битой картинки нет", () => {
  /*
   * Герой главной держит круг под портрет. Соблазн — поставить `<img>`
   * безусловно: тогда до появления файла у каждого посетителя висит иконка
   * битой картинки, и хуже всего, что владелец её не увидит, потому что у него
   * файл есть. Поэтому либо настоящее фото, либо стеклянная заглушка, и ровно
   * одно из двух. Тот же запрет на пустую дыру, что и у видеофрейма (B3).
   */
  const heroes = HTML.filter(([p]) => p === "index.html" || p === "en/index.html");
  assert.ok(heroes.length === 2, "не нашлись обе главные — проверять нечего");

  for (const [page, html] of heroes) {
    const img = html.match(/<img[^>]*class="photo"[^>]*>/)?.[0];
    const stub = /<div class="photo glass"/.test(html);

    assert.ok(img || stub, `${page}: в круге героя нет ни фото, ни заглушки`);
    assert.ok(!(img && stub), `${page}: фото и заглушка одновременно`);
    if (!img) continue;

    const src = img.match(/src="([^"]+)"/)?.[1] ?? "";
    assert.ok(
      src.startsWith("/") && existsSync(`${DIST}${src.slice(1)}`),
      `${page}: фото ${src} не существует — в круге будет битая картинка`,
    );
    assert.match(img, /alt="[^"]+"/, `${page}: у портрета пустой alt`);
    // Без явных размеров браузер не знает высоту до загрузки, и страница
    // дёргается на первом экране ровно там, где на неё впервые смотрят.
    assert.match(img, /width="\d+"/, `${page}: у фото нет width`);
    assert.match(img, /height="\d+"/, `${page}: у фото нет height`);
  }
});

test("список объявленного долга не сгнил", () => {
  // Файл появился, а строка осталась — и гейт перестал судить именно то, ради
  // чего его заводили. Ровно так умирают списки исключений.
  const resolved = DECLARED_MISSING.filter((r) => existsSync(`${DIST}${r.slice(1)}`));
  assert.deepEqual(
    resolved, [],
    `файл(ы) ${resolved.join(", ")} уже на месте — убери их из DECLARED_MISSING ` +
      "в tests/assets.test.mjs, иначе исключение переживёт свою причину",
  );
});
