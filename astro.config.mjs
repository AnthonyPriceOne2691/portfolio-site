// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// i18n с ПЕРВОГО коммита — решение design §7.3: ретрофит второго языка дороже,
// чем сразу развести маршруты.
//
// ⚠ 07.08 умолчание СМЕНИЛОСЬ: RU в корне, EN под `/en` (design v0.8 §7.3).
// Было наоборот. Причина — основная аудитория ссылок русскоязычная. Менялось
// это до появления страниц сознательно: после них правка означала бы переезд
// каждого URL, hreflang и sitemap разом.
//
// Редирект по локали браузера остаётся ОТВЕРГНУТЫМ: одна ссылка открывалась бы
// у разных людей по-разному, и шаринг в hh/LinkedIn перестал бы быть
// предсказуемым. Умолчание выражено структурой URL, а не логикой в рантайме.
export default defineConfig({
  site: 'https://example.pages.dev', // заменить на боевой домен перед Phase 2
  i18n: {
    defaultLocale: 'ru',
    locales: ['ru', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [sitemap()],
  build: {
    // Статика целиком: хостинг бесплатный, SSR не берём (design §8.1).
    format: 'directory',
  },
});
