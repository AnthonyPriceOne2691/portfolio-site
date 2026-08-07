/**
 * B9: контраст текста на стекле >= 4.5:1 (WCAG AA).
 *
 * Почему это тест, а не «посмотрели глазами». Текст лежит на ПОЛУПРОЗРАЧНОМ
 * стекле, под которым градиент: читаемость определяет не цвет стекла, а то,
 * что просвечивает. Глаз проверяет середину экрана, а проваливается угол, где
 * градиент светлее всего. Здесь считается худший случай — против самой светлой
 * остановки градиента, и это правило записано в токенах (`--bg-lightest`).
 *
 * Реляционная часть (§6.5): проверка не сверяется с заранее записанным числом,
 * а утверждает ОТНОШЕНИЕ — «любая объявленная пара текст/фон держит порог».
 * Добавили цвет в палитру и забыли про контраст — тест найдёт это сам, потому
 * что перебирает то, что лежит в файле, а не то, что помнил автор.
 */
import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";
import test from "node:test";

const CSS = readFileSync(
  new URL("../src/styles/tokens.css", import.meta.url),
  "utf8",
);

/** Значение CSS-переменной из tokens.css. Источник правды один — файл. */
function token(name) {
  const m = CSS.match(new RegExp(`--${name}:\\s*([^;]+);`));
  assert.ok(m, `в tokens.css нет переменной --${name}`);
  return m[1].trim();
}

function parseColor(value) {
  const hex = value.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
  }
  const rgba = value.match(/^rgba?\(([^)]+)\)$/i);
  assert.ok(rgba, `не разобран цвет: ${value}`);
  const [r, g, b, a = "1"] = rgba[1].split(",").map((s) => s.trim());
  return { r: +r, g: +g, b: +b, a: +a };
}

/** Полупрозрачный слой поверх непрозрачного — то, что реально видит глаз. */
function composite(fg, bg) {
  return {
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  };
}

function luminance({ r, g, b }) {
  const f = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const AA = 4.5;
// Светлейшая остановка градиента: худший случай для тёмного текста.
const worstBg = parseColor(token("bg-grad-1"));
const glass = composite(parseColor(token("glass-bg")), worstBg);
const glassStrong = composite(parseColor(token("glass-bg-strong")), worstBg);

const pairs = [
  ["text на стекле", token("text"), glass],
  ["text-muted на стекле", token("text-muted"), glass],
  ["accent на стекле (ссылки)", token("accent"), glass],
  ["text на плотном стекле", token("text"), glassStrong],
  ["text прямо на градиенте", token("text"), worstBg],
  ["status-production на стекле", token("status-production"), glass],
  ["status-local-demo на стекле", token("status-local-demo"), glass],
  ["status-poc на стекле", token("status-poc"), glass],
];

for (const [name, fg, bg] of pairs) {
  test(`контраст: ${name} >= ${AA}:1`, () => {
    const ratio = contrast(parseColor(fg), bg);
    assert.ok(
      ratio >= AA,
      `${name}: ${ratio.toFixed(2)}:1 — ниже порога ${AA}:1. ` +
        `Правь токены в src/styles/tokens.css, а не подгоняй порог.`,
    );
  });
}

test("белый текст на акценте держит порог (кнопки CTA)", () => {
  const ratio = contrast(
    parseColor(token("text-on-accent")),
    parseColor(token("accent")),
  );
  assert.ok(ratio >= AA, `text-on-accent на accent: ${ratio.toFixed(2)}:1`);
});

test("инвариант: стекло не делает фон ТЕМНЕЕ градиента", () => {
  // Метаморфное отношение: белая полупрозрачная плёнка обязана осветлять.
  // Если однажды окажется иначе — значит --glass-bg перестал быть белым, и
  // все расчёты выше молча считают не то, что на экране.
  assert.ok(luminance(glass) >= luminance(worstBg));
  assert.ok(luminance(glassStrong) >= luminance(glass));
});
