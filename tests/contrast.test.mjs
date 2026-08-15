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

/**
 * oklch -> sRGB. Нужен потому, что палитра живёт в oklch (см. tokens.css), а
 * контраст WCAG считается по sRGB. Формулы Оттоссона: oklch -> oklab -> LMS ->
 * линейный sRGB -> гамма.
 *
 * ⚠ Правильность конвертера проверяется тестом ниже на контрольных цветах.
 * Без этого он был бы самым опасным местом файла: ошибка здесь не роняет
 * ничего, а тихо превращает проверку контраста в генератор случайных чисел.
 */
function oklchToRgb(L, C, h) {
  const hr = (h * Math.PI) / 180;
  const a = C * Math.cos(hr);
  const b = C * Math.sin(hr);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  const [r, g, bl] = lin.map((c) => {
    const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
    return Math.round(Math.min(1, Math.max(0, v)) * 255);
  });
  return { r, g, b: bl, a: 1 };
}

function parseColor(value) {
  const hex = value.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
  }
  const ok = value.match(/^oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*\)$/i);
  if (ok) return oklchToRgb(+ok[1] / 100, +ok[2], +ok[3]);
  // И `rgb(255 255 255 / 0.55)`, и `rgba(255,255,255,0.55)`: два написания
  // живут в одном файле, потому что первое пришло из первоисточника палитры.
  const rgb = value.match(/^rgba?\(([^)]+)\)$/i);
  assert.ok(rgb, `не разобран цвет: ${value}`);
  const parts = rgb[1]
    .replace(/\//g, " ")
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(Number);
  const [r, g, b, a = 1] = parts;
  return { r, g, b, a };
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
const worstBg = parseColor(token("bg-lightest"));
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

test("конвертер oklch верен — проверка на контрольных цветах", () => {
  // Без этой проверки весь файл выше считает неизвестно что. Эталоны —
  // общеизвестные соответствия из спецификации CSS Color 4.
  const near = (got, want, name) =>
    assert.ok(
      Math.abs(got.r - want[0]) <= 1 &&
        Math.abs(got.g - want[1]) <= 1 &&
        Math.abs(got.b - want[2]) <= 1,
      `${name}: получили rgb(${got.r},${got.g},${got.b}), ждали rgb(${want.join(",")})`,
    );
  near(parseColor("oklch(100% 0 0)"), [255, 255, 255], "белый");
  near(parseColor("oklch(0% 0 0)"), [0, 0, 0], "чёрный");
  near(parseColor("oklch(62.8% 0.2577 29.23)"), [255, 0, 0], "красный");
});
