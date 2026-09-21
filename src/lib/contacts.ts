/**
 * Контакты — ОДНО место на весь сайт.
 *
 * Потребителей два, и они разного рода: подвал показывает контакты человеку, а
 * JSON-LD в `Base` отдаёт их машинам (`sameAs` и `email` у schema.org/Person).
 * Пока адреса лежали в двух файлах порознь, расхождение было вопросом времени:
 * поправить подвал и забыть разметку легко, а ЗАМЕТИТЬ нечем — сборка зелёная,
 * просто человеку показывается одно, а поисковику и превью-карточке другое.
 *
 * Именно так тут и было до 21.09: в подвале стоял `hello@example.com`, а
 * телеграм вёл на пустой `https://t.me/`.
 */
export const CONTACTS = {
  email: "anthonypriceone@gmail.com",
  telegram: {
    handle: "@AnthonyPriceOne",
    url: "https://t.me/AnthonyPriceOne",
  },
  linkedin: "https://www.linkedin.com/in/anton-aspidov/",
  github: "https://github.com/AnthonyPriceOne2691",
} as const;

/**
 * Профили для `sameAs`.
 *
 * ⚠ Почты здесь нет намеренно: `sameAs` по schema.org — это СТРАНИЦЫ, которые
 * представляют того же человека, а не способы связи. Адрес живёт в отдельном
 * поле `email`; положить его сюда значит соврать разметкой.
 */
export const PROFILES: readonly string[] = [
  CONTACTS.telegram.url,
  CONTACTS.linkedin,
  CONTACTS.github,
];
