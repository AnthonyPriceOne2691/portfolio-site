# Active delivery status

- **slug:** mvp-shell-home
- **stack:** delivery@1.50, cqg@1.79, okf@absent
- **class:** M
- **kind:** feature
- **repro_test:** n/a reason=не bugfix, новая функциональность
- **diagnosis:** n/a reason=не bugfix
- **phase:** specify
- **builder:** agent:claude-code
- **verifier:** process:ci
- **human_ok_spec:** no
- **human_ok_examples:** none
- **human_ok_plan:** n/a (class M)
- **shape-oracles:** cqg-deployed
- **behavior-oracles:** weak
  <!-- тестов всё ещё нет. Первый предмет для них появляется ЗДЕСЬ: словарь
       UI-строк и выбор языка — чистые функции, их можно накрыть свойством
       (§6.5 просит реляционный оракул). Задача T9. -->
- **ci-oracles:** deployed (github-actions)
- **worktree:** none (ветка `mvp/shell-home`, дерево контура не трогается)
- **hooks:** not-deployed
- **stack-selftest:** ci (vendored)
- **blockers:** none
- **waivers:** none
- **new_dependency:** none (пока; `@astrojs/sitemap` — кандидат, решение в T7)
- **runtime_paths:** src/
  <!-- §12.6, и здесь это несущая строка: раскладку и вёрстку не проверяет НИЧТО
       из развёрнутых гейтов — сборка зелёная, а вёрстка может уехать. Весь
       `src/` объявлен одной поверхностью сознательно: разбивать её на
       `pages/`+`components/`+`styles/` значило бы притвориться, будто это
       независимые поверхности, тогда как ломаются они вместе. -->
- **canon_drift_waiver:** no
- **baseline_growth_waiver:** no
- **observability:** 1
- **observe_signal:** `npm run build` зелёный и `dist/` содержит обе языковые
  ветки; ручной проход пути рекрутёра (§4.2 дизайна) на мобильной ширине без
  горизонтального скролла
- **observe_until:** 2026-08-21
- **circuit_breakers:** default (25 файлов / 800 строк / 1 runtime-path)

## Что это

Первый слайс MVP витрины. Дизайн-документ `PORTFOLIO_SITE_DESIGN.md` v0.7 —
источник правды по содержанию (лежит вне репозитория, §8.3 того же документа).

Слайс отвечает на вопрос «витрина открывается и по ней можно ходить»: каркас
представления, Home по §4.2 и страницы проектов в структурном объёме. Полные
тексты кейса, медиа (тизеры, постеры, скриншоты), About и деплой — следующие
слайсы, перечислены в `plan.md`.

**Почему слайсами, а не целиком:** Phase 1 дизайна (Home + 4 страницы проектов +
About + деплой) не проходит circuit breaker §3.4 — только контент это 8 md-файлов,
плюс компоненты и стили. Разрезано по поверхностям, каждый слайс сам по себе
показуем.
