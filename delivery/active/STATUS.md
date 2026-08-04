# Active delivery status

- **slug:** contour-bootstrap
- **stack:** delivery@1.49, cqg@1.66, okf@absent
- **class:** M
- **kind:** bootstrap
- **repro_test:** n/a reason=не bugfix, продуктового кода ещё нет
- **diagnosis:** n/a reason=не bugfix
- **phase:** implement
- **builder:** agent:claude-code
- **verifier:** human:anthony
- **human_ok_spec:** yes (by=human:anthony, at=2026-08-04)
- **human_ok_examples:** A1, A2, A3, A4, A5, A6, A7
- **human_ok_plan:** n/a
- **shape-oracles:** weak
  <!-- станет cqg-deployed после шага CQG: гейты развёрнуты И инструменты стоят -->
- **behavior-oracles:** weak
  <!-- продуктового кода нет; станет tests-present вместе с первой поставкой MVP -->
- **ci-oracles:** weak
  <!-- workflow ещё не развёрнут; по §10.4 значение ставится по ФАКТУ зелёного
       прогона, а не по факту наличия файла. Пункт backlog: развернуть CI (CQG §8). -->
- **worktree:** none (bootstrap трогает дерево контура целиком, §7.2 шаг 6)
- **hooks:** not-deployed
- **blockers:** none (снят 2026-08-04: диагноз был неверен — не «реестр
  недоступен», а деградация канала под 15 параллельными сокетами npm; лечится
  `maxsockets=2` в `.npmrc`, разбор с числами — `active/escalation.md`)
- **waivers:** none
- **new_dependency:** astro reason=генератор статики, решение design §8.1 (минимум JS на выходе, markdown-контент из коробки); альтернатива Next.js отклонена там же as «не брать на MVP» by=agent:claude-code
- **new_dependency:** @astrojs/check reason=проверка типов TS и .astro в `npm run build`; на этом стеке занимает роль mypy, которого в карте ролей нет by=agent:claude-code
- **new_dependency:** typescript reason=peer-зависимость @astrojs/check, без неё проверка типов не запускается by=agent:claude-code
- **new_dependency:** eslint reason=инструмент TS-половины гейта сложности (CQG §3, cqg@1.66); пороги навязывает гейт флагом --rule, конфиг проекта даёт только парсер by=agent:claude-code
- **new_dependency:** typescript-eslint reason=парсер TS для eslint; без него espree печатает «Parsing error» и гейт краснеет на всех файлах, не проверив ни одного by=agent:claude-code
- **new_dependency:** dependency-cruiser reason=инструмент роли «направление зависимостей» на TS (CQG §3.6); замена import-linter, которого на этом стеке нет by=agent:claude-code
  <!-- 219 пакетов в node_modules — транзитивные, они решением не являются (§3
       new-dependency: объявляются только ПРЯМЫЕ). -->
- **canon_drift_waiver:** no
- **baseline_growth_waiver:** no
- **observability:** 1
- **observe_signal:** contour_doctor.py даёт DEAD=0 на этом репозитории; `pre-commit
  run --all-files` при чистом env печатает непустое число просмотренных файлов у
  каждого гейта формы
- **observe_until:** 2026-08-18
- **circuit_breakers:** exempt (kind: bootstrap, §3.4 — развёртывание трогает всё
  дерево контура и не режется на части)

## Что это

Первое развёртывание контура на **greenfield** и **первое на не-Python стеке**
(Astro/TypeScript, статика). Два следствия, которых не было на `voice-coach`:

1. **Снимки стартуют с жёсткого нуля** — легаси нет, ратчеты держат чистое
   состояние с первого коммита. Это самый дешёвый момент для постановки гейтов.
2. **Карта ролей §Применимость проверяется в поле впервые.** Часть механики
   канона к TS-стеку не приложится (mypy, import-linter, ратчет сложности на
   ruff, python-половина deps-audit, мутационный гейт на mutmut). Канон требует
   такие области **назвать**, а не тихо пропустить — разбор в
   `delivery/STACK-ACCEPTANCE.md`.

Продукт описан в `PORTFOLIO_SITE_DESIGN.md` v0.7 (вне репозитория, §8.3 того же
документа). Эта поставка — только контур; MVP сайта идёт следующей.
