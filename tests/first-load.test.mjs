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
  const log = [];
  const finished = new Map();
  page.on("request", (r) =>
    log.push({ path: new URL(r.url()).pathname, at: Date.now() }),
  );
  page.on("requestfinished", (r) =>
    finished.set(new URL(r.url()).pathname, Date.now()),
  );
  // Фото первого экрана — медленное, как на 4G: иначе на localhost оно докачивается
  // раньше, чем успевает что-то запросить скрипт, и порядок не проверить.
  await page.route(
    /\/(?!.*poster)[^/]*\.(jpe?g|png|webp|avif)$/i,
    async (route) => {
      await new Promise((r) => setTimeout(r, 400));
      await route.continue();
    },
  );
  await page.goto(`${site.origin}/`, { waitUntil: "load" });
  // Отложенное (наблюдатели, простой браузера) успевает проявиться.
  await page.waitForTimeout(1500);
  const requested = log.map((r) => r.path);

  const { photos, icons, frames } = await page.evaluate(() => ({
    photos: [...document.querySelectorAll("img.photo, video.photo")].map(
      (el) => new URL(el.getAttribute("src") ?? "", location.href).pathname,
    ),
    icons: [...document.querySelectorAll('link[rel~="icon"]')].map(
      (l) => new URL(l.href).pathname,
    ),
    // Фрейм ролика, видимый на первом экране, законно показывает свой кадр:
    // 04.10 карточка LinkBuilder с роликом встала первой, и её фрейм на телефоне — с 769 px из 844.
    frames: [...document.querySelectorAll("video[data-poster]")]
      .filter((v) => {
        const r = v.getBoundingClientRect();
        return r.height > 0 && r.top < innerHeight && r.bottom > 0;
      })
      .map((v) => new URL(v.dataset.poster ?? "", location.href).pathname),
  }));
  const allowed = [...photos, ...icons, ...frames];
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

  // Кадр фрейма первого экрана — после фото, по которому считается LCP, а не вместе с ним.
  const photoDone = Math.max(
    ...photos.filter((p) => finished.has(p)).map((p) => finished.get(p)),
  );
  assert.ok(
    Number.isFinite(photoDone),
    "фото первого экрана не докачалось — порядок кадра и фото не проверить",
  );
  for (const f of frames) {
    const req = log.find((r) => r.path === f);
    assert.ok(
      !req || req.at >= photoDone,
      `кадр фрейма ${f} запрошен раньше, чем докачалось фото первого экрана, — делит с ним сеть и тянет LCP (наблюдатель постеров включается после load, VideoFrame.astro)`,
    );
  }
  await page.close();
});

test("страница в покое не рисует кадров: бесконечные анимации стоят", async () => {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  await page.goto(`${site.origin}/`, { waitUntil: "load" });
  const running = () =>
    document
      .getAnimations()
      .filter(
        (a) =>
          a.playState === "running" &&
          a.effect?.getComputedTiming().endTime === Infinity,
      )
      .map(
        (a) =>
          `${a.animationName ?? "?"} на ${a.effect?.target?.tagName?.toLowerCase()}${a.effect?.pseudoElement ?? ""}`,
      );

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
