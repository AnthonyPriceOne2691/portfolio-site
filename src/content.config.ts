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

const en = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects/en" }),
  schema: projectSchema,
});

const ru = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects/ru" }),
  schema: projectSchema,
});

export const collections = { en, ru };
