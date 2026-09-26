/**
 * Число на сайте живёт в одном месте — на карточке проекта.
 *
 * Класс дефекта, который здесь закрыт: один и тот же факт повторён в
 * нескольких местах, и между копиями нет связи. Так «6,500+ tests, ~30
 * services» простояли на /about/ ещё месяц после того, как аудит 22.09 поменял
 * карточку на 11,000+: карточку поправили, а про её копию в словаре забыли.
 * Сборка при этом зелёная — текст не противоречит ничему, что проверяет гейт.
 *
 * Правило: каждое число в общих текстах сайта (`src/lib/text.ts` — герой,
 * /about/, описания страниц) обязано стоять на опубликованной карточке. Число,
 * которому на карточке места нет, вносится в NOT_ON_CARDS с причиной — тогда
 * исключение названо, а не спрятано.
 */
import { strict as assert } from "node:assert";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";

const ROOT = new URL("../", import.meta.url);

/** Число → почему его нет ни на одной карточке. */
const NOT_ON_CARDS = new Map([
  ["8", "срок до прода клиентского сервиса под NDA — своей карточки у него нет"],
  // ⚠ «5» на карточках есть, но это ДРУГОЕ число, и без записи здесь оно
  // проходило бы проверку совпадением. Было «14»: столько прошло до выкладки,
  // из них 9 дней готовый проект ждал сервера (слово владельца, 26.09).
  ["5", "дней до готовности к проду клиентского сервиса под NDA — своей карточки у него нет"],
  ["3", "«UTC+3» в статусе героя — часовой пояс, а не метрика"],
]);

/** Числа в тексте: «11,000+», «97.9%», «~3», «22». Часть слова (Qwen3) — не число. */
function numbers(text) {
  return [...text.matchAll(/(?<![\w.])~?(\d[\d,]*(?:\.\d+)?)\+?%?(?![\w])/g)].map((m) => m[1]);
}

function cardsCorpus() {
  const dir = new URL("src/content/projects/", ROOT);
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => readFileSync(new URL(f, dir), "utf8"))
    .filter((md) => !/^draft:\s*true\s*$/m.test(md))
    .join("\n");
}

/** Значения словаря `text.ts`: только строки, ключи и код не считаются. */
function siteTexts() {
  const src = readFileSync(new URL("src/lib/text.ts", ROOT), "utf8");
  const entries = [...src.matchAll(/^\s*"([\w.-]+)":\s*\n?\s*"((?:[^"\\]|\\.)*)"/gm)];
  return entries.map((m) => [m[1], m[2]]);
}

test("проверять есть что: словарь и карточки прочитаны", () => {
  const texts = siteTexts();
  assert.ok(texts.length > 20, `из text.ts прочитано ${texts.length} строк — разбор сломан`);
  assert.ok(
    texts.some(([, v]) => numbers(v).length > 0),
    "ни в одной строке словаря не нашлось чисел — либо их правда нет, либо разбор чисел сломан",
  );
});

test("каждое число в общих текстах сайта стоит на карточке", () => {
  const cards = cardsCorpus();
  const cardNumbers = new Set(numbers(cards));
  const stray = [];
  for (const [key, value] of siteTexts()) {
    for (const n of numbers(value)) {
      if (!cardNumbers.has(n) && !NOT_ON_CARDS.has(n)) stray.push(`${key}: ${n}`);
    }
  }
  assert.deepEqual(
    stray,
    [],
    "число есть в общем тексте сайта, но ни на одной карточке:\n  " +
      stray.join("\n  ") +
      "\n  Скорее всего, карточку поправили, а её копию в src/lib/text.ts — нет. " +
      "Возьмите число с карточки; если числу там места нет — внесите его в " +
      "NOT_ON_CARDS с причиной",
  );
});

test("исключение не переживает свою причину", () => {
  const texts = siteTexts().map(([, v]) => v).join("\n");
  const unused = [...NOT_ON_CARDS.keys()].filter((n) => !numbers(texts).includes(n));
  assert.deepEqual(
    unused,
    [],
    `в NOT_ON_CARDS числа, которых на сайте больше нет: ${unused.join(", ")} — уберите их`,
  );
});
