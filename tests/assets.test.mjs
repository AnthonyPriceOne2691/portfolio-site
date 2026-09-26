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
 * ⚠ Объявленный долг, а не исключение «чтобы зеленело». Путь сюда вносят,
 * когда ссылка уже стоит, а файла ещё нет: гейт тогда не молчит, а называет
 * долг по имени при каждом прогоне. Появится файл — проверка ниже потребует
 * убрать строку, чтобы список не сгнил.
 *
 * Последним здесь жил `/cv.pdf`: кнопка на `/about/` вела в 404 с августа.
 * Резюме положено 26.09, и список пуст — пусть так и остаётся.
 */
const DECLARED_MISSING = [];

function pages(dir = DIST, found = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}${e.name}${e.isDirectory() ? "/" : ""}`;
    if (e.isDirectory()) pages(p, found);
    else if (e.name.endsWith(".html"))
      found.push([p.slice(DIST.length), readFileSync(p, "utf8")]);
  }
  return found;
}

/** Свои файлы, на которые ссылается страница. Маршруты без расширения — не файлы. */
function localAssets(html) {
  const out = new Set();
  for (const m of html.matchAll(/(?:href|src|content)="([^"]+)"/g)) {
    let v = m[1];
    if (v.startsWith(ORIGIN)) v = v.slice(ORIGIN.length);
    if (!v.startsWith("/")) continue; // внешние и якоря — не наши
    if (!/\.[a-z0-9]{2,5}$/i.test(v)) continue; // `/about/` — маршрут, не файл
    out.add(v.split("?")[0].split("#")[0]);
  }
  return out;
}

const HTML = pages();

test("есть что проверять: сайт собран", () => {
  assert.ok(HTML.length > 0, "в dist/ нет страниц — сначала npm run build");
  const refs = new Set(HTML.flatMap(([, h]) => [...localAssets(h)]));
  assert.ok(
    refs.size > 0,
    "ни одна страница не ссылается на свои файлы — проверка пуста",
  );
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
    [...missing.keys()],
    [],
    "ссылка ведёт на несуществующий файл:\n" +
      [...missing]
        .map(([r, ps]) => `  ${r} — со страниц: ${ps.join(", ")}`)
        .join("\n") +
      "\n  Положи файл в public/ (оттуда он попадёт в корень сайта) либо, если " +
      "его пока нет, внеси путь в DECLARED_MISSING с объяснением — тогда долг " +
      "будет назван, а не спрятан",
  );
});

/**
 * Круг в герое: РОВНО ОДНО из трёх — видео «о себе», фото или заглушка.
 *
 * Соблазн — поставить `<img>` (или `<video>`) безусловно: тогда до появления
 * файла у каждого посетителя висит битая картинка, и хуже всего, что владелец
 * её не увидит, потому что у него файл есть. Тот же запрет на пустую дыру, что
 * и у видеофрейма (B3).
 *
 * Вынесено в функцию не ради красоты: ниже её прогоняют на канарейках. Проверка
 * ветки, которой ни на одной живой странице пока нет, иначе просто спит.
 */
function heroCircle(page, html) {
  const img = html.match(/<img[^>]*class="photo"[^>]*>/)?.[0];
  const video = html.match(/<video[^>]*class="photo"[^>]*>/)?.[0];
  const stub = /<div class="photo glass"/.test(html) ? "заглушка" : undefined;

  const found = [img, video, stub].filter(Boolean);
  assert.equal(
    found.length,
    1,
    `${page}: в круге героя должно быть ровно одно из трёх — видео, фото или ` +
      `заглушка; найдено ${found.length}`,
  );

  const media = video ?? img;
  if (!media) return;

  // Без явных размеров браузер не знает высоту до загрузки, и страница
  // дёргается на первом экране ровно там, где на неё впервые смотрят.
  assert.match(media, /width="\d+"/, `${page}: у круга нет width`);
  assert.match(media, /height="\d+"/, `${page}: у круга нет height`);

  // И кадр, и файл: битым может оказаться любой из двух путей.
  for (const attr of ["src", "poster"]) {
    const ref = media.match(new RegExp(`${attr}="([^"]+)"`))?.[1];
    if (!ref) continue;
    assert.ok(
      ref.startsWith("/") && existsSync(`${DIST}${ref.slice(1)}`),
      `${page}: ${attr}="${ref}" не существует — в круге будет дыра`,
    );
  }

  if (img) {
    assert.match(img, /alt="[^"]+"/, `${page}: у портрета пустой alt`);
    return;
  }

  // Постер обязателен: без него круг до первого клика — чёрное пятно на
  // первом экране, то есть ровно та дыра, которую здесь и запрещают.
  assert.match(video, /poster="[^"]+"/, `${page}: у видео в круге нет постера`);
  // `preload="none"` — иначе первый экран тянет мегабайты ради кадра, который
  // уже нарисован постером.
  assert.match(
    video,
    /preload="none"/,
    `${page}: видео в круге качается до клика`,
  );

  // Играет по клику — значит обязано быть кнопкой с именем: иначе его не
  // запустить ни с клавиатуры, ни скринридером.
  const button = html.match(/<button[^>]*class="intro"[\s\S]*?<\/button>/)?.[0];
  assert.ok(button, `${page}: видео в круге не обёрнуто кнопкой`);
  assert.match(
    button,
    /aria-label="[^"]+"/,
    `${page}: у кнопки круга нет имени`,
  );
  assert.ok(button.includes(video), `${page}: видео лежит вне своей кнопки`);
}

test("круг в герое: видео, фото или заглушка — ровно одно, и без битых ссылок", () => {
  const heroes = HTML.filter(([p]) => p === "index.html");
  assert.equal(heroes.length, 1, "не нашлась главная — проверять нечего");
  for (const [page, html] of heroes) heroCircle(page, html);
});

test("поверка прибора: проверка круга не спит на видео-ветке", () => {
  /*
   * ⚠ Видео в круге пока нет ни на одной странице — значит эту ветку не
   * исполняет никто, и зелёный прогон о ней не говорит РОВНО НИЧЕГО. Так гейт
   * и превращается в украшение: объявлен, вписан, молчит.
   *
   * Поэтому ветка прогоняется на канарейках: одна обязана пройти, остальные —
   * упасть. Файлы в них взяты существующие (`/photo.jpg`, `/og.jpg`) — здесь
   * проверяется логика проверки, а не формат медиа.
   */
  const good =
    '<button class="intro" type="button" aria-pressed="false" ' +
    'aria-label="Видео о себе"><video class="photo" src="/photo.jpg" ' +
    'poster="/og.jpg" preload="none" width="200" height="200"></video>' +
    "</button>";
  heroCircle("канарейка", good);

  const broken = {
    "видео без постера": good.replace(' poster="/og.jpg"', ""),
    // ⚠ Имена канареек обязаны быть ЗАВЕДОМО невозможными. Первая версия
    // ссылалась на `/intro.mp4` — и умерла в тот же день, когда файл с таким
    // именем лёг в `public/`: «отсутствующий» файл нашёлся, канарейка
    // замолчала. Отрицательная проверка не должна зависеть от содержимого
    // проекта, иначе она выключается сама, тихо и в самый нужный момент.
    "файла видео нет": good.replace(
      'src="/photo.jpg"',
      'src="/такого-файла-нет.mp4"',
    ),
    "постера нет на диске": good.replace(
      'poster="/og.jpg"',
      'poster="/такого-файла-нет.jpg"',
    ),
    "видео качается до клика": good.replace(' preload="none"', ""),
    "видео без кнопки": good.replace(/<\/?button[^>]*>/g, ""),
    "кнопка без имени": good.replace(' aria-label="Видео о себе"', ""),
    "видео и заглушка разом": good + '<div class="photo glass"></div>',
    "нет размеров": good.replace(' width="200" height="200"', ""),
  };
  for (const [name, html] of Object.entries(broken)) {
    assert.throws(
      () => heroCircle("канарейка", html),
      `проверка круга пропустила «${name}» — значит она ничего не проверяет`,
    );
  }
});

test("список объявленного долга не сгнил", () => {
  // Файл появился, а строка осталась — и гейт перестал судить именно то, ради
  // чего его заводили. Ровно так умирают списки исключений.
  const resolved = DECLARED_MISSING.filter((r) =>
    existsSync(`${DIST}${r.slice(1)}`),
  );
  assert.deepEqual(
    resolved,
    [],
    `файл(ы) ${resolved.join(", ")} уже на месте — убери их из DECLARED_MISSING ` +
      "в tests/assets.test.mjs, иначе исключение переживёт свою причину",
  );
});
