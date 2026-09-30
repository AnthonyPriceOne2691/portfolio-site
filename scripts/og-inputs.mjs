/**
 * Тексты, из которых собирается превью ссылки (`public/og.jpg`).
 *
 * Отдельным модулем, потому что их читают двое: сборщик картинки
 * (`make-assets.mjs`) и сторож свежести (`tests/og-fresh.test.mjs`). 30.09
 * превью три дня показывало «443 tests» и «Outreach Automation SaaS»: карточки
 * переписали, а картинку никто не пересобрал — и заметить это мог только тот,
 * кто пришлёт ссылку в Telegram.
 */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const ROOT = fileURLToPath(new URL("../", import.meta.url));
export const read = (rel) => readFileSync(ROOT + rel, "utf8");

const dictionary = (key) =>
  read("src/lib/text.ts").match(
    new RegExp(`"${key.replace(".", "\\.")}":\\s*"([^"]+)"`),
  )?.[1] ?? "";

/** Роль — из словаря, чтобы не разошлась с сайтом. */
export function role() {
  return dictionary("home.role");
}

/**
 * Крючок превью — первая фраза героя («MVP in a week, production in two.»).
 * Превью видят в Telegram и LinkedIn раньше сайта, и разойтись с героем при
 * следующей правке оно не должно.
 */
export function hook() {
  return dictionary("home.pitch").split(/(?<=\.)\s/)[0] ?? "";
}

/** Метрика и название каждого опубликованного проекта, в порядке order. */
export function projects() {
  const dir = ROOT + "src/content/projects/";
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const fm = readFileSync(dir + f, "utf8").split("---")[1] ?? "";
      const get = (k) =>
        fm.match(new RegExp("^" + k + ': "(.*)"$', "m"))?.[1] ?? "";
      return {
        metric: get("metric"),
        title: get("title"),
        order: Number(fm.match(/^order:\s*(\d+)/m)?.[1] ?? 99),
        draft: /^draft:\s*true/m.test(fm),
      };
    })
    .filter((p) => !p.draft)
    .sort((a, b) => a.order - b.order);
}

/** Всё, что попадает на картинку текстом, — снимок для сторожа свежести. */
export function ogInputs() {
  return {
    role: role(),
    hook: hook(),
    projects: projects().map(({ metric, title }) => ({ metric, title })),
  };
}
