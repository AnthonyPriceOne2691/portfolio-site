/**
 * B2 и B3: витрина против контента.
 *
 * Оба примера до 2026-09-21 не судились ничем — это было названо долгом в
 * `spec.md`. Закрывается он реляционными оракулами (§6.5), а не списком
 * ожидаемых значений: тесты читают КАТАЛОГ КОНТЕНТА и сверяют с собранной
 * страницей. Поэтому пятый проект их не ломает — он просто попадает в обе
 * стороны сравнения, и это ровно то свойство, которое B2 и требует
 * («проект = контент, не код»).
 *
 * Тест-значение здесь был бы вреден: список из трёх slug'ов пришлось бы
 * править руками при каждом новом проекте, то есть он ловил бы забывчивость
 * правящего, а не поломку витрины.
 */
import { strict as assert } from "node:assert";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";

const ROOT = new URL("../", import.meta.url);
const DIST = new URL("dist/", ROOT);

/** Ключи `proof`, которые `ProofLinks` превращает в ссылки, в порядке вывода. */
const PROOF_LINKS = ["github", "case", "video"];
/** Своё видео встраивается плеером; внешняя ссылка — остаётся ссылкой. */
const OWN_VIDEO = /^\/.+\.(mp4|webm|ogv)$/i;

/**
 * Разбор frontmatter. Намеренно минимальный: нужны только `order`, `draft` и
 * блок `proof` — те поля, от которых зависят B2 и B3. Полный YAML-парсер тут
 * был бы лишней зависимостью ради трёх регулярок.
 */
function frontmatter(text) {
  const fm = text.split("---")[1] ?? "";
  const order = Number(fm.match(/^order:\s*(\d+)\s*$/m)?.[1]);
  const draft = /^draft:\s*true\s*$/m.test(fm);
  const proof = {};
  const block = fm.match(/^proof:\s*$([\s\S]*?)(?=^\S)/m)?.[1] ?? "";
  for (const line of block.split("\n")) {
    const kv = line.match(/^\s+(\w+):\s*"?([^"]*)"?\s*$/);
    if (kv) proof[kv[1]] = kv[2];
  }
  return { order, draft, proof };
}

function projects() {
  const dir = new URL("src/content/projects/", ROOT);
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({
      slug: f.slice(0, -3),
      ...frontmatter(readFileSync(new URL(f, dir), "utf8")),
    }));
}

const page = (rel) => readFileSync(new URL(rel, DIST), "utf8");
/** Идентификаторы карточек в порядке их следования на странице. */
const cardIds = (html) =>
  [...html.matchAll(/<details[^>]*id="([a-z0-9-]+)"/g)].map((m) => m[1]);
/** Фрагмент HTML одной карточки. Вложенных `<details>` в карточке нет. */
const card = (html, slug) =>
  html.match(
    new RegExp(`<details[^>]*id="${slug}"[\\s\\S]*?</details>`),
  )?.[0] ?? "";

/*
 * ⚠ Витрина ОДНА. Пока языков было два, тесты ниже ходили по списку пар
 * «язык — файл»: витрина обязана была совпасть с коллекцией на каждом из них.
 * Русская версия снята 2026-09-22, список свернулся в одну страницу — но
 * проход по нему сохранён, потому что проверяется отношение «страница =
 * коллекция», а не конкретный файл.
 */
const SHOWCASES = ["index.html"];

test("есть что сверять: контент и сборка на месте", () => {
  // Обе проверки ниже сравнивают два списка. Пустые списки совпадают всегда —
  // без этой страховки тест был бы зелёным на пустом каталоге.
  {
    const all = projects();
    assert.ok(all.length > 0, "нет md-файлов проектов");
    assert.ok(
      all.some((p) => !p.draft),
      "все проекты черновики — сверять на витрине нечего",
    );
    assert.ok(
      all.some((p) => p.draft),
      "нет ни одного черновика — половина B2 про их скрытие не проверяется. " +
        "Заведи draft-проект или сними эту проверку осознанно",
    );
  }
});

test("B2: витрина = коллекция, в порядке order, без черновиков", () => {
  for (const file of SHOWCASES) {
    const all = projects();
    const expected = all
      .filter((p) => !p.draft)
      .sort((a, b) => a.order - b.order)
      .map((p) => p.slug);

    const actual = cardIds(page(file));
    assert.deepEqual(
      actual,
      expected,
      `${file}: витрина разошлась с коллекцией.\n` +
        `  ожидались (по order): ${expected.join(", ")}\n` +
        `  на странице:          ${actual.join(", ")}\n` +
        `  Проект добавляется парой md и обязан появиться САМ, без правки .astro`,
    );

    for (const d of all.filter((p) => p.draft)) {
      assert.ok(
        !actual.includes(d.slug),
        `${file}: черновик «${d.slug}» виден на витрине`,
      );
    }
  }
});

test("B3: неполный proof не оставляет ни пустого блока, ни битой ссылки", () => {
  for (const file of SHOWCASES) {
    const html = page(file);
    for (const p of projects().filter((x) => !x.draft)) {
      const frag = card(html, p.slug);
      assert.ok(frag, `${file}: карточка ${p.slug} не найдена`);

      // Своё видео уходит в плеер, и ссылкой уже не дублируется — иначе рядом
      // с плеером стояла бы ссылка на то, что и так на экране.
      const embedded = p.proof.video && OWN_VIDEO.test(p.proof.video);
      const expected = PROOF_LINKS.filter(
        (k) => p.proof[k] && !(k === "video" && embedded),
      );
      const actual = [...frag.matchAll(/<a class="glass" href="([^"]*)"/g)].map(
        (m) => m[1],
      );

      assert.equal(
        actual.length,
        expected.length,
        `${file} / ${p.slug}: proof-ссылок ${actual.length}, а в frontmatter ${expected.length} ` +
          `(${expected.join(", ") || "ни одной"}). Отсутствующий пруф не должен давать пустую строку`,
      );
      for (const href of actual) {
        assert.ok(
          href.trim(),
          `${file} / ${p.slug}: proof-ссылка с пустым href`,
        );
      }

      // Фрейм есть ВСЕГДА — он держит раскладку, пока съёмки нет.
      assert.match(
        frag,
        /<figure class="frame glass"/,
        `${file} / ${p.slug}: пропал видеофрейм — раскладка поедет при подстановке файла`,
      );
      // ...но без медиа он показывает заглушку, а не битый элемент.
      if (!p.proof.teaser) {
        assert.ok(
          !/<video[^>]*data-hover-play/.test(frag),
          `${file} / ${p.slug}: <video> без тизера — браузер получит пустой источник`,
        );
      }
      if (!p.proof.poster && !p.proof.teaser) {
        assert.match(
          frag,
          /class="soon"/,
          `${file} / ${p.slug}: нет ни медиа, ни заглушки — это пустая дыра, которую B3 и запрещает`,
        );
      }
      assert.ok(
        !/background-image:url\(\)/.test(frag),
        `${file} / ${p.slug}: постер подставлен пустой строкой`,
      );
    }
  }
});
