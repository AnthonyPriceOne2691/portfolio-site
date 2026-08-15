import { existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Единственный контракт, который обязан соблюсти новый проект, чтобы попасть на
 * сайт (design 8.2.1). Схема — не документация: сломанный frontmatter ВАЛИТ
 * СБОРКУ, а не рендерит пустоту. Это acceptance-примеры A2 и A3 подписанной спеки.
 *
 * Языковые ветки — две коллекции с одной схемой: EN источник истины, RU зеркало
 * (design 7.3). Пара slug'ов обязана существовать в обеих; проверка пары — в
 * поставке MVP, где появится второй язык (кандидат в примеры, см. STATUS).
 */
const projectSchema = z.object({
  title: z.string().min(1),
  oneLiner: z.string().min(1),
  /** Одна ключевая метрика карточки (design 4.3) — не список. */
  metric: z.string().min(1),
  status: z.enum(["production", "local-demo", "poc"]),
  stack: z.array(z.string().min(1)).nonempty(),
  /** Хотя бы один пруф обязателен: карточка без доказательства — реклама. */
  proof: z
    .object({
      video: z.string().url().optional(),
      teaser: z.string().optional(),
      poster: z.string().optional(),
      github: z.string().url().optional(),
      case: z.string().optional(),
    })
    .refine((p) => Object.values(p).some(Boolean), {
      message: "нужен хотя бы один proof: video | teaser | github | case",
    }),
  /** Секция Under contract — сквозной мотив сайта (design 3.1, 4.4). */
  contract: z.string().min(1),
  featured: z.boolean().default(false),
  order: z.number().int().nonnegative(),
  updated: z.coerce.date(),
  draft: z.boolean().default(false),
});

/**
 * Оракул языковых пар (acceptance-пример B4).
 *
 * Дизайн объявляет пару RU+EN обязательной с v0.5 (§8.2.1), но ПРОВЕРКИ до
 * 07.08 не существовало ни в схеме, ни в CI: правило держалось на дисциплине.
 * Языковой дрейф — главный риск двух веток (§13 дизайна), и ловить его глазами
 * бессмысленно: он появляется не в момент правки, а через месяц, когда забыли.
 *
 * Проверка живёт ЗДЕСЬ, а не отдельным скриптом, потому что здесь она попадает
 * в `npm run build` бесплатно и роняет сборку до рендера — а сломанный сайт
 * лучше сайта с тихо пропавшей половиной страниц.
 */
function assertLanguagePairs(): void {
  const dir = (locale: string) =>
    new URL(`./content/projects/${locale}/`, import.meta.url);
  const slugs = (locale: string): Set<string> => {
    const path = fileURLToPath(dir(locale));
    if (!existsSync(path)) return new Set();
    return new Set(
      readdirSync(path)
        .filter((f) => f.endsWith(".md"))
        .map((f) => f.slice(0, -3)),
    );
  };

  const ruSlugs = slugs("ru");
  const enSlugs = slugs("en");
  const missingEn = [...ruSlugs].filter((s) => !enSlugs.has(s)).sort();
  const missingRu = [...enSlugs].filter((s) => !ruSlugs.has(s)).sort();
  if (missingEn.length === 0 && missingRu.length === 0) return;

  const lines = [
    "Языковые пары проектов разошлись (design §8.2.1, §13).",
    ...missingEn.map((s) => `  нет EN-файла: src/content/projects/en/${s}.md`),
    ...missingRu.map((s) => `  нет RU-файла: src/content/projects/ru/${s}.md`),
    "Оба языка правятся ОДНИМ коммитом — иначе страница исчезает молча.",
  ];
  throw new Error(lines.join("\n"));
}

assertLanguagePairs();

const ru = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects/ru" }),
  schema: projectSchema,
});

const en = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects/en" }),
  schema: projectSchema,
});

export const collections = { ru, en };
