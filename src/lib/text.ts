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
    "AI Delivery Lead: I lead a team of AI coding agents and the system that checks their work. MVP in a week, production in two.",
  "about.body":
    "I take AI services from an idea or a bare spec all the way to production. My latest two, for an SEO agency, went live in 8 and 14 days. Over four weeks they grew to 180,000+ lines of code and tests, 5,800+ automated tests and 280+ merged pull requests. My outreach platform let one operator do the work of a team of five. My research and voice agents run entirely on a laptop: no cloud AI, no data leaving the machine.",
  "about.how":
    "My role: AI coding agents write the code, and I lead them the way a tech lead runs a team. I write the spec, set the architecture and accept the result. That is how one person ships at the speed of a team.",
  "about.question":
    "How do I know the code is right if I don't write it by hand?",
  "about.answer":
    "I don't take an agent's word for it. Every change has to pass 22 automatic checks: tests, code quality, architecture and security. The checks are tested too: a known mistake is planted in front of each one, and a check that stays silent counts as broken. Nothing merges while a check is red, and anything that costs money or can't be undone waits for a person.",
  "about.cv": "Download CV",
  "about.cvHint": "Here",
  "home.title": "Anton Aspidov · AI Delivery Lead",
  "home.description":
    "AI Delivery Lead: MVP in a week, production in two. AI coding agents write the code, and 22 automatic checks on every change hold it to a senior team's standard.",
  "home.role": "AI Delivery Lead · AI automation and LLM apps",
  "home.photoAlt": "Anton Aspidov",
  "home.introPlay": "Play the intro video (with sound)",
  "home.pitch":
    "MVP in a week, production in two. I lead a team of AI coding agents and the system that checks every change they make. For my latest two services, that was 180,000+ lines of code and tests in four weeks.",
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
  "demo.dialog": "Project demo video",
  "demo.close": "Close video",
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
