/**
 * Ролик проекта — в модалке, а не в раскрытой карточке (решение владельца
 * 2026-10-02: «не превращать карточку в простыню»), и одинаково на телефоне,
 * планшете и компьютере — это владелец назвал главным.
 *
 * Сценарий владельца целиком: раскрыл карточку — фрейм ожил; нажал на фрейм —
 * ролик по центру поверх затемнения; нажал мимо ролика, на крестик, Esc или
 * «Назад» — ролик закрылся, на экране та же раскрытая карточка; обновил страницу
 * во время просмотра — ролик НЕ закрылся.
 *
 * ⚠ Касания — касаниями (`tap`), а не кликом мыши: на телефоне и планшете путь
 * события другой, и модалка, работающая от мыши, может не работать от пальца.
 * Воспроизведение не проверяется: у Chromium из Playwright нет H.264, поэтому
 * `play()` здесь отказывает — и модалка обязана это пережить.
 *
 * ⚠ Файлы тестов идут по одному (`--test-concurrency=1` в package.json): на CI
 * (4 ядра) этот набор с четырьмя браузерами шёл одновременно с тестом анимации
 * карточки, и тот снимал 20 кадров вместо сотни — падал на исправном коде.
 */
import { strict as assert } from "node:assert";
import test, { after, before } from "node:test";

import { chromium, devices, webkit } from "playwright";

import { serveDist } from "./lib/serve.mjs";

const DEVICES = [
  { name: "компьютер", viewport: { width: 1280, height: 900 }, touch: false },
  { name: "планшет", viewport: { width: 820, height: 1180 }, touch: true },
  { name: "телефон", viewport: { width: 390, height: 844 }, touch: true },
  { name: "телефон боком", viewport: { width: 844, height: 390 }, touch: true },
];

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

/** Ждёт условия, а не угаданной паузы: анимации раскрытия на нагрузке длиннее. */
async function until(page, fn, arg, what, timeout = 8000) {
  const deadline = Date.now() + timeout;
  for (;;) {
    if (await page.evaluate(fn, arg)) return;
    assert.ok(Date.now() < deadline, `не дождались: ${what}`);
    await page.waitForTimeout(50);
  }
}

const isOpen = () => document.querySelector("dialog[data-demo-modal]").open;
const isClosed = () => !document.querySelector("dialog[data-demo-modal]").open;

for (const d of DEVICES) {
  test(`ролик в модалке — ${d.name} (${d.viewport.width}×${d.viewport.height})`, async () => {
    const context = await browser.newContext({
      viewport: d.viewport,
      hasTouch: d.touch,
      isMobile: d.touch,
    });
    const page = await context.newPage();
    const press = (locator) => (d.touch ? locator.tap() : locator.click());
    const pressAt = (x, y) =>
      d.touch ? page.touchscreen.tap(x, y) : page.mouse.click(x, y);

    await page.goto(`${site.origin}/`);
    const id = await page.evaluate(
      () => document.querySelector('template[id^="demo-"]')?.id.slice(5) ?? null,
    );
    assert.ok(id, "ни у одной карточки нет своего ролика — проверять нечего");
    const card = page.locator(`details#${id}`);
    const frame = card.locator("[data-demo-open]");
    const cardOpen = (sel) => document.querySelector(sel).open;

    // Свёрнутая карточка: фрейм её раскрывает, ролик не открывает.
    await frame.scrollIntoViewIfNeeded();
    await press(frame);
    await until(page, cardOpen, `details#${id}`, "фрейм не раскрыл карточку");
    await page.waitForTimeout(600); // анимация раскрытия
    assert.ok(await page.evaluate(isClosed), "свёрнутая карточка открыла ролик, а должна была раскрыться");

    // Раскрытая: фрейм открывает ролик поверх страницы.
    const scrollBefore = await page.evaluate(() => window.scrollY);
    await press(frame);
    await until(page, isOpen, null, "фрейм раскрытой карточки не открыл ролик");
    assert.ok(await page.evaluate(cardOpen, `details#${id}`), "клик по фрейму свернул карточку");
    assert.match(page.url(), new RegExp(`[?&]demo=${id}`), "в адресе нет ролика — перезагрузка его потеряет");
    const tracks = await page.evaluate(() =>
      [...document.querySelectorAll("dialog[data-demo-modal] video track")].map((t) => [
        t.srclang,
        t.hasAttribute("default"),
      ]),
    );
    assert.deepEqual(tracks, [["en", true], ["ru", false]], "субтитры в модалке не те");
    // ⚠ Пауза загрузку не останавливает — только снятый источник. Байты здесь не
    // посчитать (у Chromium из Playwright нет H.264), поэтому сторожится механизм:
    // замер 03.10 в WebKit — ролик после закрытия докачивал 1,4 МБ за 6 с, тизер
    // делил сеть с роликом; со снятым источником — ноль.
    const sources = (id) => ({
      modal: [...document.querySelectorAll("dialog[data-demo-modal] video")].filter((v) => v.getAttribute("src")).length,
      teaser: Boolean(document.querySelector(`details#${id} video[data-hover-play]`)?.getAttribute("src")),
    });
    assert.deepEqual(
      await page.evaluate(sources, id),
      { modal: 1, teaser: false },
      "пока идёт ролик, тизер держит источник — он качается и делит сеть с роликом",
    );

    // Ролик и крестик целиком на экране, крестик — под палец (44 px). Мерить —
    // после анимации появления: она начинается с масштаба 0,97, и замер на её
    // середине принимал 44 px за 42,7.
    // ⚠ Анимации — только самой модалки: у страницы есть бесконечные, и ждать
    // «все» значило бы ждать вечно (так и было на первом прогоне).
    await page.evaluate(() =>
      Promise.all(
        document
          .querySelector("dialog[data-demo-modal]")
          .getAnimations({ subtree: true })
          .map((a) => a.finished),
      ),
    );
    const geo = await page.evaluate(() => {
      const r = (el) => el.getBoundingClientRect().toJSON();
      const dlg = document.querySelector("dialog[data-demo-modal]");
      return {
        video: r(dlg.querySelector("video")),
        close: r(dlg.querySelector("[data-demo-close]")),
        vw: window.innerWidth,
        vh: window.innerHeight,
        scrollW: document.documentElement.scrollWidth,
      };
    });
    for (const [what, b] of [["ролик", geo.video], ["крестик", geo.close]]) {
      assert.ok(
        b.left >= 0 && b.top >= 0 && b.right <= geo.vw + 0.5 && b.bottom <= geo.vh + 0.5,
        `${what} выходит за экран ${geo.vw}×${geo.vh}: ${JSON.stringify(b)}`,
      );
    }
    assert.ok(geo.close.width >= 44 && geo.close.height >= 44, "крестик меньше 44 px — пальцем не попасть");
    assert.ok(geo.video.width >= Math.min(geo.vw * 0.5, 320), "ролик слишком мелкий для экрана");
    assert.ok(geo.scrollW <= geo.vw, "с открытым роликом появилась горизонтальная прокрутка");

    // Затемнение — до самых краёв окна: на Linux и Windows резерв под полосу
    // прокрутки оставлял по краям незатемнённые полоски (CI 02.10).
    const edges = await page.evaluate(() =>
      [2, innerWidth - 2].map((x) => document.elementFromPoint(x, innerHeight / 2)?.tagName),
    );
    assert.deepEqual(edges, ["DIALOG", "DIALOG"], "затемнение не доходит до краёв окна");

    // Мимо ролика (затемнение под ним) — закрылся, карточка раскрыта, адрес чист.
    await pressAt(geo.vw / 2, (geo.video.bottom + geo.vh) / 2);
    await until(page, isClosed, null, "нажатие мимо ролика его не закрыло");
    await until(page, () => !location.search.includes("demo="), null, "адрес не очистился после закрытия");
    assert.ok(await page.evaluate(cardOpen, `details#${id}`), "после ролика карточка свёрнута");
    assert.deepEqual(
      await page.evaluate(sources, id),
      { modal: 0, teaser: true },
      "закрытый ролик держит источник (он докачивается дальше) или тизер не ожил",
    );
    const scrollAfter = await page.evaluate(() => window.scrollY);
    assert.ok(Math.abs(scrollAfter - scrollBefore) <= 2, `страница уехала: ${scrollBefore} → ${scrollAfter}`);

    // «Watch demo» — тот же ролик; крестик закрывает.
    const link = card.locator('a[data-proof="video"]');
    await link.scrollIntoViewIfNeeded();
    await press(link);
    await until(page, isOpen, null, "«Watch demo» не открыла ролик");
    await press(page.locator("dialog[data-demo-modal] [data-demo-close]"));
    await until(page, isClosed, null, "крестик не закрыл ролик");

    // Перезагрузка во время просмотра — ролик остаётся открытым.
    await frame.scrollIntoViewIfNeeded();
    await press(frame);
    await until(page, isOpen, null, "ролик не открылся повторно");
    await page.reload();
    await until(page, isOpen, null, "после перезагрузки ролик закрылся");
    assert.ok(await page.evaluate(cardOpen, `details#${id}`), "после перезагрузки под роликом нет раскрытой карточки");

    // «Назад» закрывает ролик, а не уводит со страницы.
    await page.goBack();
    await until(page, isClosed, null, "«Назад» не закрыла ролик");
    assert.equal(new URL(page.url()).pathname, "/", "«Назад» увела со страницы");

    // Esc — с клавиатуры (на компьютере).
    if (!d.touch) {
      await press(frame);
      await until(page, isOpen, null, "ролик не открылся для проверки Esc");
      await page.keyboard.press("Escape");
      await until(page, isClosed, null, "Esc не закрыл ролик");
    }
    await context.close();
  });
}

/*
 * ⚠ Английские субтитры видны сразу — и в Safari. Chrome атрибут `default` соблюдает, а
 * Safari в режиме субтитров «Автоматически» его пропускает, если язык системы совпадает с
 * языком звука: на проде 03.10 у англоязычного посетителя ролик шёл без строк. Поймать
 * это можно только в WebKit и только на настоящем ролике: выбор дорожек Safari делает,
 * когда загружены метаданные (тестовый сервер для этого отдаёт диапазоны, как прод).
 */
test("английские субтитры видны по умолчанию — WebKit (Safari)", async () => {
  const browserW = await webkit.launch();
  // Браузер закрывается при ЛЮБОМ исходе: упавшая проверка без этого держала процесс
  // теста открытым бесконечно (поймано сломом 03.10).
  try {
  const context = await browserW.newContext({ ...devices["iPhone 13"] });
  const page = await context.newPage();
  await page.goto(`${site.origin}/`);
  const id = await page.evaluate(() => document.querySelector('template[id^="demo-"]')?.id.slice(5) ?? null);
  assert.ok(id, "ни у одной карточки нет своего ролика — проверять нечего");
  const card = page.locator(`details#${id}`);
  await card.locator(".title").scrollIntoViewIfNeeded();
  await card.locator(".title").tap();
  await until(page, (id) => document.getElementById(id).open, id, "карточка не раскрылась");
  await page.waitForTimeout(600);
  await card.locator("[data-demo-open]").tap();
  await until(page, isOpen, null, "ролик не открылся");
  await until(page, () => document.querySelector("dialog[data-demo-modal] video")?.readyState >= 1, null,
    "WebKit не загрузил метаданные ролика — без них выбор субтитров не проверить", 15000);
  await page.waitForTimeout(300);
  const modes = await page.evaluate(() =>
    Object.fromEntries([...document.querySelector("dialog[data-demo-modal] video").textTracks].map((t) => [t.language, t.mode])),
  );
  assert.deepEqual(modes, { en: "showing", ru: "disabled" }, "в Safari английские субтитры не включены по умолчанию — showDefaultCaptions в demo-modal.ts");
  } finally {
    await browserW.close();
  }
});
