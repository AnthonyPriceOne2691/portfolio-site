import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Единственный контракт, который обязан соблюсти новый проект, чтобы попасть на
 * сайт (design 8.2.1). Схема — не документация: сломанный frontmatter ВАЛИТ
 * СБОРКУ, а не рендерит пустоту. Это acceptance-примеры A2 и A3 подписанной спеки.
 *
 * ⚠ Коллекция ОДНА. До 2026-09-22 их было две, EN и RU, и рядом жил оракул
 * языковых пар: файл без зеркала валил сборку, потому что молча пропавшая
 * половина страниц — худший из отказов. Русская версия снята целиком, пары
 * сравнивать не с чем, и проверка убрана вместе с причиной, а не оставлена
 * зелёной заглушкой.
 */
/** Ссылка на медиа: файл в `public/` (путь от корня) либо абсолютный URL. */
const mediaRef = z
  .string()
  .refine((v) => v.startsWith("/") || /^https?:\/\//i.test(v), {
    message:
      "путь к медиа должен начинаться с «/» (файл в public/) или с http(s)://; " +
      "относительный вид «teaser.mp4» резолвится от адреса страницы и ломается",
  });

const projectSchema = z
  .object({
    title: z.string().min(1),
    oneLiner: z.string().min(1),
    /** Одна ключевая метрика карточки (design 4.3) — не список. */
    metric: z.string().min(1),
    status: z.enum(["production", "local-demo", "poc"]),
    stack: z.array(z.string().min(1)).nonempty(),
    /** Хотя бы один пруф обязателен: карточка без доказательства — реклама. */
    proof: z
      .object({
        /*
         * ⚠ Медиа принимает И локальный файл, И внешний URL.
         *
         * Было `z.string().url()` — то есть только внешняя ссылка. Это исходило
         * из предположения, что демо живёт на YouTube. Владелец кладёт видео на
         * тот же хостинг, что и сайт, и при старой схеме пришлось бы вписывать
         * в контент боевой домен: превью на localhost тянуло бы файл с прода, а
         * смена домена означала бы правку всех md-файлов.
         *
         * Относительный путь без «/» при этом ЗАПРЕЩЁН намеренно: `teaser.mp4`
         * резолвится от адреса страницы, а не от корня, и молча ломается. До
         * этой проверки `teaser` и `poster` не проверялись вовсе — опечатка
         * давала пустой фрейм на собранном сайте и зелёную сборку.
         */
        video: mediaRef.optional(),
        teaser: mediaRef.optional(),
        poster: mediaRef.optional(),
        /** Технический бриф — PDF с сайта, `/briefs/<slug>.pdf`. */
        brief: z
          .string()
          .regex(/^\/briefs\/[\w-]+\.pdf$/, {
            message: "бриф лежит файлом в public/briefs/: «/briefs/<slug>.pdf»",
          })
          .optional(),
        /*
         * ⚠ Ссылка на РЕПОЗИТОРИЙ, а не на профиль. До 2026-09-26 здесь стояло
         * `z.string().url()`, и четыре карточки из пяти вели «Code on GitHub» на
         * профиль: учебные репозитории 2024 года и клиентский код под NDA вместо
         * проекта, о котором карточка. Схема была зелёной — адрес-то валидный.
         */
        github: z
          .string()
          .regex(/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/, {
            message:
              "github — адрес репозитория (github.com/<owner>/<repo>), а не " +
              "профиля: посетитель должен попасть в код проекта",
          })
          .optional(),
      })
      .strict(),
    /** Секция Under contract — сквозной мотив сайта (design 3.1, 4.4). */
    contract: z.string().min(1),
    featured: z.boolean().default(false),
    order: z.number().int().nonnegative(),
    updated: z.coerce.date(),
    draft: z.boolean().default(false),
  })
  .refine((d) => d.draft || Object.values(d.proof).some(Boolean), {
    /* Требование — к опубликованной карточке: черновик может ждать пруфа, а
     заглушка ради схемы (ссылка на профиль) и была тем дефектом, что закрыт
     выше. */
    message:
      "у опубликованной карточки нужен хотя бы один proof: brief | github | video | teaser",
    path: ["proof"],
  });

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: projectSchema,
});

export const collections = { projects };
