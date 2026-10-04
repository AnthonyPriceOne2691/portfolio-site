/**
 * Шапка: на телефоне уезжает вместе со страницей, на компьютере с мышью — липкая.
 *
 * Найдено владельцем 2026-10-04 на iPhone: липкая шапка отнимала верх экрана, а в
 * Safari с прозрачной панелью адреса над ней просвечивало прокрученное фото героя.
 * Сторожится класс «сенсорный экран — шапка не липкая» в обоих движках (Safari —
 * то, чем смотрит владелец), и обратное: с мышью на широком экране шапка остаётся,
 * на это опирается положение карточки после перехода по якорю (layout.test.mjs).
 */
import { strict as assert } from "node:assert";
import test, { after, before } from "node:test";

import { chromium, devices, webkit } from "playwright";

import { serveDist } from "./lib/serve.mjs";

let site;

before(async () => {
  site = await serveDist(new URL("../dist/", import.meta.url));
});

after(async () => {
  await site?.close();
});

/** Где шапка после прокрутки на 700 px: низ её прямоугольника в окне. */
async function navBottomAfterScroll(engine, options) {
  const browser = await engine.launch();
  try {
    const page = await browser.newPage(options);
    await page.goto(`${site.origin}/`, { waitUntil: "load" });
    await page.evaluate(() =>
      window.scrollTo({ top: 700, behavior: "instant" }),
    );
    await page.waitForTimeout(300);
    return await page.evaluate(() => ({
      scrolled: Math.round(scrollY),
      bottom: Math.round(
        document.querySelector("header.nav").getBoundingClientRect().bottom,
      ),
    }));
  } finally {
    await browser.close();
  }
}

for (const [name, engine, options] of [
  [
    "chromium, телефон",
    chromium,
    { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  ],
  ["webkit, iPhone 13", webkit, { ...devices["iPhone 13"] }],
]) {
  test(`шапка уезжает вместе со страницей — ${name}`, async () => {
    const { scrolled, bottom } = await navBottomAfterScroll(engine, options);
    assert.ok(
      scrolled >= 600,
      `страница не прокрутилась (${scrolled}px) — проверять нечего`,
    );
    assert.ok(
      bottom <= 0,
      `шапка осталась в окне после прокрутки (низ на ${bottom}px) — на телефоне она липкая, ` +
        "отнимает верх экрана (Nav.astro: sticky — только при мыши и от 46rem)",
    );
  });
}

test("шапка липкая с мышью на широком экране — chromium", async () => {
  const { scrolled, bottom } = await navBottomAfterScroll(chromium, {
    viewport: { width: 1280, height: 900 },
  });
  assert.ok(
    scrolled >= 600,
    `страница не прокрутилась (${scrolled}px) — проверять нечего`,
  );
  assert.ok(
    bottom > 0,
    "на компьютере шапка уехала с прокруткой — карточка после якоря встанет без шапки над ней, " +
      "а scroll-margin-top рассчитан на липкую (ProjectCard.astro)",
  );
});
