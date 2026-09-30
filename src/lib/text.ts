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
    "AI automation engineer: AI services for agencies — MVP in a week, production in two.",
  "about.body":
    "I build AI services that take manual work off a team. My latest two, for an SEO agency, went from a bare spec to production in 8 and 14 days. My outreach platform let one operator do the work of a team of five. My research and voice agents run entirely on a laptop: no cloud AI, no data leaving the machine.",
  "about.how":
    "How one engineer ships at team speed: AI coding agents write the code inside a quality contour I designed — 22 automatic checks on every change, and the checks themselves are tested. Anything that costs money or can't be undone waits for a person. Architecture, contracts and the final review stay mine.",
  "about.cv": "Download CV",
  "about.cvHint": "Here",
  "home.title": "Anton Aspidov — AI Automation Engineer",
  "home.description":
    "AI automation for SEO and marketing agencies: MVP in a week, production in two, checked to senior-team standards. Outreach platforms, research agents, voice assistants.",
  "home.role": "AI Automation / LLM Application Engineer",
  "home.photoAlt": "Anton Aspidov",
  "home.introPlay": "Play the intro video (with sound)",
  "home.pitch":
    "MVP in a week, production in two. I build AI services that take manual work off your team — checked to the standards of a senior engineering team.",
  "home.status": "🟢 Open to projects and remote roles · UTC+3",
  "home.projectsHint":
    "Each card: the problem it solves and the result. Open a card for the demo and the engineering details.",
  "nav.projects": "Projects",
  "nav.about": "About",
  "nav.contact": "Contact",
  "nav.cv": "CV",
  "nav.cvHint": "my CV is here",
  "nav.skip": "Skip to main content",
  "nav.home": "Home",
  "theme.light": "Switch to light theme",
  "theme.dark": "Switch to dark theme",
  "projects.title": "Projects",
  "project.contract": "Built-in safeguard",
  "project.stack": "Stack",
  "project.updated": "Updated",
  "project.proof": "Proof",
  "project.video": "Watch demo",
  "proof.github": "Code on GitHub",
  "proof.brief": "Engineering details · PDF",
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
