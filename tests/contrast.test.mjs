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

/** Блок объявлений по селектору. Источник правды один — файл. */
function block(selector) {
  const start = CSS.indexOf(selector);
  assert.ok(start >= 0, `в tokens.css нет блока ${selector}`);
  const open = CSS.indexOf("{", start);
  const close = CSS.indexOf("\n}", open);
  assert.ok(open >= 0 && close > open, `блок ${selector} не закрыт`);
  return CSS.slice(open, close);
}

const BLOCKS = {
  light: block(":root"),
  dark: block('html[data-theme="dark"]'),
};
export const THEMES = Object.keys(BLOCKS);

/**
 * Значение переменной В ТЕМЕ.
 *
 * ⚠ Тёмная тема переопределяет НЕ ВСЮ палитру — чего она не тронула,
 * наследуется из `:root` ровно так же, как в браузере. Без этого наследования
 * проверка тёмной темы шла бы по половине цветов и молча пропускала вторую.
 */
function token(name, theme = "light") {
  const re = new RegExp(`--${name}:\\s*([^;]+);`);
  const own = BLOCKS[theme].match(re);
  if (own) return own[1].trim();
  const base = BLOCKS.light.match(re);
  assert.ok(base, `в tokens.css нет переменной --${name}`);
  return base[1].trim();
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

/*
 * ⚠ Перебираются ОБЕ темы, и это не «заодно проверим тёмную».
 * Пока здесь читался только `:root`, тёмная тема была вне проверки целиком:
 * она переворачивает акцент в светлый, а `--text-on-accent` оставался белым —
 * кнопки CTA («Запросить резюме», «Смотреть демо») держали 1.68:1, и сборка
 * при этом была зелёной. Тест видел ровно ту половину палитры, где всё хорошо.
 */
for (const theme of THEMES) {
  const tk = (name) => token(name, theme);

  // Самая СВЕТЛАЯ точка холста — худший случай в обеих темах, но по разным
  // причинам: в светлой на ней тонет тёмный текст, в тёмной — светлый.
  const worstBg = parseColor(tk("bg-lightest"));
  const glass = composite(parseColor(tk("glass-bg")), worstBg);
  const glassStrong = composite(parseColor(tk("glass-bg-strong")), worstBg);
  // Бейдж статуса непрозрачен нарочно, поэтому считается от своей заливки,
  // а не от стекла (см. StatusBadge).
  const badge = parseColor(tk("badge-bg"));

  /*
   * ⚠ Худший фон — не сам холст, а холст С ЛИНИЕЙ УЗОРА поверх.
   *
   * Узор ослаблен маской там, где читают, но у НИЖНЕГО края он в полную силу —
   * а внизу лежит подвал, и его текст сидит прямо на холсте, без осветляющего
   * стекла. Линия редкой сетки вполне может пройти под строкой контактов.
   * В тёмной теме она светлая, то есть подтягивает фон к цвету текста, и
   * именно там запас съедается.
   *
   * Альфа линии умножается на `--tech-pattern-opacity`: слой целиком приглушён
   * этим свойством, и считать линию по её собственной прозрачности значило бы
   * завышать её вклад.
   */
  const patternAlpha = Number(tk("tech-pattern-opacity"));
  assert.ok(
    Number.isFinite(patternAlpha),
    "--tech-pattern-opacity не число — расчёт узора считал бы мусор",
  );
  const line = parseColor(tk("tech-line-strong"));
  const onLine = composite({ ...line, a: line.a * patternAlpha }, worstBg);

  const pairs = [
    ["text на стекле", tk("text"), glass],
    ["text-muted на стекле", tk("text-muted"), glass],
    ["accent на стекле (ссылки)", tk("accent"), glass],
    ["text на плотном стекле", tk("text"), glassStrong],
    ["text прямо на градиенте", tk("text"), worstBg],
    // ⚠ Подвал лежит на ХОЛСТЕ, а не на стекле, и это единственное место, где
    // приглушённый текст остаётся без осветляющей подложки. Пары не было —
    // проверялся только `text-muted` поверх стекла, то есть заведомо более
    // лёгкий случай.
    ["text-muted прямо на градиенте (подвал)", tk("text-muted"), worstBg],
    ["text-muted на линии узора (подвал)", tk("text-muted"), onLine],
    ["text на линии узора", tk("text"), onLine],
    ["status-production на стекле", tk("status-production"), glass],
    ["status-local-demo на стекле", tk("status-local-demo"), glass],
    ["status-poc на стекле", tk("status-poc"), glass],
    ["status-production на бейдже", tk("status-production"), badge],
    ["status-local-demo на бейдже", tk("status-local-demo"), badge],
    ["status-poc на бейдже", tk("status-poc"), badge],
  ];

  for (const [name, fg, bg] of pairs) {
    test(`контраст (${theme}): ${name} >= ${AA}:1`, () => {
      const ratio = contrast(parseColor(fg), bg);
      assert.ok(
        ratio >= AA,
        `${name} [${theme}]: ${ratio.toFixed(2)}:1 — ниже порога ${AA}:1. ` +
          `Правь токены в src/styles/tokens.css, а не подгоняй порог.`,
      );
    });
  }

  test(`контраст (${theme}): текст на акценте держит порог (кнопки CTA)`, () => {
    const ratio = contrast(
      parseColor(tk("text-on-accent")),
      parseColor(tk("accent")),
    );
    assert.ok(
      ratio >= AA,
      `text-on-accent на accent [${theme}]: ${ratio.toFixed(2)}:1. ` +
        `Акцент и текст на нём переворачиваются ВМЕСТЕ: светлый акцент ` +
        `тёмной темы требует тёмного текста, а не унаследованного белого.`,
    );
  });

  test(`инвариант (${theme}): стекло уводит фон ОТ цвета текста`, () => {
    // Метаморфное отношение, и оно шире прежнего «стекло светлее градиента»:
    // то было верно только для светлой темы, в тёмной плёнка ЗАТЕМНЯЕТ. Смысл
    // же один в обеих — поверх стекла текст обязан читаться не хуже, чем прямо
    // на холсте. Перестанет быть так — значит --glass-bg поехал в сторону
    // текста, и все расчёты выше считают не то, что видно на экране.
    const text = parseColor(tk("text"));
    assert.ok(
      contrast(text, glass) >= contrast(text, worstBg),
      `[${theme}] стекло ухудшает читаемость вместо того, чтобы улучшать`,
    );
    assert.ok(
      contrast(text, glassStrong) >= contrast(text, glass),
      `[${theme}] плотное стекло контрастнее обычного не стало`,
    );
  });
}

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
