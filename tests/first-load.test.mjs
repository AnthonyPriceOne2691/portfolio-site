/**
 * Первая загрузка и покой на телефоне: качается только первый экран, а страница,
 * на которую просто смотрят, не рисует кадров.
 *
 * Замер 03.10: постер тизера (145 КБ, две трети первой загрузки) качался сразу,
 * хотя на телефоне фрейм ниже первого экрана, и делил сеть с фото, по которому
 * считается LCP. Убран в «когда фрейм подъезжает к экрану» — LCP 1,79 → 1,38 с
 * вместе с остальными правками того дня. Тот же замер: бесконечный дрейф фона
 * перерисовывал страницу в покое 60 раз в секунду (GPU ~70 мс/с) — теперь он
 * идёт, только пока посетитель что-то делает, и в покое 0 кадров.
 *
 * Сторожатся классы, а не эти два случая: ЛЮБОЙ медиафайл до прокрутки и
 * касания — постер, тизер, ролик, субтитры, PDF — ошибка (законны только фото
 * первого экрана и иконка вкладки, их адреса берутся со страницы), и ЛЮБАЯ
 * бесконечная анимация, идущая в покое, — тоже.
 */
import { strict as assert } from "node:assert";
import test, { after, before } from "node:test";

import { chromium } from "playwright";

import { serveDist } from "./lib/serve.mjs";

const MEDIA = /\.(mp4|webm|vtt|pdf|jpe?g|png|webp|avif|gif)$/i;

let browser;
let site;

before(async () => {
  site = await serveDist(new URL("../dist/", import.meta.url));
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
  await site?.close();
});

test("первая загрузка на телефоне: только первый экран", async () => {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  const requested = [];
  page.on("request", (r) => requested.push(new URL(r.url()).pathname));
  await page.goto(`${site.origin}/`, { waitUntil: "load" });
  // Отложенное (наблюдатели, простой браузера) успевает проявиться.
  await page.waitForTimeout(1500);

  const allowed = await page.evaluate(() => [
    ...[...document.querySelectorAll("img.photo, video.photo")].map(
      (el) => new URL(el.getAttribute("src") ?? "", location.href).pathname,
    ),
    ...[...document.querySelectorAll('link[rel~="icon"]')].map(
      (l) => new URL(l.href).pathname,
    ),
  ]);
  // Канарейка: фото первого экрана загрузилось — иначе тест смотрит в пустоту.
  assert.ok(
    requested.some((p) => allowed.includes(p) && MEDIA.test(p)),
    `фото первого экрана не загрузилось — проверять нечего (запросы: ${requested.join(", ")})`,
  );

  // Стили — внутри HTML: отдельный файл стоил лишнего круга по сети до первой
  // отрисовки, на медленном 4G это +0,6 с (замер 03.10).
  assert.deepEqual(
    requested.filter((p) => p.endsWith(".css")),
    [],
    "стили грузятся отдельным файлом — вернулся лишний круг до первой отрисовки (inlineStylesheets в astro.config.mjs)",
  );

  const extra = requested.filter((p) => MEDIA.test(p) && !allowed.includes(p));
  assert.deepEqual(
    extra,
    [],
    "на старте качается то, чего на первом экране нет: медиа ниже экрана — только когда к нему подъехали",
  );
  await page.close();
});

test("страница в покое не рисует кадров: бесконечные анимации стоят", async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await page.goto(`${site.origin}/`, { waitUntil: "load" });
  const running = () =>
    document
      .getAnimations()
      .filter((a) => a.playState === "running" && a.effect?.getComputedTiming().endTime === Infinity)
      .map((a) => `${a.animationName ?? "?"} на ${a.effect?.target?.tagName?.toLowerCase()}${a.effect?.pseudoElement ?? ""}`);

  // Живость не потеряна: пока посетитель листает, свет фона дрейфует.
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(300);
  assert.ok(
    (await page.evaluate(running)).length > 0,
    "прокрутка не оживила фон — дрейф света пропал совсем (scripts/canvas-life.ts)",
  );

  // Покой: прибытие и последняя прокрутка отыграли, ничего не трогают.
  await page.waitForTimeout(3500);
  assert.deepEqual(
    await page.evaluate(running),
    [],
    "в покое идёт бесконечная анимация — страница, на которую просто смотрят, рисует 60 кадров/с",
  );
  await page.close();
});
