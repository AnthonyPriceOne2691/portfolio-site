# Active delivery status

- **slug:** contour-bootstrap
- **stack:** delivery@1.49, cqg@1.65, okf@absent
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
- **blockers:** реестр npm недоступен (три попытки, exit=124) — без установки не
  проверены примеры A1–A3 и не гонялись фронтовые гейты. Два варианта с ценой —
  `active/escalation.md`
- **waivers:** none
- **new_dependency:** none
  <!-- Появятся вместе с каркасом Astro: каждая прямая зависимость получит свою
       строку с reason= и by=. На витрине это защита от превращения её в приложение. -->
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
