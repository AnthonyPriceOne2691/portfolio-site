#!/usr/bin/env python3
"""Форма поставки: фаза, класс, обязательные артефакты фазы.

Часть `delivery_check.py` (`delivery@1.53`) — гейт разрезан по планке 300 строк
(§9.1a п.5), из 1969 строк 986 приходились на одну функцию `main`. Здесь первый
раздел: он же вычисляет то, что читают следующие, и отдаёт это `ActiveCtx` —
восемь значений, а не полсотни локальных переменных, как было внутри `main`.
"""

from __future__ import annotations

import re

from delivery_base import (ACTIVE, ActiveCtx, field,
                           is_placeholder, read)
from delivery_decisions import signature_verdict
from delivery_diff import diff_identifiers, diff_stats
from delivery_risk import risk_review_gaps, risky_classes
from delivery_runtime import (breaker_value, runtime_proof_gaps,
                              runtime_surfaces, runtime_touched)

def check_status_shape(status: str, args, errors: list[str], warnings: list[str]) -> ActiveCtx:
    """Фаза, класс и артефакты фазы. → контекст для остальных разделов."""
    allowed = {
        "specify",
        "plan",
        "tasks",
        "implement",
        "verify",
        "converge",
        "handoff",
    }
    implement_like = {"implement", "verify", "converge", "handoff"}

    raw_phase = field(status, "phase")
    raw_class = field(status, "class")

    phase_m = (
        re.match(r"(?i)^([a-z_]+)", raw_phase)
        if not is_placeholder(raw_phase)
        else None
    )
    class_m = (
        re.match(r"(?i)^([SML])\b", raw_class)
        if not is_placeholder(raw_class)
        else None
    )
    phase = phase_m.group(1).lower() if phase_m else ""
    klass = class_m.group(1).upper() if class_m else ""

    if is_placeholder(raw_phase):
        errors.append(
            f"STATUS.md: phase not filled in (template placeholder {raw_phase!r})"
        )
    elif not phase:
        errors.append("STATUS.md: missing phase")
    elif phase not in allowed:
        # constitution is project-level file, not active phase
        errors.append(
            f"STATUS.md: unknown phase '{phase}' "
            f"(allowed: {', '.join(sorted(allowed))})"
        )

    if not klass:
        msg = (
            f"STATUS.md: class not resolved (value {raw_class!r}) — "
            "cannot apply §2.2 artifact gates; write exactly one of S|M|L"
        )
        # На specify класс ещё может уточняться; с plan и дальше это блокер:
        # неизвестный класс = молча отключённые требования spec/plan.
        if phase == "specify":
            warnings.append(msg)
        else:
            errors.append(msg)

    spec = ACTIVE / "spec.md"
    plan = ACTIVE / "plan.md"
    tasks = ACTIVE / "tasks.md"
    verify = ACTIVE / "verify-report.md"
    eval_smoke = ACTIVE / "eval-smoke.md"

    if klass in {"M", "L"} and phase in {
        "plan",
        "tasks",
        *implement_like,
    }:
        if not spec.is_file():
            errors.append(f"class {klass} at phase={phase}: missing active/spec.md")

    if klass in {"M", "L"} and phase in implement_like:
        if not plan.is_file():
            errors.append(f"class {klass} at phase={phase}: missing active/plan.md")
        if not tasks.is_file():
            errors.append(f"class {klass} at phase={phase}: missing active/tasks.md")
        # §3.3 называет это stop-gate'ом — значит error, не warning.
        # `deferred` (§2.2b) — законный третий вариант: человека нет, работа
        # идёт под запись долга. Он пускает до converge включительно, но НЕ на
        # handoff: подпись под ожиданиями обязательна там, где человек всё
        # равно есть — на мерже. Без этого значения агент без доступного
        # человека занижал класс до S, обходя требование спеки законным с виду
        # способом (найдено независимым развёртыванием).
        e, w = signature_verdict("human_ok_spec", field(status, "human_ok_spec"), klass, phase)
        errors += e
        warnings += w

    if klass == "L" and phase in implement_like:
        # §2.2b распространяется на ВСЕ поля-подписи, а не только на спеку:
        # `human_ok_plan` упирался в тот же тупик, и агент без человека выбирал
        # между «встать» и «занизить класс» — дыра, закрытая один раз, вернулась
        # во втором поле. Развилка теперь одна на класс полей (см. функцию).
        e, w = signature_verdict("human_ok_plan", field(status, "human_ok_plan"), klass, phase)
        errors += e
        warnings += w

    if klass == "S" and phase in implement_like and not tasks.is_file():
        errors.append("class S at implement+: missing active/tasks.md (mini-spec)")

    if not verify.is_file():
        if phase == "verify":
            # Фаза в процессе: отчёт ещё пишется — но выйти из неё без него нельзя.
            warnings.append(
                "phase=verify: active/verify-report.md not created yet"
            )
        elif phase in {"converge", "handoff"}:
            errors.append(
                f"phase={phase}: missing active/verify-report.md (DoD §3.2.2)"
            )

    if klass in {"M", "L"} and phase in {"verify", "converge", "handoff"}:
        if not eval_smoke.is_file():
            errors.append(
                "class M/L at verify+: missing active/eval-smoke.md "
                "(product oracles are mandatory, §6.2)"
            )

    # --- §12.5: маячок на рисковый дифф. Предупреждение на verify, ОТКАЗ на
    # handoff — та же лестница, что у `deferred` (§2.2b): работать не мешаем,
    # объявить сделанным не даём. Блокировать на каждом коммите нельзя: правка
    # опечатки получала бы требование ревью, и маячок сняли бы через неделю.
    if phase in {"verify", "converge", "handoff"}:
        rbase = args.diff_base or "HEAD~1"
        rstats = diff_stats(rbase)
        if rstats and rstats[4]:
            gaps = risk_review_gaps(
                read(verify),
                risky_classes(rstats[4], rbase),
                diff_identifiers(rstats[4]),
            )
            for g in gaps:
                (errors if phase == "handoff" else warnings).append(
                    f"рисковый дифф: {g}"
                )

            # --- §12.6: путь, проверяемый только исполнением. Та же лестница
            # (предупреждение на verify, отказ на handoff) и по той же причине.
            surfaces, declared = runtime_surfaces(status)
            if not declared:
                (errors if phase == "handoff" else warnings).append(
                    "нет строки `runtime_paths:` в STATUS (§12.6) — назови "
                    "пути, чей отказ не виден ни сборке, ни тестам (экран, "
                    "права, железо, тракт съёмки), либо `none reason=…`. "
                    "Молчание тут читается как «таких нет», а замер поля дал "
                    "четыре падения подряд ровно в них"
                )
            else:
                touched = runtime_touched(rstats[4], surfaces)
                for g in runtime_proof_gaps(read(verify), touched):
                    (errors if phase == "handoff" else warnings).append(
                        f"исполнение: {g}"
                    )
                # Breaker по ПОВЕРХНОСТЯМ, а не по объёму. §3.4 считает файлы
                # и строки, и три правки в три подсистемы на десяток строк
                # проходят его не заметив — а именно так и выглядел составной
                # отказ, который потом разбирали перебором.
                cap = breaker_value(status, "max_runtime_paths")
                if len(touched) > cap:
                    (errors if phase == "handoff" else warnings).append(
                        f"исполнение: одной поставкой задето {len(touched)} "
                        f"рисковых путей ({', '.join(sorted(touched))}) при "
                        f"пороге {cap} (§12.6) — ставь по одному: составной "
                        "отказ разбирается перебором, а перебор оплачивает "
                        "человек. Осознанно — строкой "
                        "`max_runtime_paths=<N> reason=… by=human:…` в STATUS"
                    )


    return ActiveCtx(phase=phase, klass=klass, spec=spec, plan=plan, tasks=tasks, verify=verify, eval_smoke=eval_smoke, implement_like=implement_like)
