import { getCollection } from "astro:content";

import type { Locale } from "../i18n/ui";

/**
 * Опубликованные проекты языка, в порядке `order`.
 *
 * Вынесено после того, как DRY-гейт нашёл дубль: один и тот же запрос жил в
 * `Nav`, `Home` и `ProjectsIndex` — правило трёх сработало буквально. Дубль
 * здесь опасен не объёмом, а расхождением: достаточно, чтобы в одном месте
 * забыли `draft`, и черновик всплывёт в меню, но не на странице — или
 * наоборот. Обе сборки при этом зелёные.
 */
export async function publishedProjects(locale: Locale) {
  return (await getCollection(locale))
    .filter((p) => !p.data.draft)
    .sort((a, b) => a.data.order - b.data.order);
}
