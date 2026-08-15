/**
 * B6 и B7: то, что нельзя посчитать без движка раскладки.
 *
 * До 07.08 эти две проверки были ручными («посмотрел глазами»), и это честно
 * стояло в спеке. Владелец одобрил headless-браузер — и они стали машинными.
 * Разница не косметическая: горизонтальный скролл появляется от ОДНОГО
 * элемента на одной ширине, а глаз проверяет ту ширину, которую вспомнил.
 *
 * B7 — три реальные ширины телефонов, каждая страница: iPhone SE (360),
 *      iPhone 12/13/14 (390), iPhone Plus/Max (414).
 * B6 — `prefers-reduced-motion` и `prefers-reduced-transparency`: анимаций нет,
 *      `backdrop-filter` деградировал в заливку. Второе особенно важно на
 *      стекле: именно блюр просаживает скролл на слабых Android.
 *
 * Тест ходит по СОБРАННОМУ `dist/` через file://, а не по dev-серверу: судить
 * надо то, что уедет на хостинг.
 */
import { strict as assert } from "node:assert";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import test, { after, before } from "node:test";
import { pathToFileURL } from "node:url";

import { chromium } from "playwright";

const DIST = new URL("../dist/", import.meta.url);
const PAGES = [
  "index.html",
  "projects/index.html",
  "projects/linkbuilder/index.html",
  "about/index.html",
  "en/index.html",
  "en/projects/linkbuilder/index.html",
];
const WIDTHS = [360, 390, 414];

let browser;
before(async () => {
  browser = await chromium.launch();
});
after(async () => {
  await browser?.close();
});

const url = (rel) => pathToFileURL(new URL(rel, DIST).pathname).href;

test("B7: ни одна страница не даёт горизонтального скролла на телефоне", async () => {
  for (const rel of PAGES) {
    assert.ok(
      existsSync(new URL(rel, DIST)),
      `нет собранной страницы ${rel} — сначала npm run build`,
    );
    for (const width of WIDTHS) {
      const page = await browser.newPage({ viewport: { width, height: 800 } });
      await page.goto(url(rel));
      const overflow = await page.evaluate(() => {
        const d = document.documentElement;
        // Виновника называем сразу: «где-то шире» — бесполезный диагноз.
        const guilty = [...document.querySelectorAll("*")]
          .filter((el) => el.getBoundingClientRect().right > d.clientWidth + 1)
          .slice(0, 3)
          .map(
            (el) =>
              el.tagName.toLowerCase() +
              (el.className ? `.${String(el.className).split(" ")[0]}` : ""),
          );
        return { scroll: d.scrollWidth, client: d.clientWidth, guilty };
      });
      await page.close();
      assert.ok(
        overflow.scroll <= overflow.client + 1,
        `${rel} @${width}px: страница шире экрана (${overflow.scroll} > ${overflow.client}); ` +
          `виновники: ${overflow.guilty.join(", ") || "не определены"}`,
      );
    }
  }
});

test("B7: меню открывается и закрывается с клавиатуры", async () => {
  const page = await browser.newPage({ viewport: { width: 360, height: 800 } });
  await page.goto(url("index.html"));
  const summary = page.locator("details.menu > summary");
  await summary.focus();
  await page.keyboard.press("Enter");
  assert.equal(
    await page.locator("details.menu").evaluate((d) => d.open),
    true,
    "меню не открылось с клавиатуры",
  );
  await page.keyboard.press("Enter");
  assert.equal(
    await page.locator("details.menu").evaluate((d) => d.open),
    false,
    "меню не закрылось с клавиатуры",
  );
  await page.close();
});

test("B6: при reduced-motion ничего не анимируется", async () => {
  const page = await browser.newPage({
    viewport: { width: 390, height: 800 },
    reducedMotion: "reduce",
  });
  await page.goto(url("index.html"));
  const running = await page.evaluate(
    () =>
      document.getAnimations().filter((a) => a.playState === "running").length,
  );
  await page.close();
  assert.equal(
    running,
    0,
    `запущено анимаций: ${running} — при reduced-motion их быть не должно`,
  );
});

test("B6: при reduced-transparency стекло теряет блюр, а не читаемость", () => {
  // Браузер здесь не нужен и не годится: `fetch` по file:// заблокирован, а
  // вопрос всё равно про содержимое СОБРАННОГО css. Читаем с диска.
  const cssDir = new URL("../dist/_astro/", import.meta.url);
  const flat = readdirSync(cssDir)
    .filter((f) => f.endsWith(".css"))
    .map((f) => readFileSync(new URL(f, cssDir), "utf8"))
    .join("\n")
    .replace(/\s+/g, "");

  assert.match(
    flat,
    /prefers-reduced-transparency:reduce\)\{\.glass\{[^}]*backdrop-filter:none/,
    "нет деградации backdrop-filter — на слабых устройствах блюр просадит скролл",
  );
  // Префиксное свойство сторожим ОТДЕЛЬНО: минификатор однажды уже выбросил
  // одно из двух, считая их дублем в одном правиле. Сначала пропадало
  // стандартное (Firefox остался бы без стекла), после перестановки —
  // префиксное (Safari до 18). Теперь они живут в разных блоках, и тест
  // следит, чтобы так и осталось.
  assert.match(
    flat,
    /-webkit-backdrop-filter:none/,
    "пропала -webkit-версия деградации — Safari до 18 останется с блюром",
  );
  assert.match(
    flat,
    /-webkit-backdrop-filter:blur/,
    "пропала -webkit-версия блюра — в Safari до 18 стекла не будет",
  );
});
