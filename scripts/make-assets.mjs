/**
 * Сборка статических картинок сайта: превью ссылки и фавикон.
 *
 * ⚠ Всё ГЕНЕРИРУЕТСЯ из реальных токенов и реального контента, а не рисуется
 * в редакторе. Причина та же, по которой контакты живут в одном месте:
 * нарисованная картинка перестаёт совпадать с сайтом в тот день, когда
 * меняется палитра или метрика проекта, и заметить это некому — превью и
 * фавикон видит посетитель, а не владелец.
 *
 * Холст, стекло и цвета берутся из src/styles/*.css, имя и роль — из словаря,
 * метрики — из коллекции проектов. Поменялось что-то из этого:
 *
 *     node scripts/make-assets.mjs
 *
 * и закоммить результат.
 */
import { readFileSync, readdirSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const read = (rel) => readFileSync(ROOT + rel, "utf8");
const TOKENS = read("src/styles/tokens.css");
const CANVAS = read("src/styles/canvas.css");
const FONT =
  '"Instrument Sans", system-ui, -apple-system, "Segoe UI", sans-serif';

/** Роль — из словаря, чтобы не разошлась с сайтом. */
function role() {
  return read("src/lib/text.ts").match(/"home\.role":\s*"([^"]+)"/)?.[1] ?? "";
}

/** Метрика и название каждого опубликованного проекта, в порядке order. */
function projects() {
  const dir = ROOT + "src/content/projects/";
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const fm = readFileSync(dir + f, "utf8").split("---")[1] ?? "";
      const get = (k) =>
        fm.match(new RegExp("^" + k + ': "(.*)"$', "m"))?.[1] ?? "";
      return {
        metric: get("metric"),
        title: get("title"),
        order: Number(fm.match(/^order:\s*(\d+)/m)?.[1] ?? 99),
        draft: /^draft:\s*true/m.test(fm),
      };
    })
    .filter((p) => !p.draft)
    .sort((a, b) => a.order - b.order);
}

const ogPage = () =>
  [
    '<!doctype html><html lang="en" data-theme="dark"><head><meta charset="utf-8"><style>',
    TOKENS,
    CANVAS,
    // ⚠ box-sizing здесь ОБЯЗАТЕЛЕН и своей строкой: он живёт в global.css,
    // который сюда не подключён (нужны только токены и холст). Без него body
    // шириной 1200px плюс padding 5rem занимал 1360px, и правые 160 уходили за
    // кадр — третья плашка приезжала обрезанной.
    "*,*::before,*::after{box-sizing:border-box}",
    "html,body{margin:0;width:1200px;height:630px;overflow:hidden}",
    "body{display:flex;flex-direction:column;justify-content:center;gap:2.4rem;",
    "     padding:0 5rem;font-family:" + FONT + ";color:var(--text)}",
    "h1{font-size:5rem;line-height:1;letter-spacing:-.04em;margin:0 0 .9rem}",
    ".role{font-size:1.9rem;font-weight:600;color:var(--text-muted);margin:0}",
    ".metrics{display:flex;gap:1.1rem}",
    "/* flex:1 1 0 + min-width:0 обязательны: у флекс-элемента базовый",
    "   min-width:auto, он НЕ сжимается меньше своего текста. Длинное название",
    "   раздувало первую плашку и выталкивало третью за кадр — обрезалось ровно",
    "   то, что показать и хотели. */",
    ".chip{flex:1 1 0;min-width:0;padding:1.25rem 1.4rem;border-radius:var(--radius);",
    "      display:flex;flex-direction:column;gap:.3rem}",
    ".m{font-size:2rem;font-weight:800;letter-spacing:-.03em;line-height:1.05}",
    ".t{font-size:1rem;color:var(--text-muted);line-height:1.25;overflow-wrap:anywhere}",
    ".host{position:absolute;inset:auto 5rem 2.6rem auto;font-size:1.15rem;",
    "      font-weight:600;color:var(--accent)}",
    "</style></head><body><div><h1>Anton Aspidov</h1>",
    '<p class="role">' + role() + '</p></div><div class="metrics">',
    projects()
      .map(
        (p) =>
          '<div class="chip glass"><span class="m">' +
          p.metric +
          '</span><span class="t">' +
          p.title +
          "</span></div>",
      )
      .join(""),
    '</div><span class="host">portfolio-site.anthony-priceone.workers.dev</span></body></html>',
  ].join("\n");

/*
 * Фавикон — та же монограмма, что в шапке сайта (AA с акцентной точкой), и те
 * же токены. Рисуется браузером, а не задаётся hex-константами: иначе цвет
 * пришлось бы дублировать, и он разошёлся бы с палитрой при первой правке темы.
 */
const iconPage = [
  '<!doctype html><html data-theme="dark"><head><meta charset="utf-8"><style>',
  TOKENS,
  "*,*::before,*::after{box-sizing:border-box}",
  "html,body{margin:0;width:256px;height:256px;overflow:hidden}",
  "body{display:grid;place-items:center;font-family:" + FONT + "}",
  ".mark{width:256px;height:256px;display:grid;place-items:center;",
  "      background:linear-gradient(145deg,var(--canvas-1),var(--canvas-2) 55%,var(--canvas-3))}",
  "/* ⚠ Монограмма ОДНИМ узлом. В grid-контейнере каждый ребёнок — отдельный",
  "   элемент сетки, и текст «AA» с точкой в span разъезжались по двум строкам:",
  "   буквы сверху, точка внизу. Обёртка делает их единым элементом, точка",
  "   остаётся строчной внутри него. */",
  ".brand{font-size:104px;font-weight:800;letter-spacing:-.06em;color:var(--text)}",
  ".dot{color:var(--accent)}",
  '</style></head><body><div class="mark">',
  '<span class="brand">AA<span class="dot">.</span></span></div></body></html>',
].join("\n");

const browser = await chromium.launch();
mkdirSync(ROOT + "public", { recursive: true });

/*
 * ⚠ JPEG для превью, а не PNG. Кадр — сплошной градиент со стеклом: PNG хранит
 * такое почти без сжатия (замерено: 553 КБ, мимо хука check-added-large-files
 * на 512 КБ) и зря греет мобильный интернет. JPEG даёт десятые доли от этого
 * без видимой разницы, а og:image принимает его наравне с PNG.
 */
{
  // ⚠ Превью ОДНО. Пока языков было два, их было два — `og.jpg` и `og-en.jpg`,
  // потому что метрики проектов на картинке переведены, а `og:image` один на
  // страницу. Русская версия снята 2026-09-22, `og-en.jpg` удалён, английское
  // превью осталось под прежним именем `og.jpg`: переименование сломало бы
  // карточки ссылки, уже закэшированные Telegram и LinkedIn.
  const p = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await p.setContent(ogPage(), { waitUntil: "load" });
  // Свечение холста анимировано бесконечно — ждём устойчивый кадр, иначе две
  // пересборки подряд дают чуть разные файлы.
  await p.waitForTimeout(400);
  await p.screenshot({
    path: ROOT + "public/og.jpg",
    type: "jpeg",
    quality: 90,
  });
  console.log("  public/og.jpg — метрик: " + projects().length);
  await p.close();
}

// PNG, а не SVG: фавикон должен показаться и там, где SVG-иконки не
// поддерживаются, а два маленьких растра дешевле, чем SVG плюс запасной ICO.
for (const size of [32, 180]) {
  /*
   * ⚠ Рисуем ОДИН раз в 256 CSS-пикселях и уменьшаем масштабом устройства, а
   * не задаём вьюпорт нужного размера. Иначе макет в 256px не помещается в
   * вьюпорт 32px и обрезается: первая версия дала букву «A» во весь кадр без
   * второй и без точки. Масштаб меньше единицы даёт честное усреднение при
   * уменьшении — то же, что делает браузер с большой иконкой.
   */
  const p = await browser.newPage({
    viewport: { width: 256, height: 256 },
    deviceScaleFactor: size / 256,
  });
  await p.setContent(iconPage, { waitUntil: "load" });
  const name = size === 180 ? "apple-touch-icon.png" : "favicon-32.png";
  await p.screenshot({ path: ROOT + "public/" + name });
  console.log("  public/" + name);
  await p.close();
}

await browser.close();
