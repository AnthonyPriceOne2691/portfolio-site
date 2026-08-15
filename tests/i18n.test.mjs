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

// Пути перебираются, а не выбираются: сюда попадают и «неудобные» формы.
const TAILS = [
  "/",
  "/projects/",
  "/projects/linkbuilder/",
  "/projects/voice-interview-coach/",
  "/about/",
  "/404",
  "/projects/a-b-c/",
];
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
  assert.equal(link("/projects/", "ru"), "/projects/");
  assert.equal(link("/projects/", "en"), "/en/projects/");
  assert.equal(localeFromPath("/"), "ru");
  assert.equal(localeFromPath("/en/"), "en");
  // `/english/` — не языковой префикс. Наивная проверка `startsWith('/en')`
  // считала бы иначе и уводила бы страницу в другой язык.
  assert.equal(localeFromPath("/english/"), "ru");
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
