/**
 * Словарь UI-строк и правила языка (design v0.8 §7.3).
 *
 * ⚠ RU — язык по умолчанию и живёт в КОРНЕ, EN под `/en`. Сменилось 07.08;
 * прежде было наоборот. Умолчание выражено структурой URL, а не редиректом:
 * редирект по локали браузера отвергнут, потому что одна ссылка открывалась бы
 * у разных людей по-разному.
 *
 * Функции ниже — чистые, и это сделано нарочно: они единственная часть
 * навигации, которую можно накрыть тестом без браузера (см.
 * `tests/i18n.test.mjs`, пример B5).
 */
export const LOCALES = ["ru", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ru";

export const ui = {
  ru: {
    "about.title": "Обо мне",
    "about.description":
      "Инженер AI-автоматизации: production SaaS и локальные AI-агенты.",
    "about.body":
      "Fullstack-инженер AI-автоматизации. В одиночку построил и вывел в прод SaaS для аутрича — 6 500+ тестов, около 30 сервисов. Параллельно делаю полностью локальные AI-системы: голосовой интервьюер, веб-research-агент, AR-примерочную.",
    "about.how":
      "Design-first: версионируемые дизайн-документы и замер до продакшн-кода. Cursor и Claude — инструменты сборки; архитектура, безопасность и финальное ревью остаются за человеком.",
    "about.cv": "Запросить резюме",
    "about.cvSubject": "Запрос резюме",
    "home.title": "Антон Аспидов — инженер AI-автоматизации",
    "home.description":
      "Production AI SaaS и полностью локальные голосовые, веб- и AR-агенты. Ставлю LLM под контракт.",
    "home.role": "AI Automation / LLM Application Engineer",
    "home.pitch":
      "Ставлю LLM под контракт: production SaaS, рассчитанный на работу одного оператора, и полностью локальные агенты — голос, веб, AR.",
    "home.status": "🟢 Открыт к удалённой работе и контракту · UTC+3",
    "nav.projects": "Проекты",
    "nav.about": "Обо мне",
    "nav.contact": "Связаться",
    "nav.cv": "Резюме",
    "nav.menu": "Меню",
    "nav.close": "Закрыть меню",
    "nav.skip": "К основному содержанию",
    "nav.home": "На главную",
    "projects.title": "Проекты",
    "projects.all": "Все проекты",
    "project.next": "Следующий проект",
    "project.contract": "Под контрактом",
    "project.stack": "Стек",
    "project.updated": "Обновлено",
    "project.proof": "Доказательства",
    "project.video": "Смотреть демо",
    "proof.github": "Код на GitHub",
    "proof.case": "Разбор кейса",
    "status.production": "В проде",
    "status.local-demo": "Локальное демо",
    "status.poc": "Прототип",
    "404.title": "Страница не найдена",
    "404.back": "Вернуться на главную",
    "lang.switch": "Switch to English",
  },
  en: {
    "about.title": "About",
    "about.description":
      "AI automation engineer: production SaaS and local AI agents.",
    "about.body":
      "Fullstack AI automation engineer. Sole builder of a production outreach SaaS — 6,500+ tests, ~30 services. Alongside it I ship fully-local AI systems: a voice interview coach, a web research agent, an AR try-on.",
    "about.how":
      "Design-first: versioned design docs and a benchmark before production code. Cursor and Claude are build tools; architecture, security and the final review stay human.",
    "about.cv": "Request my CV",
    "about.cvSubject": "CV request",
    "home.title": "Anton Aspidov — AI Automation Engineer",
    "home.description":
      "Production AI SaaS plus fully-local voice, web and AR agents. LLMs under contract.",
    "home.role": "AI Automation / LLM Application Engineer",
    "home.pitch":
      "I put LLMs under contract: a production SaaS built to run with a single operator, and fully-local agents that listen, browse and see.",
    "home.status": "🟢 Open to remote / contract · UTC+3",
    "nav.projects": "Projects",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.cv": "CV",
    "nav.menu": "Menu",
    "nav.close": "Close menu",
    "nav.skip": "Skip to main content",
    "nav.home": "Home",
    "projects.title": "Projects",
    "projects.all": "All projects",
    "project.next": "Next project",
    "project.contract": "Under contract",
    "project.stack": "Stack",
    "project.updated": "Updated",
    "project.proof": "Proof",
    "project.video": "Watch demo",
    "proof.github": "Code on GitHub",
    "proof.case": "Read the case",
    "status.production": "Production",
    "status.local-demo": "Local demo",
    "status.poc": "PoC",
    "404.title": "Page not found",
    "404.back": "Back to home",
    "lang.switch": "Открыть по-русски",
  },
} as const;

export type UIKey = keyof (typeof ui)["ru"];

/** Переводчик для языка страницы. Ключ без перевода — ошибка сборки, не пустота. */
export function useTranslations(locale: Locale) {
  return (key: UIKey): string => ui[locale][key];
}

/** Язык из пути: `/en/...` -> en, всё остальное -> ru (RU в корне). */
export function localeFromPath(pathname: string): Locale {
  return /^\/en(\/|$)/.test(pathname) ? "en" : "ru";
}

/**
 * Путь той же страницы на другом языке.
 *
 * Это сердце переключателя, и здесь легко ошибиться: наивная реализация
 * отправляет с внутренней страницы на корень другого языка, и пользователь
 * теряет место. Инвариант, который проверяет тест B5: смена языка меняет
 * ТОЛЬКО префикс, «хвост» пути сохраняется, а двойное переключение
 * возвращает исходный путь.
 */
export function pathForLocale(pathname: string, target: Locale): string {
  const tail = pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  const withSlash = tail.startsWith("/") ? tail : `/${tail}`;
  if (target === DEFAULT_LOCALE) return withSlash;
  return withSlash === "/" ? "/en/" : `/en${withSlash}`;
}

/** Ссылка внутри сайта с учётом языка: `link("/projects/", "en")` -> `/en/projects/`. */
export function link(path: string, locale: Locale): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return locale === DEFAULT_LOCALE ? clean : `/en${clean}`;
}
