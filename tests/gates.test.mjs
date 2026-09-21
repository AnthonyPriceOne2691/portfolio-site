/**
 * Гейты судят ВЕРНО, а не просто живы.
 *
 * За одну сессию один и тот же дефект встретился трижды: маска в канонном
 * гейте не знает раскладку ЭТОГО проекта, а гейт при этом выглядит рабочим.
 * Разбор — урок L6 в `delivery/archive/INDEX.md`.
 *
 * ⚠ Почему это не закрывается канарейками доктора. Канарейка там — файл с
 * нарушением, и она доказывает, что гейт СРАБАТЫВАЕТ. Наш класс даёт другое:
 * гейт срабатывает исправно, но применяет правило не к тому классу файлов
 * (порог тестов к проду), либо выносит ложную тревогу (счётчик обнулился),
 * либо читает ноль файлов и рапортует об этом как о факте. У `check_file_length.sh`
 * канарейка есть и она «поймана» — а порог для тестов месяц был чужой.
 *
 * Здесь прогон на входе, где ответ известен заранее И ОТЛИЧАЕТСЯ от текущего
 * состояния: только такой вход отличает верный гейт от сломанного. Зелёное на
 * верном входе не доказывает ничего.
 *
 * ⚠ Эти сторожа переживают накат канона. Канон 2.31 всё ещё несёт баг счётчика
 * модулей (проверено): следующее обновление вернёт его, и тест покраснеет
 * в тот же день, а не через месяц.
 */
import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const ROOT = fileURLToPath(new URL("../", import.meta.url));

/** Прогон гейта: код возврата и вывод, без исключений на красном. */
function gate(script, env = {}) {
  try {
    const out = execFileSync("bash", [`scripts/lint/${script}`], {
      cwd: ROOT,
      env: { ...process.env, ...env },
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status ?? 1, out: `${e.stdout ?? ""}${e.stderr ?? ""}` };
  }
}

const git = (...args) =>
  execFileSync("git", args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

/**
 * Кладёт канарейку, прогоняет, убирает — даже если проверка упала.
 *
 * ⚠ `git add -N` обязателен. Гейты перечисляют файлы через `git ls-files`, и
 * НЕОТСЛЕЖИВАЕМОГО файла для них не существует: без этой строки канарейка в
 * `src/` спокойно «проходила» прод-лимит, потому что её никто не видел, —
 * то есть проверка молча меряла пустоту. Флаг объявляет файл индексу, не
 * записывая содержимое, и снимается `git reset`.
 */
function withCanary(rel, content, fn) {
  const abs = `${ROOT}${rel}`;
  mkdirSync(abs.slice(0, abs.lastIndexOf("/")), { recursive: true });
  writeFileSync(abs, content);
  git("add", "-N", "--", rel);
  try {
    return fn();
  } finally {
    try {
      git("reset", "-q", "--", rel);
    } catch {}
    rmSync(abs, { force: true });
  }
}

const LENGTH_ENV = {
  LINT_LENGTH_GLOBS: "*.astro *.ts *.tsx *.js *.mjs *.css",
};
// 600 строк: больше прод-лимита (500) и меньше тестового (1000). Именно в этом
// зазоре порог перепутать МОЖНО — файл на 1200 строк красный по обоим.
const LINES_600 = "const x = 1;\n".repeat(600);

test("длина файла: порог берётся по классу файла, а не один на всех", () => {
  // Контроль: без канареек гейт зелёный. Иначе проверки ниже меряют чужую
  // поломку и говорят не о том.
  assert.equal(gate("check_file_length.sh", LENGTH_ENV).code, 0,
    "гейт длины красный ещё до канареек — сначала почини дерево");

  const inTests = withCanary("tests/__canary_length.mjs", LINES_600,
    () => gate("check_file_length.sh", LENGTH_ENV));
  assert.equal(
    inTests.code, 0,
    "файл на 600 строк В КАТАЛОГЕ tests/ признан нарушением: гейт судит тесты " +
      "прод-лимитом 500 вместо 1000. Маска is_test() снова не знает раскладку " +
      "проекта — тесты этого репозитория лежат в корневом tests/ с расширением " +
      `.mjs.\n${inTests.out}`,
  );

  const inSrc = withCanary("src/__canary_length.ts", LINES_600,
    () => gate("check_file_length.sh", LENGTH_ENV));
  assert.equal(
    inSrc.code, 1,
    "файл на 600 строк в src/ прошёл: прод-лимит 500 не применяется, то есть " +
      "is_test() стала слишком широкой и метит продовый код тестовым порогом",
  );
});

test("слои: счётчик модулей переживает предупреждение depcruise", () => {
  /*
   * Канарейка — модуль-сирота: он не импортирует ничего и его никто не
   * импортирует, depcruise выносит `no-orphan-config` уровня warn. Именно
   * появление ЛЮБОГО предупреждения меняло форму вывода инструмента и
   * обнуляло счётчик: скобка в «(9 modules, …)» есть только в чистом выводе,
   * а при находках она принадлежит числу ошибок.
   *
   * ⚠ Путь вне `src/lib/` и `src/scripts/` — они исключены из no-orphan
   * в `.dependency-cruiser.cjs` (там сироты ложные: depcruise не читает
   * `.astro` и не видит, кто их импортирует). Канарейка обязана лежать там,
   * где правило действует, иначе предупреждения не будет и проверка пуста.
   */
  const r = withCanary("src/__canary_orphan.ts", "export const orphan = 1;\n",
    () => gate("check_layers_gate.sh", { LINT_TS_SRC: "src", LINT_FE_DIR: "." }));

  assert.doesNotMatch(
    r.out, /0 модул(ей|я) просмотрено/,
    "гейт слоёв объявил «0 модулей просмотрено — гейт не видел кода», хотя код " +
      "на месте. Это ЛОЖНЫЙ ДИАГНОЗ: он отправляет чинить область поиска, с " +
      `которой всё в порядке. Шаблон счётчика снова ждёт скобку.\n${r.out}`,
  );
  assert.match(
    r.out, /просмотрено \d+ модул/,
    `гейт слоёв не напечатал число просмотренных модулей вовсе\n${r.out}`,
  );
});

test("delivery-гейт умеет читать расширения, которые реально лежат в tests/", () => {
  /*
   * `TEST_TEXT_SUFFIXES` знал `.js`, но не `.mjs` — и гейт приёмочных примеров
   * читал НОЛЬ тестовых файлов, объявляя все примеры неупомянутыми. Здесь класс
   * дал не ложное зелёное, а ложную тревогу; корень тот же.
   *
   * Ожидание выводится из ФАЙЛОВОЙ СИСТЕМЫ: появится тест на новом расширении,
   * которого список не знает, — проверка покраснеет сразу, а не когда кто-то
   * заметит странное предупреждение.
   */
  const src = readFileSync(`${ROOT}scripts/delivery_base.py`, "utf8");
  const block = src.match(/TEST_TEXT_SUFFIXES\s*=\s*\(([\s\S]*?)\)/)?.[1];
  assert.ok(block, "в scripts/delivery_base.py не найден TEST_TEXT_SUFFIXES");
  const known = new Set([...block.matchAll(/"(\.[a-z]+)"/g)].map((m) => m[1]));

  const present = new Set(
    readdirSync(`${ROOT}tests`)
      .filter((f) => f.includes("."))
      .map((f) => f.slice(f.lastIndexOf("."))),
  );
  assert.ok(present.size > 0, "в tests/ нет файлов — проверять нечего");

  const blind = [...present].filter((ext) => !known.has(ext));
  assert.deepEqual(
    blind, [],
    `delivery-гейт не читает расширения ${blind.join(", ")}, а тесты этого ` +
      "проекта в них и лежат. Гейт acceptance-примеров прочитает ноль файлов " +
      "и объявит примеры неупомянутыми — ложная тревога при исправном дереве. " +
      "Добавь расширение в TEST_TEXT_SUFFIXES (scripts/delivery_base.py)",
  );
});

test("после прогона канареек дерево чистое", () => {
  // Канарейка, пережившая падение, ломает настоящие коммиты: файл на 600 строк
  // в src/ валит гейт длины у следующего правящего, и виноват будет он.
  for (const leftover of ["tests/__canary_length.mjs", "src/__canary_length.ts",
                          "src/__canary_orphan.ts"]) {
    assert.ok(!existsSync(`${ROOT}${leftover}`), `канарейка не убрана: ${leftover}`);
  }
  // Индекс тоже: `git add -N` оставляет запись, и она попала бы в чужой коммит.
  const tracked = git("ls-files", "--", "src/__canary_*", "tests/__canary_*").trim();
  assert.equal(tracked, "", `канарейка осталась в индексе git: ${tracked}`);
});
