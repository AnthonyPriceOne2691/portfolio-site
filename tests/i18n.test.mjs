/**
 * B5: переключатель языка ведёт на ТУ ЖЕ страницу другого языка.
 *
 * Реляционный оракул (§6.5): здесь нет заранее записанных «правильных ответов»
 * для каждой страницы — проверяются ОТНОШЕНИЯ, которые обязаны держаться на
 * любом пути. Такой тест ловит входы, о которых автор не думал, а тест-значение
 * ловит только те, что он вспомнил.
 *
 * Инварианты:
 *  1) round-trip: ru -> en -> ru возвращает исходный путь;
 *  2) идемпотентность: перевод в тот же язык ничего не меняет;
 *  3) сохранение хвоста: меняется только префикс, страница остаётся той же —
 *     именно здесь наивная реализация отправляет пользователя на корень;
 *  4) согласованность с распознавателем: то, что вернул `pathForLocale`,
 *     распознаётся `localeFromPath` как запрошенный язык.
 */
import { strict as assert } from "node:assert";
import test from "node:test";

import {
  DEFAULT_LOCALE,
  localeFromPath,
  pathForLocale,
  link,
  ui,
} from "../src/i18n/ui.ts";

// Настоящая карта сайта. Страниц проектов здесь нет и не должно быть: кейсы
// раскрываются карточками на главной, а ссылка на проект — это якорь `/#slug`,
// хвост которого до `pathForLocale` вообще не доходит (см. отдельный тест ниже).
const REAL_TAILS = ["/", "/about/", "/404"];

/*
 * ⚠ Формы, которых на сайте НЕТ — и это не оплошность, а половина смысла файла.
 *
 * `pathForLocale` — чистая функция, и проверяется здесь не карта сайта, а
 * ИНВАРИАНТ преобразования: он обязан держаться на любом пути, включая тот, о
 * котором автор не думал. Оставить только реальные три — значит проверять
 * ровно то, что и так работает, и прозевать первый же нестандартный маршрут.
 *
 * `/en-dash/` стоит тут отдельной подножкой: путь НАЧИНАЕТСЯ на «/en», но
 * языковым префиксом не является. Наивная реализация через `startsWith("/en")`
 * откусила бы кусок слова и увела страницу в другой язык.
 */
const SYNTHETIC_TAILS = [
  "/a-b-c/",
  "/deep/nested/path/",
  "/no-trailing-slash",
  "/en-dash/",
];

const TAILS = [...REAL_TAILS, ...SYNTHETIC_TAILS];
const PATHS = [...TAILS, ...TAILS.map((t) => (t === "/" ? "/en/" : `/en${t}`))];

test("round-trip: двойное переключение возвращает исходный путь", () => {
  for (const p of PATHS) {
    const other = localeFromPath(p) === "ru" ? "en" : "ru";
    const there = pathForLocale(p, other);
    const back = pathForLocale(there, localeFromPath(p));
    assert.equal(back, p, `round-trip сломан на ${p}: ${there} -> ${back}`);
  }
});

test("идемпотентность: перевод в собственный язык ничего не меняет", () => {
  for (const p of PATHS) {
    assert.equal(
      pathForLocale(p, localeFromPath(p)),
      p,
      `не идемпотентно на ${p}`,
    );
  }
});

test("хвост пути сохраняется — не выбрасывает на корень", () => {
  for (const p of PATHS) {
    const tail = p.replace(/^\/en(?=\/|$)/, "") || "/";
    for (const target of ["ru", "en"]) {
      const got = pathForLocale(p, target);
      const gotTail = got.replace(/^\/en(?=\/|$)/, "") || "/";
      assert.equal(
        gotTail,
        tail,
        `${p} -> ${target}: страница подменилась на ${got}`,
      );
    }
  }
});

test("согласованность: распознаватель видит тот язык, который просили", () => {
  for (const p of PATHS) {
    for (const target of ["ru", "en"]) {
      assert.equal(localeFromPath(pathForLocale(p, target)), target);
    }
  }
});

test("RU живёт в корне, EN под /en (design v0.8 §7.3)", () => {
  assert.equal(DEFAULT_LOCALE, "ru");
  assert.equal(link("/about/", "ru"), "/about/");
  assert.equal(link("/about/", "en"), "/en/about/");
  assert.equal(localeFromPath("/"), "ru");
  assert.equal(localeFromPath("/en/"), "en");
  // `/english/` — не языковой префикс. Наивная проверка `startsWith('/en')`
  // считала бы иначе и уводила бы страницу в другой язык.
  assert.equal(localeFromPath("/english/"), "ru");
});

test("якорь проекта не выпадает из своего языка", () => {
  /*
   * Меню строит ссылку на карточку как `link("/", locale) + "#" + slug`
   * (см. `Nav`). Если корень языка вернётся без хвостового слэша, EN-ссылка
   * станет `/en#slug` — то есть якорем на РУССКОЙ главной, и переключение
   * языка молча потеряется. Проверяем именно ту склейку, которой пользуется
   * меню, а не абстрактный путь.
   */
  const slug = "linkbuilder";
  assert.equal(`${link("/", "ru")}#${slug}`, "/#linkbuilder");
  assert.equal(`${link("/", "en")}#${slug}`, "/en/#linkbuilder");
  for (const locale of ["ru", "en"]) {
    assert.equal(
      localeFromPath(link("/", locale)),
      locale,
      `корень языка ${locale} распознаётся как другой язык`,
    );
  }
});

test("словари не разошлись: у каждого ключа есть перевод в обоих языках", () => {
  const ruKeys = Object.keys(ui.ru).sort();
  const enKeys = Object.keys(ui.en).sort();
  assert.deepEqual(
    ruKeys,
    enKeys,
    "ключи RU и EN разошлись — строка выпадет молча",
  );
  for (const k of ruKeys) {
    assert.ok(ui.ru[k]?.trim(), `пустой RU-перевод: ${k}`);
    assert.ok(ui.en[k]?.trim(), `пустой EN-перевод: ${k}`);
  }
});
