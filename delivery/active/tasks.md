# Tasks

- [ ] T0. **Подпись человека под спекой и примерами B1–B8** (§3.3 stop-gate) —
      до кода. Четыре открытых вопроса закрыты 07.08, решения в `decisions.md`:
      `6,500+`, смягчённое «5 → 1», CV не в этом слайсе, sitemap берём
- [ ] T1. `.astro` под линтер и форматтер: `eslint-plugin-astro` +
      `prettier-plugin-astro`, маски хуков. Долг прошлой поставки, назван в её
      verify-report; на каркасе цена нулевая, после Home — уже нет
- [ ] T2. Оракул языковых пар в `content.config.ts`: нет RU-пары у slug →
      сборка падает с именем slug (B4)
- [ ] T3. `src/styles/global.css` — токены §7.1.2, focus-стейты,
      `prefers-reduced-motion`; контраст акцента проверить числом
- [ ] T4. `src/layouts/Base.astro` — head, meta/OG §8.5, hreflang, JSON-LD
      `Person`, skip-link (B8)
- [ ] T5. `Nav.astro`, `Footer.astro`, переключатель EN/RU, `404.astro` (B5)
- [ ] T6. Контент: 4 проекта × EN + RU по §5.1–5.4 и схеме §8.2.1
- [ ] T7. `[slug].astro` по скелету §4.4 + `/projects` + кольцо «Next →»;
      слоты медиа деградируют (B2, B3). Решение по `@astrojs/sitemap` — строкой
      `new_dependency:` в STATUS, если берём
- [ ] T8. Home по §4.2: hero + contract-gate + impact strip + featured +
      3 карточки + How I work + Contact
- [ ] T9. Первые тесты: словарь UI-строк и резолвер языка, реляционный оракул
      §6.5 (для любой страницы и языка переключатель даёт существующий путь)
- [ ] T10. Доступность и адаптив: клавиатура, reduced-motion, 360 px (B6, B7)
- [ ] T11. Бюджет: каркас < 300 KB, LCP < 1.5 s — замерить на голой вёрстке
- [ ] T12. Verify: `eval-smoke.md` по B1–B8, зелёный CI, мерж через
      `merge_guard.sh`
- [ ] T13. **Долг принципа 5:** обновить `4,200+` → `6,500+` в
      `ANTON_ASPIDOV_CV_EN.md` и `PORTFOLIO_LINKBUILDER_CASE.md`. Пока не
      сделано, цифра живёт в трёх местах и расходится. Файлы вне репозитория —
      правку выполняет человек, задача остаётся открытой до подтверждения
