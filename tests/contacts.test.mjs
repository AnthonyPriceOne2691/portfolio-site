/**
 * Контакты: единственный источник правды доезжает до страницы, заглушек нет.
 *
 * Почему это тест, а не «посмотрели глазами». Контакты — то немногое, что
 * читатель витрины СОБИРАЕТСЯ использовать: остальное он просматривает. При
 * этом ошибка в них не выглядит ошибкой. Страница собирается, ссылка кликается,
 * подвал на месте — просто письмо уходит на `hello@example.com`, а телеграм
 * открывает пустой `https://t.me/`. Ровно так и было до 21.09, и никакой гейт
 * этого не ловил.
 *
 * Проверяется СОБРАННЫЙ `dist/`, а не исходник: между константой и версткой
 * есть шаг рендера, и потерять контакт можно именно на нём.
 */
import { strict as assert } from "node:assert";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";

import { CONTACTS, PROFILES } from "../src/lib/contacts.ts";

const DIST = new URL("../dist/", import.meta.url);

/** Все собранные страницы, рекурсивно. */
function pages(dir = DIST, found = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const next = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, dir);
    if (entry.isDirectory()) pages(next, found);
    else if (entry.name.endsWith(".html"))
      found.push([next, readFileSync(next, "utf8")]);
  }
  return found;
}

const HTML = pages();

test("есть что проверять: сайт собран", () => {
  // Без этой строки все проверки ниже проходят на пустом списке файлов.
  assert.ok(
    HTML.length > 0,
    "в dist/ нет ни одной страницы — сначала npm run build",
  );
});

test("контакты из единственного источника доехали до каждой страницы", () => {
  const expected = [CONTACTS.email, CONTACTS.telegram.url, ...PROFILES];
  for (const [file, html] of HTML) {
    for (const contact of expected) {
      assert.ok(
        html.includes(contact),
        `${file.pathname.split("/dist/")[1]}: потерян контакт ${contact} — ` +
          `подвал разошёлся с src/lib/contacts.ts`,
      );
    }
  }
});

test("в собранном сайте не осталось контактов-заглушек", () => {
  /*
   * ⚠ `example.pages.dev` сюда НЕ попадает намеренно: это временный домен из
   * `astro.config.mjs`, он помечен там своим TODO и меняется отдельно от
   * контактов. Ловим только то, что притворяется РАБОЧИМ адресом.
   */
  const placeholders = [
    [/[\w.+-]+@example\.(com|org|net)/i, "почта-заглушка"],
    [/https:\/\/t\.me\/["'\s]/i, "телеграм без адресата"],
    [/mailto:["'\s]/i, "пустой mailto:"],
    [/linkedin\.com\/in\/["'\s]/i, "LinkedIn без профиля"],
  ];
  for (const [file, html] of HTML) {
    for (const [pattern, what] of placeholders) {
      const hit = html.match(pattern);
      assert.equal(
        hit,
        null,
        `${file.pathname.split("/dist/")[1]}: ${what} — «${hit?.[0]}»`,
      );
    }
  }
});

test("schema.org: почта в `email`, а в `sameAs` только профили", () => {
  // `sameAs` по спецификации — СТРАНИЦЫ того же человека, а не способы связи.
  // Почта, попавшая туда, не ошибка разметки на вид, но врёт о своём смысле.
  const [, home] = HTML.find(([f]) => f.pathname.endsWith("/dist/index.html"));
  const raw = home.match(
    /<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/,
  );
  assert.ok(raw, "на главной нет JSON-LD — превью ссылки останется без автора");

  const person = JSON.parse(raw[1]);
  assert.equal(person.email, `mailto:${CONTACTS.email}`);
  assert.deepEqual(person.sameAs, [...PROFILES]);
  assert.ok(
    !person.sameAs.some(
      (url) => url.includes("@") || url.startsWith("mailto:"),
    ),
    "в sameAs попала почта — это поле про профили, а не про связь",
  );
});
