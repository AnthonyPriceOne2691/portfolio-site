import { publishedProjects } from "./projects";

import type { Locale } from "../i18n/ui";

/**
 * Пути страниц проектов для одного языка.
 *
 * Вынесено из маршрутов, потому что маршрутов ДВА (RU и EN), а правило одно:
 * порядок по `order`, черновики скрыты, кольцо «Next» замкнуто. Скопируй эту
 * логику во второй маршрут — и однажды языки разойдутся порядком или кольцом,
 * причём молча: обе страницы соберутся зелёными, просто поведут в разные места.
 */
export async function projectPaths(locale: Locale) {
  const sorted = await publishedProjects(locale);

  return sorted.map((entry, i) => ({
    params: { slug: entry.id },
    props: { entry, next: sorted[(i + 1) % sorted.length], locale },
  }));
}
