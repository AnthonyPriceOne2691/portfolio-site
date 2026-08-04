// @ts-check
import { defineConfig } from 'astro/config';

// i18n с ПЕРВОГО коммита — решение design §7.3: ретрофит второго языка дороже,
// чем сразу развести маршруты. EN живёт в корне (`prefixDefaultLocale: false`),
// RU — под `/ru/*`, компоненты одни и те же.
export default defineConfig({
  site: 'https://example.pages.dev', // заменить на боевой домен перед Phase 2
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ru'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  build: {
    // Статика целиком: хостинг бесплатный, SSR не берём (design §8.1).
    format: 'directory',
  },
});
