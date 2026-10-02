/**
 * Касание не оставляет следов: наведение, подъём и кольцо фокуса — только там,
 * где ими пользуются.
 *
 * Класс найден владельцем 03.10 на iPhone: вокруг шапки раскрытой карточки —
 * светлая скруглённая рамка. Это было кольцо `:focus-visible`: WebKit (Safari и
 * любой браузер на iOS) считает видимым фокус, который переносит сам `<dialog>`, —
 * на крестик при открытии, на шапку карточки при закрытии, — даже если ролик
 * открыли пальцем. Рядом жили родственники: `:hover` на телефоне залипает после
 * касания, а `:focus-within` держится, пока фокус в карточке (касание ставит его
 * на `summary`), — карточка оставалась «поднятой», фрейм сдвинутым, кнопка
 * темы подсвеченной.
 *
 * Сторожей два, и ловят они разное:
 * 1. Правила CSS, без браузера: `:hover` — только под `@media (hover: hover)`;
 *    `:focus-within` нет вовсе (клавиатуру ловит `:has(:focus-visible)`); голый
 *    `:focus` — только у ссылки «к содержимому», до которой пальцем не достать.
 *    Новое правило мимо этого краснеет здесь, а не на телефоне владельца.
 * 2. Сценарий пальцем в Chromium И WebKit: кольцо после касания — поведение
 *    движка, а не правило CSS, и живёт оно только в WebKit. После каждого шага —
 *    ни одного элемента с `:focus-visible`, у карточки и фрейма стили покоя, а
 *    фокус вернулся в карточку: «починка» снятием фокуса тоже краснеет — для
 *    скринридера это потеря места. Обратная сторона — клавиатура и мышь: Tab,
 *    Enter, Esc дают кольцо, курсор и Tab поднимают карточку, как и раньше.
 */
import { strict as assert } from "node:assert";
import { readdirSync, readFileSync } from "node:fs";
import test, { after, before } from "node:test";

import { chromium, webkit } from "playwright";

import { serveDist } from "./lib/serve.mjs";

const DIST = new URL("../dist/", import.meta.url);
const PHONE = {
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
};
const DESKTOP = { viewport: { width: 1280, height: 900 } };

/* ---------- 1. правила CSS ---------- */

/** Весь CSS сборки: файлы `_astro/*.css` и `<style>` в страницах — Astro мелкие стили встраивает. */
function builtCss() {
  const files = readdirSync(DIST, { recursive: true }).map(String);
  const sheets = files
    .filter((f) => f.endsWith(".css"))
    .map((f) => readFileSync(new URL(f, DIST), "utf8"));
  for (const page of files.filter((f) => f.endsWith(".html"))) {
    const html = readFileSync(new URL(page, DIST), "utf8");
    for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g))
      sheets.push(m[1]);
  }
  return sheets.join("\n");
}

/** Правила стилей с цепочкой обёрток вокруг них: `{ selector, wrappers }`. */
function styleRules(css) {
  const rules = [];
  const stack = [];
  let buf = "";
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === "/" && css[i + 1] === "*") {
      const end = css.indexOf("*/", i + 2);
      i = end < 0 ? css.length : end + 1;
    } else if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < css.length && css[j] !== ch) j += css[j] === "\\" ? 2 : 1;
      buf += css.slice(i, j + 1);
      i = j;
    } else if (ch === "{") {
      const prelude = buf.trim().replace(/\s+/g, " ");
      if (!prelude.startsWith("@"))
        rules.push({ selector: prelude, wrappers: [...stack] });
      stack.push(prelude);
      buf = "";
    } else if (ch === "}" || ch === ";") {
      if (ch === "}") stack.pop();
      buf = "";
    } else buf += ch;
  }
  return rules;
}

/** `a:is(.x,.y), b` → [`a:is(.x,.y)`, `b`]: запятые внутри скобок не делят. */
function splitSelectors(list) {
  const out = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < list.length; i++) {
    if (list[i] === "(") depth++;
    else if (list[i] === ")") depth--;
    else if (list[i] === "," && depth === 0) {
      out.push(list.slice(start, i).trim());
      start = i + 1;
    }
  }
  out.push(list.slice(start).trim());
  return out;
}

const HOVER_MEDIA = /^@media\b.*\(\s*hover\s*:\s*hover\s*\)/;
/** Голый `:focus` законен там, куда пальцем не попасть: ссылка «к содержимому» живёт за краем экрана. */
const FOCUS_ALLOWED = [/^\.skip:focus$/];

test("CSS: наведение — только с курсором, подъём от фокуса — только от клавиатуры", () => {
  const rules = styleRules(builtCss());
  const selectors = rules.flatMap((r) =>
    splitSelectors(r.selector).map((s) => ({ s, wrappers: r.wrappers })),
  );
  // Канарейка: разбор действительно видит правила, а не пустоту — иначе
  // проверки ниже прошли бы на чём угодно.
  const hovers = selectors.filter(({ s }) => s.includes(":hover"));
  assert.ok(
    selectors.length > 100,
    `в сборке найдено всего ${selectors.length} селекторов — разбор CSS сломан`,
  );
  assert.ok(
    hovers.length > 0,
    "в сборке нет ни одного :hover — разбор CSS сломан или CSS не там",
  );

  const sticky = hovers.filter(
    ({ wrappers }) => !wrappers.some((w) => HOVER_MEDIA.test(w)),
  );
  assert.deepEqual(
    sticky.map(({ s }) => s),
    [],
    "`:hover` вне `@media (hover: hover)`: на телефоне он залипает после касания и держится, пока не коснёшься другого места",
  );

  const within = selectors.filter(({ s }) => s.includes(":focus-within"));
  assert.deepEqual(
    within.map(({ s }) => s),
    [],
    "`:focus-within` включается и от касания (палец ставит фокус на `summary`) и держится, пока фокус внутри; клавиатуру ловит `:has(:focus-visible)`",
  );

  const bareFocus = selectors.filter(
    ({ s }) =>
      /:focus(?![-\w])/.test(s) && !FOCUS_ALLOWED.some((re) => re.test(s)),
  );
  assert.deepEqual(
    bareFocus.map(({ s }) => s),
    [],
    "голый `:focus` срабатывает и от касания/клика — для клавиатуры есть `:focus-visible`",
  );
});

/* ---------- 2. сценарий пальцем, клавиатурой и мышью ---------- */

let site;
const browsers = {};

before(async () => {
  site = await serveDist(DIST);
  browsers.chromium = await chromium.launch();
  browsers.webkit = await webkit.launch();
});

after(async () => {
  for (const b of Object.values(browsers)) await b?.close();
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

/** Конечные анимации и переходы доиграли — стили читаются в покое, а не на полпути. */
const settled = () =>
  document
    .getAnimations()
    .every(
      (a) =>
        a.playState !== "running" ||
        a.effect?.getComputedTiming().endTime === Infinity,
    );

/** Следы взаимодействия: у кого кольцо фокуса, как выглядят карточка и фрейм, где фокус. */
function traces(id) {
  const card = document.getElementById(id);
  const frame = card.querySelector("[data-demo-open]");
  const head = card.querySelector("summary");
  const pick = (el, props) =>
    Object.fromEntries(props.map((p) => [p, getComputedStyle(el)[p]]));
  const tag = (el) =>
    el.tagName.toLowerCase() +
    (typeof el.className === "string" && el.className.trim()
      ? `.${el.className.trim().split(/\s+/).join(".")}`
      : "");
  return {
    ringed: [...document.querySelectorAll("*")]
      .filter((el) => el.matches(":focus-visible"))
      .map(tag),
    look: {
      card: pick(card, ["borderTopColor", "boxShadow"]),
      frame: pick(frame, ["transform", "boxShadow"]),
      head: pick(head, ["outlineStyle"]),
    },
    focusInCard: card.contains(document.activeElement),
    tapHighlight: getComputedStyle(head).getPropertyValue(
      "-webkit-tap-highlight-color",
    ),
  };
}

const modalOpen = () => document.querySelector("dialog[data-demo-modal]").open;
const modalClosed = () =>
  !document.querySelector("dialog[data-demo-modal]").open;
const ring = () => {
  const a = document.activeElement;
  return (
    a.matches(":focus-visible") && getComputedStyle(a).outlineStyle !== "none"
  );
};

/** Страница с карточкой, у которой есть свой ролик: модалка и фрейм проверяются на ней. */
async function openHome(engine, options) {
  const context = await browsers[engine].newContext(options);
  const page = await context.newPage();
  await page.goto(`${site.origin}/`);
  const id = await page.evaluate(
    () => document.querySelector('template[id^="demo-"]')?.id.slice(5) ?? null,
  );
  assert.ok(id, "ни у одной карточки нет своего ролика — проверять нечего");
  return { context, page, id, card: page.locator(`details#${id}`) };
}

for (const engine of ["chromium", "webkit"]) {
  test(`касание не оставляет следов — ${engine}`, async () => {
    const { context, page, id, card } = await openHome(engine, PHONE);
    const frame = card.locator("[data-demo-open]");
    const read = async () => {
      await until(page, settled, null, "анимации доиграли");
      return page.evaluate(traces, id);
    };
    const rest = await read();
    assert.deepEqual(rest.ringed, [], "кольцо фокуса ещё до всякого касания");
    if (rest.tapHighlight) {
      assert.equal(
        rest.tapHighlight,
        "rgba(0, 0, 0, 0)",
        "у шапки карточки штатная подсветка касания: на iOS это тёмная плашка на полкарточки",
      );
    }

    /** После шага: ни одного кольца, карточка и фрейм в покое, фокус — там, где был. */
    const clean = async (step, { focusBack = false } = {}) => {
      const now = await read();
      assert.deepEqual(
        now.ringed,
        [],
        `${step}: после касания нарисовано кольцо фокуса — ${now.ringed.join(", ")}. ` +
          "WebKit считает видимым фокус, который переносит <dialog>; см. moveFocusAsBefore в demo-modal.ts",
      );
      assert.deepEqual(
        now.look,
        rest.look,
        `${step}: карточка или фрейм не вернулись в покой — залип :hover или :focus-within. ` +
          "Подъём — только под @media (hover: hover) и от :has(:focus-visible)",
      );
      if (focusBack) {
        assert.ok(
          now.focusInCard,
          `${step}: фокус не вернулся в карточку — скринридер теряет место, откуда открывали ролик`,
        );
      }
    };

    await card.locator(".title").tap();
    await until(
      page,
      (id) => document.getElementById(id).open,
      id,
      "карточка раскрылась",
    );
    await clean("касание шапки");

    await frame.tap();
    await until(page, modalOpen, null, "ролик открылся с фрейма");
    await clean("ролик открыт касанием фрейма");
    await page.locator("[data-demo-close]").tap();
    await until(page, modalClosed, null, "ролик закрылся крестиком");
    await clean("закрыт крестиком", { focusBack: true });

    await frame.tap();
    await until(page, modalOpen, null, "ролик открылся с фрейма снова");
    const height = await page.evaluate(() => innerHeight);
    await page.touchscreen.tap(195, height - 40);
    await until(page, modalClosed, null, "ролик закрылся касанием мимо него");
    await clean("закрыт касанием мимо ролика", { focusBack: true });

    await card.locator('a[data-proof="video"]').tap();
    await until(page, modalOpen, null, "ролик открылся со ссылки");
    await clean("ролик открыт касанием ссылки");
    await page.locator("[data-demo-close]").tap();
    await until(page, modalClosed, null, "ролик со ссылки закрылся крестиком");
    await clean("ролик со ссылки закрыт крестиком");

    await context.close();
  });

  test(`клавиатура и мышь: кольцо и подъём на месте — ${engine}`, async () => {
    const { context, page, id, card } = await openHome(engine, DESKTOP);
    const look = async () => {
      await until(page, settled, null, "анимации доиграли");
      return (await page.evaluate(traces, id)).look;
    };
    const rest = await look();

    await card.locator(".title").hover();
    assert.notDeepEqual(
      await look(),
      rest,
      "курсор над карточкой её не поднимает — подъём потерян",
    );
    await page.mouse.move(5, 5);
    assert.deepEqual(
      await look(),
      rest,
      "курсор ушёл, а карточка осталась поднятой",
    );

    const onHead = (id) =>
      document.activeElement ===
      document.querySelector(`details#${id} > summary`);
    for (let i = 0; i < 40 && !(await page.evaluate(onHead, id)); i++)
      await page.keyboard.press("Tab");
    assert.ok(
      await page.evaluate(onHead, id),
      "Tab не дошёл до шапки карточки",
    );
    assert.ok(
      await page.evaluate(ring),
      "шапка в фокусе с клавиатуры, а кольца нет",
    );
    assert.notDeepEqual(
      await look(),
      rest,
      "фокус с клавиатуры не поднимает карточку — паритет с курсором потерян",
    );

    await page.keyboard.press("Enter");
    await until(
      page,
      (id) => document.getElementById(id).open,
      id,
      "Enter раскрыл карточку",
    );
    // До ссылки «Watch demo»: Tab, а если движок ссылки им пропускает (WebKit
    // на macOS, как Safari по умолчанию) — Option+Tab.
    const onLink = () =>
      document.activeElement.matches('a[data-proof="video"]');
    for (const key of ["Tab", "Alt+Tab"]) {
      await page.evaluate(
        (id) => document.querySelector(`details#${id} > summary`).focus(),
        id,
      );
      for (let i = 0; i < 6 && !(await page.evaluate(onLink)); i++)
        await page.keyboard.press(key);
      if (await page.evaluate(onLink)) break;
    }
    assert.ok(
      await page.evaluate(onLink),
      "ни Tab, ни Option+Tab не дошли до «Watch demo»",
    );
    assert.ok(
      await page.evaluate(ring),
      "«Watch demo» в фокусе с клавиатуры, а кольца нет",
    );

    await page.keyboard.press("Enter");
    await until(page, modalOpen, null, "Enter открыл ролик");
    assert.ok(
      await page.evaluate(ring),
      "ролик открыт с клавиатуры, а у крестика нет кольца",
    );
    await page.keyboard.press("Escape");
    await until(page, modalClosed, null, "Esc закрыл ролик");
    assert.ok(
      await page.evaluate(onLink),
      "после Esc фокус не вернулся на «Watch demo»",
    );
    assert.ok(await page.evaluate(ring), "после Esc у «Watch demo» нет кольца");

    await context.close();
  });
}
