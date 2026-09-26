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
 * Тест поднимает СОБРАННЫЙ `dist/` статическим сервером и ходит по http://:
 * судить надо то, что уедет на хостинг.
 *
 * ⚠ Раньше здесь был `file://`, и это была тихая дыра. Astro подключает стили
 * АБСОЛЮТНЫМ путём `/_astro/…`; под `file://` он резолвится в корень файловой
 * системы, а не в `dist/`, — страницы открывались БЕЗ CSS вовсе. Проверка
 * «нет горизонтального скролла» на неверстанной странице проходит всегда:
 * тест был зелёным именно потому, что ничего не проверял. Нашлось при замере
 * ширины карточки, а не прогоном — прогон был зелёным.
 */
import { strict as assert } from "node:assert";
import { createServer } from "node:http";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import test, { after, before } from "node:test";

import { chromium } from "playwright";

const DIST = new URL("../dist/", import.meta.url);
// ⚠ Список страниц СОБРАННОГО сайта, и он же — единственное место, где
// раньше стояла `en/index.html`. Сайт одноязычный с 2026-09-22: языковой
// ветки нет, вместе с ней ушёл тест B5 про перенос раскрытой карточки между
// языками — переносить стало нечего.
const PAGES = ["index.html", "about/index.html"];
const WIDTHS = [360, 390, 414];

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".xml": "application/xml",
};

let browser;
let server;
let origin;

before(async () => {
  server = createServer((req, res) => {
    // ⚠ Каталог отдаётся как `index.html`: ссылки на сайте ведут на `/` и
    // `/#якорь`, а не на `/index.html`. Без этого переход по меню упирался в
    // попытку прочитать каталог.
    const raw = decodeURIComponent(req.url.split("?")[0].split("#")[0]);
    const path = raw.endsWith("/") ? `${raw}index.html` : raw;
    try {
      // ⚠ Файл читается ДО `writeHead`, и порядок здесь принципиален. Раньше
      // заголовки уходили первыми, и на отсутствующем пути `readFileSync`
      // бросал уже ПОСЛЕ них: ветка `catch` пыталась дослать 404, получала
      // ERR_HTTP_HEADERS_SENT, и тест падал с ошибкой про асинхронную
      // активность вместо внятного «нет такой страницы».
      const body = readFileSync(new URL("." + path, DIST));
      const ext = path.slice(path.lastIndexOf("."));
      res.writeHead(200, {
        "content-type": MIME[ext] ?? "application/octet-stream",
      });
      res.end(body);
    } catch {
      res.writeHead(404).end("not found");
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
  await new Promise((r) => server?.close(r));
});

const url = (rel) => `${origin}/${rel}`;

/*
 * ⚠ Ожидание по УСЛОВИЮ, а не `waitForTimeout(1200)`.
 *
 * Карточки раскрываются анимацией, потом страница доезжает плавной прокруткой,
 * и угаданная пауза «обычно хватает» ровно до первой машины под нагрузкой:
 * один прогон уже упал только потому, что рядом работал dev-сервер. Тест,
 * падающий от загрузки процессора, не отличить от теста, нашедшего ошибку, —
 * и его начинают перезапускать вместо того, чтобы читать.
 */
async function until(page, fn, arg, what, timeout = 8000) {
  const deadline = Date.now() + timeout;
  for (;;) {
    if (await page.evaluate(fn, arg)) return;
    assert.ok(Date.now() < deadline, `не дождались: ${what}`);
    await page.waitForTimeout(50);
  }
}

/**
 * Ждёт, пока КАРТОЧКА перестанет двигаться.
 *
 * ⚠ Требуется несколько одинаковых замеров подряд, а не два. Переход по якорю
 * идёт в два приёма: сначала браузер прыгает к элементу нативно, следом
 * страницу доводит наш скрипт. Между приёмами есть пауза, на которой позиция
 * какое-то время не меняется — наивная проверка «два замера совпали» принимала
 * её за конец движения и мерила промежуточное положение (тест падал на 386 px
 * при полностью исправном коде).
 */
async function positionSettled(page, id, stableReads = 4) {
  let last = null;
  let same = 0;
  for (let i = 0; i < 150; i++) {
    const top = await page.evaluate(
      (target) =>
        Math.round(document.getElementById(target).getBoundingClientRect().top),
      id,
    );
    same = top === last ? same + 1 : 0;
    last = top;
    if (same >= stableReads) return;
    await page.waitForTimeout(50);
  }
  assert.fail(`карточка ${id} так и не остановилась`);
}

test("B7: ни одна страница не даёт горизонтального скролла на телефоне", async () => {
  for (const rel of PAGES) {
    assert.ok(
      existsSync(new URL(rel, DIST)),
      `нет собранной страницы ${rel} — сначала npm run build`,
    );
    for (const width of WIDTHS) {
      const page = await browser.newPage({ viewport: { width, height: 800 } });
      await page.goto(url(rel));
      // Без этой строки весь тест — театр: неверстанная страница не
      // переполняется никогда. Проверяем, что CSS реально применился.
      const styled = await page.evaluate(
        () =>
          getComputedStyle(document.documentElement)
            .getPropertyValue("--measure")
            .trim() !== "",
      );
      assert.ok(
        styled,
        `${rel}: стили не применились — тест проверял бы пустоту`,
      );
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

test("B7: раскрытая карточка не выносит страницу за экран", async () => {
  /*
   * ⚠ Отдельный прогон, а не «заодно» в проверке выше. Раскрытие МЕНЯЕТ
   * раскладку: панель добавляет высоту, а на широком экране карточка ещё и
   * нарочно выходит за поля колонки отрицательным полем.
   * Проверка свёрнутого состояния об этом не знает ничего — до этого теста
   * раскрытая карточка не судилась вообще, а именно в ней появился первый на
   * сайте элемент, который УМЫШЛЕННО шире своего контейнера.
   */
  for (const width of [...WIDTHS, 1280, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(url("index.html"));
    const opened = await page.evaluate(() => {
      const cards = [...document.querySelectorAll("details.card")];
      for (const c of cards) c.open = true;
      return cards.length;
    });
    assert.ok(
      opened > 0,
      `@${width}px: на главной нет ни одной раскрываемой карточки — ` +
        `тест проверял бы пустоту`,
    );
    // ⚠ Без этой паузы тест — театр, и это проверено: у карточки
    // `transition: margin 0.42s`, замер сразу после раскрытия ловит её ещё в
    // исходной точке. С заведомо сломанным выходом за поля (-3rem вместо
    // -1.5rem) такая проверка оставалась ЗЕЛЁНОЙ. Ждём конца перехода.
    await page.waitForTimeout(700);

    const overflow = await page.evaluate(() => {
      const d = document.documentElement;
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
    assert.ok(
      overflow.scroll <= overflow.client + 1,
      `раскрытая карточка @${width}px: страница шире экрана ` +
        `(${overflow.scroll} > ${overflow.client}); ` +
        `виновники: ${overflow.guilty.join(", ") || "не определены"}`,
    );

    // Инвариант выхода за поля: карточка съедает ПАДДИНГ `main`, но за сам
    // `main` не выходит. Он держится на том, что паддинг (2rem при любой
    // ширине от 40rem) больше выхода (1.5rem). Уменьшат одно или увеличат
    // другое — сломается здесь, а не на чьём-то экране.
    const escaped = await page.evaluate(() => {
      const m = document.querySelector("main").getBoundingClientRect();
      return [...document.querySelectorAll("details.card")]
        .map((c) => c.getBoundingClientRect())
        .some((r) => r.left < m.left - 1 || r.right > m.right + 1);
    });
    assert.ok(
      !escaped,
      `раскрытая карточка @${width}px вышла за пределы main — ` +
        `выход за поля стал больше паддинга колонки`,
    );
    await page.close();
  }
});

test("аккордеон: раскрытая карточка закрывает остальные — и без JS тоже", async () => {
  /*
   * Эксклюзивность держится на ДВУХ механизмах сразу, и проверять надо оба.
   * В разметке у карточек `name`, и браузер делает их взаимоисключающими сам —
   * это путь для случая, когда скрипт не загрузился. Когда скрипт есть, он
   * `name` снимает и ведёт аккордеон сам, чтобы соседняя карточка закрывалась
   * с анимацией, а не рывком. Выпади любой из двух — половина пользователей
   * получит поведение, которого не задумывали, и сборка этого не заметит.
   */
  for (const javaScriptEnabled of [true, false]) {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      javaScriptEnabled,
    });
    const page = await context.newPage();
    await page.goto(url("index.html"));
    const how = javaScriptEnabled ? "с JS" : "без JS";

    const open = () =>
      page.evaluate(() =>
        [...document.querySelectorAll("details.card")].map((c) => c.open),
      );
    const cards = page.locator("details.card summary");
    const total = await cards.count();
    assert.ok(total >= 2, `${how}: карточек меньше двух — нечего исключать`);

    assert.deepEqual(
      await open(),
      Array(total).fill(false),
      `${how}: карточки не должны быть раскрыты на старте`,
    );

    await cards.nth(0).click();
    await until(
      page,
      () => document.querySelectorAll("details.card[open]").length === 1,
      null,
      `${how}: ни одна карточка не раскрылась`,
    );
    assert.deepEqual(
      await open(),
      Array.from({ length: total }, (_, i) => i === 0),
      `${how}: после клика раскрытой должна быть только первая карточка`,
    );

    await cards.nth(1).click();
    await until(
      page,
      () => {
        const open = [...document.querySelectorAll("details.card")].map(
          (c) => c.open,
        );
        return open.filter(Boolean).length === 1 && open[1];
      },
      null,
      `${how}: вторая карточка не стала единственной раскрытой`,
    );
    assert.deepEqual(
      await open(),
      Array.from({ length: total }, (_, i) => i === 1),
      `${how}: вторая раскрылась, но первая не закрылась — это не аккордеон`,
    );

    await cards.nth(1).click();
    await until(
      page,
      () => document.querySelectorAll("details.card[open]").length === 0,
      null,
      `${how}: карточка не закрылась повторным кликом`,
    );
    assert.deepEqual(
      await open(),
      Array(total).fill(false),
      `${how}: повторный клик по раскрытой карточке должен её закрывать`,
    );

    await context.close();
  }
});

test("аккордеон на телефоне: раскрытая карточка не уезжает в середину", async () => {
  /*
   * Найдено владельцем на телефоне 2026-09-22.
   *
   * Открыта одна карточка, тыкаешь в другую — та раскрывается, но экран
   * оказывается в её СЕРЕДИНЕ, мимо фрейма с видео и метрики, ради которых
   * карточку и открывают. Причина не в прокрутке, а в её отсутствии: сосед
   * схлопывается НАД целью, и вся страница под ним уезжает вверх на его
   * высоту, пока палец стоит на месте. На телефоне раскрытая карточка выше
   * экрана, поэтому промах — почти во весь экран.
   *
   * ⚠ Проверка — РЕЛЯЦИОННАЯ: не «карточка на такой-то высоте», а «верх
   * карточки там же, где был в момент нажатия». Абсолютные числа здесь
   * зависят от длины текста карточек и сгнили бы при первой же правке
   * контента, а отношение держится на любом.
   */
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  await page.goto(url(""));

  const cards = page.locator("details.card");
  const ids = await cards.evaluateAll((list) => list.map((c) => c.id));
  assert.ok(ids.length >= 2, "для проверки нужны хотя бы две карточки");

  // Открываем первую и даём ей встать.
  await cards.nth(0).locator("summary").click();
  await positionSettled(page, ids[1]);

  const topOf = (id) =>
    page.evaluate(
      (target) =>
        Math.round(document.getElementById(target).getBoundingClientRect().top),
      id,
    );
  const navBottom = await page.evaluate(() =>
    Math.round(
      document.querySelector("header.nav").getBoundingClientRect().bottom,
    ),
  );

  /*
   * Вторая карточка лежит ПОД раскрытой первой — именно этот случай и ломался.
   *
   * ⚠ Подводим её мгновенным `scrollTo`, а не `scrollIntoView`: у страницы
   * плавная прокрутка, и `positionSettled` успевал снять четыре одинаковых
   * замера ДО того, как она тронулась, — тест мерил исходную позицию и падал
   * на исправном коде. Второе: клик в Playwright сам доскроллит до элемента,
   * если тот вне экрана, и тогда проверялся бы уже не наш сдвиг, а его.
   */
  await page.evaluate((target) => {
    const el = document.getElementById(target);
    const y = el.getBoundingClientRect().top + window.scrollY - 300;
    window.scrollTo({ top: y, behavior: "instant" });
  }, ids[1]);
  await positionSettled(page, ids[1]);
  const before = await topOf(ids[1]);
  assert.ok(
    before > 0 && before < 844,
    `карточку не удалось подвести под экран: верх на ${before}px`,
  );

  /*
   * ⚠ Попутно считаем, СКОЛЬКО КАДРОВ страница едет.
   *
   * Первая версия починки держала верх карточки покадрово, компенсируя
   * схлопывание соседа. Позиция сходилась идеально — и проверка ниже была
   * зелёной, — но страница при этом пролетала те же 768 px за 320 мс, и
   * владелец описал это как «эффект многократного пролистывания». Проверять
   * только конечную точку оказалось мало: между двумя неподвижными кадрами
   * помещается целое неприятное движение.
   */
  await page.evaluate(() => {
    window.__scrollFrames = [];
    const tick = () => {
      window.__scrollFrames.push(Math.round(window.scrollY));
      if (window.__scrollFrames.length < 70) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  await cards.nth(1).locator("summary").click();
  await until(
    page,
    (target) => document.getElementById(target).open === true,
    ids[1],
    "вторая карточка не раскрылась",
  );
  await positionSettled(page, ids[1]);
  const after = await topOf(ids[1]);

  const moved = await page.evaluate(() => {
    const f = window.__scrollFrames;
    return f.filter((v, i) => i > 0 && v !== f[i - 1]).length;
  });
  assert.ok(
    moved <= 3,
    `страница ехала ${moved} кадров подряд — это и есть «пролистывание». ` +
      "Раскладка обязана становиться финальной сразу, одной поправкой",
  );

  // Допуск в 2px — округление и дробная прокрутка; промах, о котором речь,
  // измерялся сотнями пикселей.
  assert.ok(
    Math.abs(after - before) <= 2,
    `верх карточки уехал на ${before - after}px: нажали на ${before}, ` +
      `после раскрытия ${after} — экран показывает не начало карточки`,
  );
  assert.ok(
    after >= navBottom - 2,
    `верх карточки (${after}) спрятался под липкой шапкой (${navBottom})`,
  );

  await page.close();
});

test("текст карточки не пляшет, пока она раскрывается и сворачивается", async () => {
  /*
   * Найдено владельцем 2026-09-26: при раскрытии и сворачивании текст
   * карточки «пляшет». Причина — ширина текстовой колонки менялась ПО ХОДУ
   * анимации: фрейм рос с 28% до 38% шапки, а от 76rem карточка ещё и
   * выходила за поля, утаскивая содержимое на 1.5rem влево. Текст
   * перекладывался заново на каждом кадре: на 1280 px колонка сменила ширину
   * 13 раз за одно раскрытие, на 900 px фраза прыгала с двух строк на три.
   *
   * ⚠ Судятся ВСЕ кадры, а не начало и конец. Конечные состояния могут
   * совпасть и при пляске посередине — именно так устроено сворачивание:
   * карточка возвращается ровно туда, откуда уехала.
   *
   * Правило общее, а не про фрейм: у раскрытия нет права менять ширину и
   * положение текста. Всё, что ему нужно, — высота панели и то, что не
   * касается раскладки (тень, рамка, поверхность за полями).
   */
  const PARTS = [
    ".body",
    ".metric",
    ".title",
    ".one",
    ".stack",
    ".panel-inner",
  ];

  for (const width of [390, 900, 1280, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(url(""));

    const run = await page.evaluate(async (parts) => {
      const card = document.querySelector("details.card");
      const summary = card.querySelector("summary");
      card.scrollIntoView({ block: "start", behavior: "instant" });
      // Координаты — от начала документа: прокрутка страницы не должна
      // выдаваться за сдвиг текста.
      const snap = () =>
        parts.map((sel) => {
          const r = card.querySelector(sel).getBoundingClientRect();
          // Панель закрытой карточки не отрисована — сравнивать нечего.
          if (r.width === 0 && r.height === 0) return null;
          return [r.left + scrollX, r.top + scrollY, r.width, r.height];
        });
      const record = (ms) =>
        new Promise((resolve) => {
          const out = [];
          const t0 = performance.now();
          const tick = () => {
            out.push(snap());
            if (performance.now() - t0 < ms) requestAnimationFrame(tick);
            else resolve(out);
          };
          requestAnimationFrame(tick);
        });

      const frames = [snap()];
      summary.click();
      frames.push(...(await record(900)));
      const opened = card.open;
      summary.click();
      frames.push(...(await record(1200)));
      return { frames, opened, closed: !card.open };
    }, PARTS);
    await page.close();

    // Без этого тест зелёный и на карточке, которая не шевельнулась вовсе.
    assert.ok(
      run.opened && run.closed,
      `@${width}px: карточка не раскрылась и не закрылась кликом — ` +
        `проверять было нечего`,
    );
    assert.ok(
      run.frames.length > 20,
      `@${width}px: снято всего ${run.frames.length} кадров — анимацию не видели`,
    );

    const AXES = ["left", "top", "width", "height"];
    const drift = [];
    PARTS.forEach((sel, i) => {
      const seen = run.frames.map((f) => f[i]).filter(Boolean);
      AXES.forEach((axis, k) => {
        const values = seen.map((v) => v[k]);
        const lo = Math.min(...values);
        const hi = Math.max(...values);
        // Полпикселя — дробная раскладка; перенос строки стоит 20+ px.
        if (hi - lo > 0.5) {
          drift.push(`${sel} ${axis}: ${Math.round(lo)}…${Math.round(hi)}px`);
        }
      });
    });
    assert.deepEqual(
      drift,
      [],
      `@${width}px текст карточки ездит по ходу анимации:\n  ` +
        drift.join("\n  ") +
        "\n  Раскрытие не должно менять ширину и положение текста: " +
        "ни фрейм, ни поля карточки не имеют права отнимать у него место",
    );
  }
});

test("стрелки к резюме попадают в цель на любой ширине", async () => {
  /*
   * Пометка «my CV is here» живёт ВНЕ липкой шапки и целится в пункт About по
   * числам шапки (`--nav-*`), а не по самому пункту. Значит, попадание — не
   * свойство разметки, а совпадение двух расчётов, и разойтись они могут
   * молча: поменяли кнопку темы — стрелка указывает в пустоту, сборка зелёная.
   *
   * Острие берётся с самого рисунка — концом линии, — а не пересчётом из
   * констант CSS: тест, повторяющий расчёт стиля, согласился бы с ним и в
   * ошибке.
   *
   * ⚠ Размер рисунка проверяется отдельно. Общее `svg { max-width: 100% }`
   * однажды сжало стрелку на /about/ в точку — подпись висела одна, а острие
   * «попадало» в край кнопки, потому что точка там и лежала.
   */
  const tipOf = (selector) => {
    const stem = document.querySelector(`${selector} .stem`);
    const end = stem.getPointAtLength(stem.getTotalLength());
    const p = new DOMPoint(end.x, end.y).matrixTransform(stem.getScreenCTM());
    const box = stem.ownerSVGElement.getBoundingClientRect();
    return { x: p.x, y: p.y, w: box.width, h: box.height };
  };
  const visible = (tip, where) =>
    assert.ok(
      tip.w >= 16 && tip.h >= 16,
      `${where}: стрелка сжата до ${Math.round(tip.w)}×${Math.round(tip.h)} px — ` +
        "её не видно, осталась одна подпись",
    );

  for (const width of [...WIDTHS, 900, 1280, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });

    await page.goto(url(""));
    const nav = await page.evaluate(
      ([fn]) => {
        const tip = new Function(`return (${fn})`)()(".cv-hint");
        const link = document
          .querySelector("header.nav a.about")
          .getBoundingClientRect();
        const bar = document
          .querySelector("header.nav")
          .getBoundingClientRect();
        return { tip, link: link.toJSON(), barBottom: bar.bottom };
      },
      [tipOf.toString()],
    );
    visible(nav.tip, `@${width}px под шапкой`);
    const quarter = (nav.link.right - nav.link.left) / 4;
    assert.ok(
      nav.tip.x >= nav.link.left + quarter &&
        nav.tip.x <= nav.link.right - quarter,
      `@${width}px стрелка под шапкой бьёт мимо About: острие на x=${Math.round(nav.tip.x)}, ` +
        `пункт ${Math.round(nav.link.left)}…${Math.round(nav.link.right)}. ` +
        "Разошлись числа шапки и `--nav-*` в tokens.css",
    );
    assert.ok(
      nav.tip.y >= nav.barBottom - 1 && nav.tip.y <= nav.barBottom + 12,
      `@${width}px острие не у кромки шапки: y=${Math.round(nav.tip.y)}, ` +
        `низ шапки ${Math.round(nav.barBottom)}`,
    );

    await page.goto(url("about/"));
    const about = await page.evaluate(
      ([fn]) => {
        const tip = new Function(`return (${fn})`)()(".cv-row");
        const btn = document.querySelector("a.cv").getBoundingClientRect();
        const note = document
          .querySelector(".cv-row .hand-text")
          .getBoundingClientRect();
        const card = document.querySelector("article.card");
        const box = card.getBoundingClientRect();
        const s = getComputedStyle(card);
        const above = document.querySelector("p.how").getBoundingClientRect();
        return {
          tip,
          btn: btn.toJSON(),
          note: note.toJSON(),
          inner: {
            left: box.left + parseFloat(s.paddingLeft),
            right: box.right - parseFloat(s.paddingRight),
          },
          textAbove: above.bottom,
        };
      },
      [tipOf.toString()],
    );
    visible(about.tip, `@${width}px на /about/`);
    const gap = about.tip.x - about.btn.right;
    const third = (about.btn.bottom - about.btn.top) / 3;
    assert.ok(
      gap >= 0 &&
        gap <= 24 &&
        about.tip.y >= about.btn.top + third &&
        about.tip.y <= about.btn.bottom - third,
      `@${width}px стрелка на /about/ не указывает на кнопку: острие ` +
        `(${Math.round(about.tip.x)}, ${Math.round(about.tip.y)}), кнопка ` +
        `${Math.round(about.btn.left)}…${Math.round(about.btn.right)} × ` +
        `${Math.round(about.btn.top)}…${Math.round(about.btn.bottom)}`,
    );
    // Стекло карточки режет всё, что за краем (`overflow: hidden`), — вылезшую
    // подпись B7 не заметит: страница шире не становится.
    assert.ok(
      about.note.left >= about.inner.left - 1 &&
        about.note.right <= about.inner.right + 1,
      `@${width}px подпись у кнопки вылезла за карточку и обрезана: ` +
        `${Math.round(about.note.left)}…${Math.round(about.note.right)}, ` +
        `карточка ${Math.round(about.inner.left)}…${Math.round(about.inner.right)}`,
    );
    assert.ok(
      about.note.top >= about.textAbove,
      `@${width}px подпись у кнопки наехала на абзац над ней: верх ` +
        `${Math.round(about.note.top)} выше его низа ${Math.round(about.textAbove)}`,
    );

    await page.close();
  }

  /*
   * ⚠ При reduced-motion стрелка нарисована СРАЗУ. Общее правило в global.css
   * сокращает длительность анимаций, но не задержку: без своего правила
   * пометка полсекунды оставалась бы пустой, а потом возникала рывком. B6 этого
   * не видит — он судит длительности.
   */
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    reducedMotion: "reduce",
  });
  await page.goto(url(""));
  const drawn = await page.evaluate(() =>
    [
      ...document.querySelectorAll(
        ".hand-note .stem, .hand-note .tip, .hand-note .hand-text",
      ),
    ].map((el) => {
      const s = getComputedStyle(el);
      return `${el.getAttribute("class")}:${parseFloat(s.strokeDashoffset) || 0}/${s.opacity}`;
    }),
  );
  await page.close();
  assert.ok(
    drawn.length === 3,
    `на главной не нашлось пометки целиком: ${drawn}`,
  );
  assert.deepEqual(
    drawn.filter((d) => !d.endsWith(":0/1")),
    [],
    "при reduced-motion пометка не нарисована сразу после загрузки — ждёт " +
      "задержку анимации, которую общее правило не гасит",
  );
});

test("ссылка с якорем ведёт на карточку и РАСКРЫВАЕТ её", async () => {
  /*
   * Отдельных страниц у проектов больше нет, и меню из шапки убрано: ссылка на
   * проект — это якорь `/#slug`, который приходит снаружи (резюме, письмо,
   * чат). Значит он обязан не просто доскроллить до свёрнутой строки, а открыть
   * её; иначе переход выглядит как промах — страница дёрнулась, показать ничего
   * не показала.
   *
   * ⚠ Проверяется и ПОЛОЖЕНИЕ: шапка липкая, и карточка, приехавшая под неё,
   * формально «открыта», а по факту наполовину закрыта. Это ловится только
   * сравнением с нижней кромкой шапки, а не фактом `open`.
   */
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
  });
  // Именно «/», а не «/index.html»: ссылки меню ведут на `/#якорь`, и только с
  // этого адреса переход остаётся сменой хэша, а не перезагрузкой страницы.
  await page.goto(url(""));

  const state = () =>
    page.evaluate(() =>
      Object.fromEntries(
        [...document.querySelectorAll("details.card")].map((c) => [
          c.id,
          c.open,
        ]),
      ),
    );

  const before = await state();
  const ids = Object.keys(before);
  assert.ok(
    ids.length >= 2,
    "на главной меньше двух карточек — нечего проверять",
  );
  assert.ok(
    Object.values(before).every((v) => v === false),
    "карточки не должны быть раскрыты до перехода по меню",
  );

  // ⚠ Перебираются ВСЕ карточки, а не одна, и это не педантизм. Первая версия
  // брала последнюю — а она в конце страницы, доскроллить её под шапку просто
  // некуда, и проверка положения проходила по случайности: с УДАЛЁННЫМ
  // `scroll-margin-top` тест оставался зелёным. Ошибка видна только на
  // карточках, до которых страница реально доматывается.
  for (const target of ids) {
    // Меню из шапки убрано: якорь приходит снаружи — из резюме, письма, чата.
    // Воспроизводим именно это, а не клик по несуществующему пункту.
    await page.evaluate((id) => {
      location.hash = `#${id}`;
    }, target);
    await until(
      page,
      (id) => document.getElementById(id).open,
      target,
      `ссылка с якорем не раскрыла карточку ${target}`,
    );
    await positionSettled(page, target);

    const after = await state();
    assert.equal(
      after[target],
      true,
      `пункт меню не раскрыл карточку ${target}`,
    );
    for (const id of ids) {
      if (id === target) continue;
      assert.equal(
        after[id],
        false,
        `карточка ${id} осталась раскрытой при переходе к ${target} — это не аккордеон`,
      );
    }

    const gap = await page.evaluate((id) => {
      const card = document.getElementById(id).getBoundingClientRect();
      const nav = document.querySelector("header.nav").getBoundingClientRect();
      return Math.round(card.top - nav.bottom);
    }, target);
    assert.ok(
      gap >= -1,
      `карточка ${target} приехала ПОД липкую шапку (на ${-gap}px) — ` +
        `нужен scroll-margin-top не меньше высоты шапки`,
    );
  }

  await page.close();
});

test("фон не перерисовывается при прокрутке (background-attachment: fixed)", async () => {
  /*
   * Найдено владельцем на десктопе 2026-09-22: при быстрой прокрутке вверх
   * между карточками мелькали ЧЁРНЫЕ прямоугольники.
   *
   * Механика: фон с `background-attachment: fixed` обязан перерисовываться на
   * каждый кадр прокрутки, а рядом стоят стеклянные карточки с
   * `backdrop-filter`, которому нужен снимок того же фона. Браузер прокручивает
   * страницу на композиторе, растеризация за ним не поспевает — и в кадр
   * попадает плитка, которую ещё не нарисовали. Видно её в ЗАЗОРАХ между
   * карточками: только там фон и открыт.
   *
   * ⚠ Проверяется СОСТОЯНИЕ СТРАНИЦЫ, а не текст css-файла: стилей несколько,
   * и запрет, привязанный к одному из них, обходится переездом строки в
   * соседний. Псевдоэлементы проверяются отдельно — холст и узор живут именно
   * в них, и `querySelectorAll` их не видит.
   *
   * Сам артефакт воспроизвести headless нельзя: скриншот заставляет браузер
   * дорисовать всё, и в кадр попадает уже исправная картинка. Поэтому здесь
   * стережётся ПРИЧИНА, а не её вид.
   */
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
  });
  await page.goto(url(""));

  const offenders = await page.evaluate(() => {
    const out = [];
    const check = (el, pseudo) => {
      const v = getComputedStyle(el, pseudo).backgroundAttachment;
      if (v && v.split(",").some((part) => part.trim() === "fixed")) {
        out.push(
          `${el.tagName.toLowerCase()}${el.className ? "." + String(el.className).split(" ")[0] : ""}${pseudo ?? ""}`,
        );
      }
    };
    for (const el of document.querySelectorAll("*")) {
      check(el, null);
      check(el, "::before");
      check(el, "::after");
    }
    check(document.documentElement, null);
    check(document.documentElement, "::before");
    return out;
  });

  assert.deepEqual(
    offenders,
    [],
    "фон закреплён через background-attachment: fixed — при прокрутке он " +
      "перерисовывается каждый кадр, и рядом со стеклом это даёт чёрные " +
      "прямоугольники в зазорах. Закрепляйте ЭЛЕМЕНТОМ (position: fixed), " +
      `нашлось: ${offenders.join(", ")}`,
  );

  await page.close();
});

test("подвал: у каждой ссылки есть ПОДПИСЬ, а не только значок", async () => {
  /*
   * Значки в подвале — подпись к тексту, а не замена ему, и это легко потерять
   * при следующей «чистке»: иконки выглядят опрятнее, соблазн убрать текст
   * велик. Ссылка из одного значка требует угадывания у зрячего и вовсе
   * безымянна для скринридера — а это единственный на сайте блок, ради
   * которого посетитель вообще берётся за мышь.
   *
   * Проверяется вычисленное ИМЯ ссылки, а не наличие тега: значок обязан быть
   * `aria-hidden`, иначе в имя попадёт мусор из `<svg>`.
   */
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
  });
  await page.goto(url(""));

  const links = await page.evaluate(() =>
    [...document.querySelectorAll("footer.foot nav a")].map((a) => ({
      href: a.getAttribute("href"),
      label: a.textContent.trim(),
      iconHidden: [...a.querySelectorAll("svg")].every(
        (svg) => svg.getAttribute("aria-hidden") === "true",
      ),
      icons: a.querySelectorAll("svg").length,
    })),
  );
  await page.close();

  assert.ok(links.length >= 3, "в подвале почти нет ссылок — проверять нечего");
  for (const l of links) {
    assert.ok(
      l.label.length > 0,
      `ссылка ${l.href} осталась без подписи — один значок нечитаем`,
    );
    assert.equal(l.icons, 1, `у ссылки ${l.href} не один значок, а ${l.icons}`);
    assert.ok(
      l.iconHidden,
      `значок у ${l.href} не помечен aria-hidden — попадёт в имя ссылки`,
    );
  }
});

test("B6: при reduced-motion ничего не анимируется", async () => {
  /*
   * ⚠ Проверяется ДЛИТЕЛЬНОСТЬ, а не `playState` в случайный момент.
   *
   * Прежняя редакция считала «сколько анимаций сейчас играет» сразу после
   * загрузки, и это была гонка с самим собой: при reduced-motion правило
   * сокращает длительности до 0.01 мс, но анимация на один кадр всё равно
   * существует и может попасть в замер как `running`. Тест падал примерно раз
   * на пять прогонов — и падал на исправном коде, что хуже, чем не падать
   * вовсе: такой сбой не отличить от найденной ошибки, и его начинают
   * перезапускать вместо того, чтобы читать.
   *
   * Длительность же — свойство, а не момент времени. Заодно формулировка стала
   * ближе к смыслу: обещано не «в этот миг ничего не играет», а «ничего не
   * движется ЗАМЕТНО».
   */
  const durations = async (reducedMotion) => {
    const page = await browser.newPage({
      viewport: { width: 390, height: 800 },
      reducedMotion,
    });
    await page.goto(url("index.html"));
    const list = await page.evaluate(() =>
      document.getAnimations().map((a) => {
        const timing = a.effect?.getComputedTiming?.();
        const duration =
          typeof timing?.duration === "number" ? timing.duration : 0;
        const target = a.effect?.target;
        return {
          duration,
          who: target
            ? `${target.tagName.toLowerCase()}${
                target.className
                  ? `.${String(target.className).split(" ")[0]}`
                  : ""
              }`
            : "?",
        };
      }),
    );
    await page.close();
    return list;
  };

  // Сначала убеждаемся, что проверять ЕСТЬ что: без этого тест ниже проходил бы
  // на странице вообще без анимаций, ничего не доказывая.
  const normal = await durations("no-preference");
  assert.ok(
    normal.some((a) => a.duration > 1),
    "в обычном режиме на главной не нашлось ни одной заметной анимации — " +
      "проверка ниже подтверждала бы пустоту",
  );

  const reduced = await durations("reduce");
  const noticeable = reduced.filter((a) => a.duration > 1);
  assert.deepEqual(
    noticeable,
    [],
    `при reduced-motion остались заметные анимации: ` +
      noticeable.map((a) => `${a.who} (${a.duration}мс)`).join(", "),
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
