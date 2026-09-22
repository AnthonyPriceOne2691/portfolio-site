/**
 * Строки интерфейса. Один язык — английский.
 *
 * ⚠ До 2026-09-22 здесь жила двуязычная механика: словарь на два языка, RU в
 * корне и EN под `/en`, переключатель в шапке, hreflang-пары, зеркальные
 * коллекции контента. Владелец решил оставить только английский, и язык
 * ВЫРЕЗАН, а не свёрнут до одного значения: `locale` не ходит больше ни через
 * один компонент. Слой, который ничего не выбирает, — это не «задел на
 * будущее», а лишний параметр в каждой сигнатуре, который со временем
 * перестают понимать. Вернуть второй язык — откатить тот коммит, где это
 * снято; история цела и переезд обратно дешевле, чем носить мёртвый слой.
 *
 * Текст лежит ЗДЕСЬ, а не в разметке: ключ без значения — ошибка типов, то
 * есть ошибка сборки, а не тихая пустота на странице.
 */
export const text = {
  "about.title": "About",
  "about.description":
    "AI automation engineer: production SaaS and local AI agents.",
  "about.body":
    "Fullstack AI automation engineer. Sole builder of a production outreach SaaS — 6,500+ tests, ~30 services. Alongside it I ship fully-local AI systems: a voice interview coach, a web research agent, an AR try-on.",
  "about.how":
    "Design-first: versioned design docs and a benchmark before production code. Cursor and Claude are build tools; architecture, security and the final review stay human.",
  "about.cv": "Download CV",
  "home.title": "Anton Aspidov — AI Automation Engineer",
  "home.description":
    "Production AI SaaS plus fully-local voice, web and AR agents. LLMs under contract.",
  "home.role": "AI Automation / LLM Application Engineer",
  "home.photoAlt": "Anton Aspidov",
  "home.introPlay": "Play the intro video (with sound)",
  "home.pitch":
    "I put LLMs under contract: a production SaaS built to run with a single operator, and fully-local agents that listen, browse and see.",
  "home.status": "🟢 Open to remote / contract · UTC+3",
  "home.projectsHint":
    "Open any card to see the full case, proof links and implementation details.",
  "nav.projects": "Projects",
  "nav.about": "About",
  "nav.contact": "Contact",
  "nav.cv": "CV",
  "nav.skip": "Skip to main content",
  "nav.home": "Home",
  "theme.light": "Switch to light theme",
  "theme.dark": "Switch to dark theme",
  "projects.title": "Projects",
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
} as const;

export type TextKey = keyof typeof text;

/** Строка по ключу. Опечатка в ключе не доживает до страницы: её ловит tsc. */
export function t(key: TextKey): string {
  return text[key];
}
