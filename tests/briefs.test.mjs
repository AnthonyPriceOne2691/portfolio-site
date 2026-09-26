/**
 * Технические брифы (PDF к карточкам): свежие, одного формата, с источниками.
 *
 * Три класса дефекта, каждый уже случался с соседями брифов:
 *  1. PDF отстаёт от исходника. Так живёт CV: исходник вне репозитория, и числа
 *     в PDF не сверяет никто. Здесь исходник в `briefs/`, а манифест хэшей
 *     (`scripts/build-briefs.mjs`) делает отставание красным.
 *  2. Ссылка ведёт мимо. Карточки месяц вели «на код» в профиль GitHub; бриф,
 *     на который никто не ссылается, или ссылка на несобранный бриф — та же
 *     беда с другой стороны.
 *  3. Число без источника. Правило владельца для роликов и витрины: каждое
 *     число — из прогона, с адресом. В брифе его держит реестр `#sources`:
 *     число в тексте без записи в реестре — красное, запись без числа — тоже.
 */
import { strict as assert } from "node:assert";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import test from "node:test";

import {
  MAX_BYTES,
  PAGES,
  pageCount,
  sha256,
  slugs,
  sourceHash,
} from "../scripts/build-briefs.mjs";
import { numbers } from "./lib/numbers.mjs";

const ROOT = new URL("../", import.meta.url);
const manifest = JSON.parse(
  readFileSync(new URL("briefs/manifest.json", ROOT), "utf8"),
);
const pdfOf = (slug) => new URL(`public/briefs/${slug}.pdf`, ROOT);
const REBUILD = "пересоберите: node scripts/build-briefs.mjs";


/** Видимый текст брифа: без стилей, реестра и подвала (`data-nosrc`). */
function visibleText(html) {
  return html
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/g, " ")
    .replace(/<(\w+)\b[^>]*\bdata-nosrc\b[^>]*>[\s\S]*?<\/\1>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&");
}

function sourcesOf(html, slug) {
  const m = html.match(
    /<script type="application\/json" id="sources">([\s\S]*?)<\/script>/,
  );
  assert.ok(m, `${slug}: нет реестра источников <script id="sources">`);
  return JSON.parse(m[1]);
}

/** Опубликованные карточки и их брифы — по frontmatter. */
function cardBriefs() {
  const dir = new URL("src/content/projects/", ROOT);
  const out = new Map();
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".md"))) {
    const fm = readFileSync(new URL(f, dir), "utf8").split("---")[1] ?? "";
    if (/^draft:\s*true\s*$/m.test(fm)) continue;
    const brief = fm.match(/^\s+brief:\s*"\/briefs\/([\w-]+)\.pdf"\s*$/m)?.[1];
    if (brief) out.set(f.replace(/\.md$/, ""), brief);
  }
  return out;
}

test("каждый бриф собран из своего нынешнего исходника", () => {
  const list = slugs();
  assert.ok(list.length > 0, "в briefs/ нет ни одного брифа — проверять нечего");
  assert.deepEqual(
    Object.keys(manifest).sort(),
    list,
    `манифест и исходники брифов расходятся — ${REBUILD}`,
  );
  for (const slug of list) {
    const m = manifest[slug];
    assert.equal(
      m.source,
      sourceHash(slug),
      `${slug}: исходник или brief.css правили после сборки — PDF устарел, ${REBUILD}`,
    );
    assert.ok(existsSync(pdfOf(slug)), `${slug}: нет public/briefs/${slug}.pdf`);
    const pdf = readFileSync(pdfOf(slug));
    assert.equal(
      sha256(pdf),
      m.pdf,
      `${slug}: PDF не тот, что собрал скрипт — подменён в обход сборки`,
    );
    assert.equal(
      pageCount(pdf),
      PAGES,
      `${slug}: страниц ${pageCount(pdf)}, формат брифа — ${PAGES}`,
    );
    assert.ok(pdf.length <= MAX_BYTES, `${slug}: ${pdf.length} байт > ${MAX_BYTES}`);
  }
});

test("бриф и карточка ссылаются друг на друга", () => {
  const cards = cardBriefs();
  const list = slugs();
  for (const [card, brief] of cards) {
    assert.ok(
      list.includes(brief),
      `карточка ${card} ведёт на /briefs/${brief}.pdf, а исходника briefs/${brief}.html нет`,
    );
  }
  const referenced = new Set(cards.values());
  const orphans = list.filter((s) => !referenced.has(s));
  assert.deepEqual(
    orphans,
    [],
    `брифы без карточки: ${orphans.join(", ")} — их не скачает никто`,
  );
});

test("у каждого числа в брифе есть источник", () => {
  for (const slug of slugs()) {
    const html = readFileSync(new URL(`briefs/${slug}.html`, ROOT), "utf8");
    const sources = sourcesOf(html, slug);
    const seen = new Set(numbers(visibleText(html)));
    assert.ok(seen.size > 0, `${slug}: в брифе не нашлось ни одного числа — разбор сломан`);

    const bare = [...seen].filter((n) => !sources[n]?.trim());
    assert.deepEqual(
      bare,
      [],
      `${slug}: числа без источника: ${bare.join(", ")}. Впишите в #sources, откуда число (файл:строки или прогон)`,
    );
    const stale = Object.keys(sources).filter((n) => !seen.has(n));
    assert.deepEqual(
      stale,
      [],
      `${slug}: в #sources числа, которых в тексте больше нет: ${stale.join(", ")}`,
    );
  }
});
