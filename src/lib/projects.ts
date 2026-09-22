import { getCollection } from "astro:content";

/**
 * Опубликованные проекты, в порядке `order`.
 *
 * Вынесено после того, как DRY-гейт нашёл дубль: один и тот же запрос жил в
 * `Nav`, `Home` и в списке `/projects` — правило трёх сработало буквально.
 * Список с тех пор убран (витрина — это главная), но общее место осталось:
 * дубль опасен не объёмом, а расхождением — достаточно, чтобы в одном месте
 * забыли `draft`, и черновик всплывёт в меню, но не на странице — или
 * наоборот. Обе сборки при этом зелёные.
 */
export async function publishedProjects() {
  return (await getCollection("projects"))
    .filter((p) => !p.data.draft)
    .sort((a, b) => a.data.order - b.data.order);
}
