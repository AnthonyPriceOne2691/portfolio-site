// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// ⚠ Блока `i18n` здесь больше нет: сайт одноязычный с 2026-09-22. Английский
// переехал из `/en/` в корень, русская версия снята целиком. Старые адреса не
// умерли — `public/_redirects` отдаёт с `/en/*` постоянный редирект на корень:
// ссылки вида `/en/` уже разошлись по резюме и профилям, и 404 на них был бы
// потерей ровно тех переходов, ради которых сайт существует.
export default defineConfig({
  // ⚠ Боевой адрес, а не косметика. Отсюда строятся canonical,
  // og:url и весь sitemap — то есть превью ссылки в Telegram, hh и LinkedIn.
  // Пока здесь стояла заглушка `example.pages.dev`, развёрнутый сайт отдавал
  // превью, ссылающееся в чужой домен. Появится свой домен — менять здесь,
  // одной строкой, и пересобрать.
  site: "https://portfolio-site.anthony-priceone.workers.dev",
  integrations: [sitemap()],
  build: {
    // Статика целиком: хостинг бесплатный, SSR не берём (design §8.1).
    format: "directory",
  },
});
