#!/usr/bin/env python3
"""Диагностика РАЗВЁРНУТОГО контура: что здесь работает, что бедно, что мертво.

Зачем отдельный инструмент, когда есть мета-гейт. `check_gate_coverage.sh`
отвечает «вписан ли гейт в конфиг» — это текст. Между «вписан» и «судит» лежит
целый класс отказов, и он не гипотетический: за одну сессию 2026-08-03 нашлось
пять случаев, все замерены. Мутационный гейт не судил на дефолтной раскладке
(ключи мутантов не совпадали с путями импорта). Сканер незаполненных шаблонов был
мёртв под `LC_ALL=C` — GNU grep ругался на кириллический диапазон и не находил
ничего. `new-dependency` был CI-only на проекте без раннера, то есть не исполнялся
ни разу за поставку. `deps-audit` на отсутствующем инструменте выходит нулём, и
сводка pre-commit печатает `Passed`. Сам CI был красным восемь пушей подряд, пока
локально было зелено.

Ни один из этих отказов не виден ни мета-гейту (он смотрит конфиг), ни сьюту
(он про канон, а не про этот проект), ни `check_gate_value.sh` (ему нужна история
срабатываний из живого CI).

**Принцип: пробовать ИСПОЛНЕНИЕМ, а не чтением.** Каждому гейту подсовывается его
собственная канарейка — файл с заведомым нарушением ровно того класса, который
гейт стережёт, — и проверяется, что гейт краснеет. Гейт, промолчавший на своей
канарейке, объявляется **DEAD**: это не бедность, это ложь, и только она роняет
доктора. Отсутствие инструмента (`ABSENT`) и мягкий пропуск с названной причиной
(`WEAK`) — честная непокрытость, exit 0.

Это ИНСТРУМЕНТ, не гейт: слот бюджета §9.1a он не занимает (как
`check_gate_value.sh` и `assert_digest.sh`) и в pre-commit не вписывается.

Запуск из корня проекта с развёрнутым контуром:

    python3 scripts/lint/contour_doctor.py            # таблица + вердикт
    python3 scripts/lint/contour_doctor.py --json     # машинно-читаемо
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

# --- вердикты ----------------------------------------------------------------
AUTO = "AUTO"      # проверено исполнением: канарейка покраснела
WEAK = "WEAK"      # работает, но не судит; причина названа самим гейтом
DEAD = "DEAD"      # объявлен и вписан — и молчит на своей канарейке. Только это ложь
ABSENT = "ABSENT"  # не развёрнут
SKIP = "SKIP"      # доктор не умеет это пробовать — назвать, а не умолчать
TOOL = "TOOL"      # это не гейт, а измерительный инструмент: судить его нечем

ORDER = {DEAD: 0, SKIP: 1, WEAK: 2, ABSENT: 3, TOOL: 4, AUTO: 5}
COLOR = {AUTO: "\033[32m", WEAK: "\033[33m", DEAD: "\033[31m",
         ABSENT: "\033[90m", SKIP: "\033[36m", TOOL: "\033[90m"}
RESET = "\033[0m"

CANONS = ("AGENT_STACK.md", "AGENT_DELIVERY_HARNESS.md",
          "CODE_QUALITY_GATES.md", "OKF_KNOWLEDGE_BUNDLE.md")

# Инструменты, на которых стоят гейты. `timeout` отдельно: он GNU coreutils и на
# macOS отсутствует по умолчанию — без него мутационный гейт пропускается.
TOOLS = {
    "ruff": "гейт сложности, основной линт",
    "mypy": "типы",
    # `pragma` — не украшение и не подавление находки. Имя инструмента содержит
    # слово из denylist'а его же KeywordDetector'а, а дальше по строке идут
    # двоеточие и значение в кавычках — та самая форма, которую он считает
    # секретом. Первое развёртывание намерило это находкой: канон поставлял
    # payload, который метит его же гейт. Форма подавления взята у самого
    # инструмента, чтобы след был читаемым, а не спрятанным в baseline проекта.
    # Регрессия — `tests/test_payload_clean_for_scanners.py`.
    "detect-secrets": "secrets-гейт (§2.7)",  # pragma: allowlist secret
    "pip-audit": "deps-audit, python-половина",
    "mutmut": "mutation — «тесты утверждают» (§3.7)",
    "jscpd": "DRY-гейт",
    "npm": "deps-audit, js-половина; eslint-ратчет",
    "timeout": "бюджет мутационного гейта (macOS: brew install coreutils)",
}

# Канарейка = «файл с нарушением ровно этого класса». Ключ — имя правила из
# `--list-rules`, чтобы список правил брался у СКРИПТА, а не дублировался здесь:
# правило, для которого канарейки нет, попадает в SKIP по имени, а не пропадает.
CANARIES: dict[str, tuple[str, str]] = {
    # grep-правила
    "config-access": ("canary.py", "import os\nX = os.getenv('SECRET')\n"),
    "di-indirection": ("canary.py", "from importlib import import_module\n"
                                    "m = import_module('pkg.sub')\n"),
    "service-no-web": ("service.py", "from fastapi import APIRouter\nr = APIRouter()\n"),
    "no-grab-bag-module": ("utils.py", "def helper():\n    return 1\n"),
    "blind-error": ("canary.py", 'def f():\n    raise Exception("bad")\n'),
    "unstructured-log": ("canary.py", "import logging\n"
                                      "logger = logging.getLogger(__name__)\n"
                                      "def f(url):\n"
                                      '    logger.info(f"fetch {url}")\n'),
    # ast-правила
    "silent-except": ("canary.py", "def f():\n    try:\n        pass\n"
                                   "    except Exception:\n        pass\n"),
    "inline-prompt": ("canary.py", 'P = """ты — помощник\n' + "строка\n" * 8 + '"""\n'),
    "cpu-in-async": ("canary.py", "import json\n"
                                  "async def f(rows):\n"
                                  "    for r in rows:\n"
                                  "        json.loads(r)\n"),
    # Односложные гейты: ключ — имя скрипта, у них нет `--list-rules`.
    "check_file_length.sh": ("huge.py", "x = 1\n" * 700),
    "check_complexity_gate.sh": ("complex.py",
        "def f(a):\n" + "".join(f"    if a == {i}:\n        return {i}\n"
                                for i in range(14))),
    "unbounded-list": ("canary.py", "from fastapi import APIRouter\n"
                                    "router = APIRouter()\n\n\n"
                                    '@router.get("/all")\n'
                                    "async def all_items() -> list[dict]:\n"
                                    "    return await repo.everything()\n"),
}


# Не гейты: измерительные инструменты и сам доктор. Канарейку им подсовывать
# бессмысленно — они ничего не запрещают. Раньше они попадали в SKIP и раздували
# «непробовано», то есть доктор преувеличивал свою слепоту.
NOT_GATES = {"check_gate_value.sh", "assert_digest.sh", "contour_doctor.py"}

# Гейты, стоящие на внешнем инструменте. Прямая канарейка требует самого
# инструмента (сеть, npm, venv), поэтому пробуется ДРУГОЕ свойство, и оно важнее:
# **честность пропуска**. Отсутствие инструмента гейт обязан НАЗВАТЬ и не выдать за
# успех. Это не теория: класс ловился трижды — `timeout` на macOS (F14), голый
# `command -v` у secrets-хука (F10), `deps_audit_waiver: no` как разрешение.
TOOL_DEPENDENT = {
    "check_jscpd_gate.sh": "jscpd",
    "check_deps_audit.sh": "pip-audit / npm",
    "check_mutation_gate.sh": "mutmut",
    "check_eslint_warnings.sh": "eslint / npm",
    "check_diff_coverage.sh": "pytest-cov",
    "check_ci_status.sh": "gh",
    "check_complexity_gate.sh": "ruff",
    "check_layers_gate.sh": "lint-imports / depcruise",
}

# `PATH` без homebrew и venv: coreutils и git на месте, а jscpd/mutmut/gh/ruff —
# нет. Та же раскладка, что в сьюте канона (`tests/`), и она не выдумана: гейты
# ищут инструмент через `command -v`, а живут эти инструменты вне /usr/bin.
BARE_PATH = "/usr/bin:/bin"

# Гейты, которых канон НЕ поставляет, — свои у проекта (`check_canon_vendor.sh` в
# первом настоящем развёртывании, находка 7). Канарейку для них доктор выдумать не
# может: класс нарушения знает только автор гейта. Но проект может её ОБЪЯВИТЬ —
# файлом ниже, — и тогда чужой гейт проверяется исполнением, как свои. Без этого
# «свой гейт» навсегда оставался SKIP, то есть областью, где ЛОЖЬ невидима, а
# именно чужие гейты никто больше и не проверяет.
#
# Формат — {имя скрипта: {"path": путь от корня репо, "content": текст}}:
#   {"check_canon_vendor.sh": {"path": "docs/canon/AGENT_STACK.md",
#                              "content": "подменённая копия канона\n"}}
OWN_CANARIES = "scripts/lint/canaries.json"

# Слова, которыми гейт называет пропуск. Если пропуск назван — это WEAK (бедность),
# если гейт при этом заявляет успех — DEAD (ложь).
SKIP_WORDS = ("пропущен", "не судит", "не проверен", "нет каталога", "ПРОПУЩЕНА",
              "WARNING", "не найден", "недоступен", "не смог")
SUCCESS_WORDS = (": OK", "OK —", "OK -")


def _block_after(text: str, marker: str, lang: str) -> str | None:
    """Первый блок ```lang после marker — с учётом ВЛОЖЕННЫХ фенсов.

    Наивная регулярка обрывается на первом же вложенном фенсе (шаблоны канона их
    содержат), и сравнение тел давало бы вечное «разошлось». Тот же построчный
    сканер, что blocks() в stack_selftest и block_after в сьюте канона.
    """
    if marker not in text:
        return None
    out, depth, started = [], 0, False
    for line in text.split(marker, 1)[1].splitlines():
        if line.startswith("```"):
            info = line[3:].strip().lower()
            if not started:
                if info == lang:
                    started, depth = True, 1
                continue
            if info:
                depth += 1
            else:
                depth -= 1
                if depth == 0:
                    return "\n".join(out)
            out.append(line)
            continue
        if started:
            out.append(line)
    return None


def run(cmd: list[str], cwd: Path, env: dict | None = None) -> tuple[int, str]:
    e = {**os.environ, **(env or {})}
    try:
        p = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True,
                           timeout=180, env=e)
    except (subprocess.TimeoutExpired, OSError) as exc:
        return 124, f"{exc}"
    return p.returncode, (p.stdout or "") + (p.stderr or "")


def _setup_gate_coverage(lab: Path) -> tuple[list[str], dict]:
    """Скрипт лежит в `scripts/lint`, но в конфиге его нет → мета-гейт краснеет.

    Именно этот случай и породил мета-гейт: jscpd был извлечён, адаптирован и не
    вписан, а приёмка показала 7/7 зелёных.
    """
    (lab / ".pre-commit-config.yaml").write_text(
        "repos:\n  - repo: local\n    hooks:\n      - id: nothing\n"
        "        name: ничего не подключает\n        entry: true\n"
        "        language: system\n", encoding="utf-8")
    (lab / "scripts" / "lint" / "check_orphan_gate.sh").write_text(
        "#!/usr/bin/env bash\nexit 0\n", encoding="utf-8")
    return [], {}


def _setup_new_dependency(lab: Path) -> tuple[list[str], dict]:
    """Пакет добавлен в манифест и НЕ объявлен в STATUS → гейт краснеет."""
    (lab / "backend").mkdir(exist_ok=True)
    man = lab / "backend" / "pyproject.toml"
    man.write_text('[project]\nname = "app"\ndependencies = ["pydantic>=2.0"]\n',
                   encoding="utf-8")
    (lab / "delivery" / "active").mkdir(parents=True, exist_ok=True)
    (lab / "delivery" / "active" / "STATUS.md").write_text(
        "# STATUS\n\n- class: S\n", encoding="utf-8")
    run(["git", "add", "-A"], lab)
    run(["git", "-c", "user.email=d@d", "-c", "user.name=d",
         "commit", "-qm", "manifest"], lab)
    run(["git", "branch", "-f", "b0"], lab)
    man.write_text('[project]\nname = "app"\n'
                   'dependencies = ["pydantic>=2.0", "httpx>=0.27"]\n', encoding="utf-8")
    run(["git", "add", "-A"], lab)
    run(["git", "-c", "user.email=d@d", "-c", "user.name=d",
         "commit", "-qm", "add dep"], lab)
    return [], {"BASE": "b0"}


def _setup_baseline_ratchet(lab: Path) -> tuple[list[str], dict]:
    """Снимок переснят ВВЕРХ → легализация свежих нарушений, гейт краснеет."""
    base = lab / "scripts" / "lint" / "file_length_baseline.txt"
    base.write_text("# снимок\n[baseline]\n120:backend/features/a.py\n", encoding="utf-8")
    run(["git", "add", "-A"], lab)
    run(["git", "-c", "user.email=d@d", "-c", "user.name=d",
         "commit", "-qm", "baseline"], lab)
    run(["git", "branch", "-f", "b0"], lab)
    base.write_text("# снимок\n[baseline]\n400:backend/features/a.py\n", encoding="utf-8")
    run(["git", "add", "-A"], lab)
    run(["git", "-c", "user.email=d@d", "-c", "user.name=d",
         "commit", "-qm", "raise snapshot"], lab)
    return [], {"BASE": "b0"}


# Гейты со своей постановкой: канарейка тут — не файл с нарушением, а СОСТОЯНИЕ
# репозитория (несвязанный скрипт, необъявленная зависимость, поднятый снимок).
DIRECT_SETUP = {
    "check_gate_coverage.sh": _setup_gate_coverage,
    "check_new_dependency.py": _setup_new_dependency,
    "check_baseline_ratchet.sh": _setup_baseline_ratchet,
}


class Doctor:
    def __init__(self, root: Path) -> None:
        self.root = root
        self.rows: list[tuple[str, str, str]] = []
        self.own = self._read_own_canaries()

    def add(self, verdict: str, point: str, detail: str) -> None:
        self.rows.append((verdict, point, detail))

    def _read_own_canaries(self) -> dict[str, list[tuple[str | None, str, str]]]:
        """Канарейки, объявленные проектом. Битый файл — НАЗВАТЬ, а не пропустить.

        Молчаливое «не разобрал → канареек нет» вернуло бы ровно тот класс, за
        которым доктор и придуман: объявление есть, проверки нет, и об этом никто
        не сказал.

        Ключ — `<скрипт>` **или** `<скрипт>:<правило>`, как в
        `not-applicable.json`. Форма с правилом обязательна, и это не симметрия
        ради симметрии: многоправильный гейт БЕЗ `--rule` падает с usage, а
        доктор принимал это за «гейт красный и без канарейки — судить нечем».
        Замерено на первом же применении: два адаптированных гейта Swift-проекта
        (`check_grep_gate.sh`, `check_ast_gate.py`) уходили в SKIP, то есть
        объявление снова принималось и не исполнялось — тот самый класс, ради
        которого этот механизм и чинили.
        """
        f = self.root / OWN_CANARIES
        if not f.is_file():
            return {}
        try:
            raw = json.loads(f.read_text(encoding="utf-8"))
        except (OSError, ValueError) as exc:
            self.add(SKIP, OWN_CANARIES, f"не разобран ({exc}) — свои гейты НЕ "
                                         "проверены, хотя канарейки объявлены")
            return {}
        out: dict[str, list[tuple[str | None, str, str]]] = {}
        for key, spec in (raw or {}).items():
            if not (isinstance(spec, dict) and spec.get("path") and spec.get("content")):
                self.add(SKIP, f"канарейка {key}",
                         f"объявление без path/content в {OWN_CANARIES}")
                continue
            name, _, rule = str(key).partition(":")
            out.setdefault(name, []).append(
                (rule or None, str(spec["path"]), str(spec["content"])))
        return out

    # --- A. каноны -----------------------------------------------------------
    def _declared_version(self, prefix: str) -> str:
        """Версия слоя из строки `stack:` в STATUS — то, что проект ЗАЯВИЛ.

        Заявление и снимок обязаны совпадать: расходятся — одно из двух врёт, и
        какое именно, отсюда не видно, но молчать нельзя.
        """
        if not prefix:
            return ""
        st = self.root / "delivery" / "active" / "STATUS.md"
        if not st.is_file():
            return ""
        m = re.search(rf"\b({re.escape(prefix)}@[0-9][0-9.]*)",
                      st.read_text("utf-8", errors="replace"))
        return m.group(1) if m else ""

    def check_canons(self) -> None:
        # Каноны лежат ЛИБО в корне, ЛИБО в снимке `docs/canon/` — и второе не
        # экзотика, а дефолт: §5 шаг 11 велит агенту выбирать вариант C, не
        # спрашивая. Первая редакция смотрела только в корень и на правильно
        # развёрнутом проекте печатала «файла нет — слой не развёрнут» по всем
        # четырём. ABSENT не роняет прогон, поэтому ошибка тихая: доктор говорил
        # «бедность» там, где всё на месте, и приёмка §6 читалась бы по нему.
        for name in CANONS:
            p = self.root / name
            if not p.is_file():
                p = self.root / "docs" / "canon" / name
            if not p.is_file():
                self.add(ABSENT, f"канон {name}", "файла нет — слой не развёрнут")
                continue
            m = re.search(r"\*\*Canon version:\*\*\s*`([^`]+)`", p.read_text("utf-8")) \
                or re.search(r"\*\*Эта карта:\*\*\s*`([^`]+)`", p.read_text("utf-8"))
            where = "" if p.parent == self.root else f" ({p.parent.relative_to(self.root)})"
            # Снимок сверяется с ЗАЯВЛЕННОЙ версией из STATUS. Иначе он —
            # единственный источник правды о самом себе: доктор читал шапку
            # снимка и считал её истиной, а проект тем временем развернул более
            # новый payload. Замер на живом проекте: скрипты 1.77, снимок 1.75,
            # STATUS 1.77 — и никто не сказал ни слова.
            #
            # Это делает честным и диагноз расхождения скриптов: без такой
            # проверки совет «обнови скрипт из payload'а» вреден, когда на самом
            # деле отстал снимок, а не скрипт.
            declared = self._declared_version(m.group(1).split("@")[0] if m else "")
            drift = ""
            if m and declared and declared != m.group(1):
                drift = (f" — STATUS заявляет {declared}: снимок ОТСТАЛ от "
                         "развёрнутого payload, обнови docs/canon (§5 шаг 11)")
            self.add(AUTO if (m and not drift) else WEAK, f"канон {name}",
                     (f"версия {m.group(1)}" if m else "версия в шапке не читается")
                     + where + drift)

    # --- B. места принуждения ------------------------------------------------
    def check_enforcement(self) -> None:
        cfg = self.root / ".pre-commit-config.yaml"
        self.add(AUTO if cfg.is_file() else ABSENT, "конфиг pre-commit",
                 "есть" if cfg.is_file() else "нет — коммит-гейтов не существует")

        # Установлен ли хук ФАКТИЧЕСКИ. Конфиг без `pre-commit install` — это
        # список пожеланий: ни один хук не запустится, и об этом ничто не скажет.
        for hook in ("pre-commit", "pre-push"):
            h = self.root / ".git" / "hooks" / hook
            if h.is_file() and "pre-commit" in h.read_text("utf-8", errors="ignore"):
                self.add(AUTO, f"хук {hook} установлен", str(h.relative_to(self.root)))
            else:
                self.add(DEAD if cfg.is_file() else ABSENT, f"хук {hook} установлен",
                         "конфиг есть, а хук НЕ установлен: `pre-commit install"
                         f"{' --hook-type pre-push' if hook == 'pre-push' else ''}`"
                         if cfg.is_file() else "нет")

        wf = sorted((self.root / ".github" / "workflows").glob("*.y*ml")) \
            if (self.root / ".github" / "workflows").is_dir() else []
        self.add(AUTO if wf else ABSENT, "CI workflow",
                 ", ".join(p.name for p in wf) if wf else "нет — §10.4 закроет как weak")

        mg = self.root / "scripts" / "merge_guard.sh"
        self.add(AUTO if mg.is_file() else ABSENT, "гейт мержа merge_guard.sh",
                 "есть" if mg.is_file() else "нет — мерж не проверяет слитое состояние")

    # --- C. инструменты ------------------------------------------------------
    def check_tools(self) -> None:
        venvs = [self.root / ".venv" / "bin", self.root / "backend" / ".venv" / "bin"]
        for tool, why in TOOLS.items():
            found = next((str(v / tool) for v in venvs if (v / tool).is_file()), None) \
                or shutil.which(tool) \
                or (shutil.which("gtimeout") if tool == "timeout" else None)
            self.add(AUTO if found else ABSENT, f"инструмент {tool}",
                     found if found else f"нет → {why} не работает")

    # --- D. снимки -----------------------------------------------------------
    def check_snapshots(self) -> None:
        d = self.root / "scripts" / "lint"
        if not d.is_dir():
            self.add(ABSENT, "снимки гейтов", "нет scripts/lint — контур не развёрнут")
            return
        found = sorted(p.name for p in d.glob("*baseline*.txt"))
        self.add(AUTO if found else WEAK, "снимки (baseline)",
                 f"{len(found)} шт: {', '.join(found)}" if found
                 else "ни одного: гейт без снимка красный на первом коммите, "
                      "и его снимают")

    # --- E. канарейки: главное ----------------------------------------------
    def _rules_of(self, script: Path) -> list[str]:
        """Список правил берётся У СКРИПТА (`--list-rules`), не дублируется тут."""
        cmd = ["python3", str(script)] if script.suffix == ".py" else ["bash", str(script)]
        code, out = run(cmd + ["--list-rules"], self.root)
        if code != 0:
            return []
        return [l.strip() for l in out.splitlines() if l.strip() and " " not in l.strip()]

    # --- Видит ли подключённый гейт код ЭТОГО проекта (cqg@1.69) --------------
    # Вторая половина вопроса «а судит ли вписанное». Первая — «умеет ли гейт
    # краснеть» — закрыта канарейкой. Эта — «нацелен ли он на код», и до сих пор
    # её не задавал никто:
    #
    #   gate-coverage  — вписан ли скрипт в конфиг. ТЕКСТОВЫЙ вопрос: хук с
    #                    неверной маской вписан и проходит;
    #   канарейка      — умеет ли гейт краснеть. Проба СВОЯ, поэтому слепой гейт
    #                    ловит канарейку прекрасно и остаётся слепым к проекту;
    #   сьют канона    — ловит ли правило нарушение. Стенд синтетический: тест
    #                    сам пишет файлы, которые потом проверяет, поэтому
    #                    расхождение маски с расширениями проекта там невыразимо
    #                    ПО ПОСТРОЕНИЮ.
    #
    # Замер, из которого правило родилось (Astro/TS, четыре гейта разом):
    # `file-length` с дефолтной маской `*.py *.ts *.tsx` не видел `.astro` —
    # файл на 900 строк давал «OK — просмотрено 1 файл(ов)», exit 0; eslint,
    # его ратчет и prettier стояли с шаблонной маской `^frontend/src/`, каталога
    # такого нет — три `Skipped (no files to check)`. Мета-гейт при этом зелёный,
    # доктор `DEAD 0`. Роль объявлена закрытой в карте ролей, гейт смотрит в
    # пустоту, и молчание выглядит как успех.
    #
    # Гоняются ТОЛЬКО гейты, вписанные в `.pre-commit-config.yaml`, и это не
    # осторожность, а точный признак дешевизны: §8.6 держит бюджет коммита в 5
    # секунд, значит всё, что там стоит, дёшево ПО ПОСТРОЕНИЮ. Сетевые и
    # минутные (`deps-audit`, `mutation`, `diff-coverage`) живут в CI и сюда не
    # попадают — их и не запустим.
    # ⚠ ДВЕ формулировки, и порядок слов в них РАЗНЫЙ: успех печатает
    # «просмотрено N файл(ов)», а ноль — «0 файлов просмотрено — проверь LINT_…».
    # Первая редакция знала только первую форму, и слепой гейт попадал в SKIP
    # вместо DEAD — то есть проверка на «зелёный на непроверенном» сама молчала
    # ровно на том случае, ради которого написана. Поймано третьим прогоном на
    # живом проекте (`check_grep_gate.sh` с дефолтным `LINT_PY_SRC`).
    SCANNED_RE = re.compile(r"просмотрено\s+(\d+)|(\d+)\s+файл\w*\s+просмотрено")

    def _hook_env(self, text: str, name: str) -> dict:
        """`LINT_*` из строк `entry:`, где зовётся этот скрипт.

        Значения живут в `entry:` (§6), и гонять гейт без них значило бы мерить
        не тот путь — то есть выдать ложную слепоту. Заодно это проверка самой
        §6: переменной нет в entry — гейт и на коммите работает по дефолту.
        """
        env = {}
        for line in text.splitlines():
            # ⚠ КОММЕНТАРИИ пропускаются, и это не микрооптимизация. Шапка
            # поставляемого `.pre-commit-config.yaml` объясняет, как задавать
            # переменные, ПРИМЕРОМ: `… LINT_PY_SRC=backend/app bash …`. Первая
            # редакция читала его как настоящую настройку и объявляла гейт
            # «настроенным на несуществующий путь» — то есть проверка против
            # ложного зелёного сама давала ложное красное, прочитав пояснение к
            # себе же. Четвёртый рецидив класса, ради которого в сьюте канона
            # живёт `extract.code_only()` (cqg@1.59).
            if line.lstrip().startswith("#") or name not in line:
                continue
            for m in re.finditer(r"\b(LINT_[A-Z_]+)=(\"[^\"]*\"|'[^']*'|\S+)", line):
                env[m.group(1)] = m.group(2).strip("\"'")
        return env

    #: Расширения, по которым видно, что в репозитории вообще есть исходники.
    SOURCE_EXT = (".py", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".astro",
                  ".vue", ".svelte", ".swift", ".go", ".rs", ".java", ".kt",
                  ".rb", ".php", ".cs", ".c", ".cc", ".cpp", ".m", ".mm")

    def check_gates_see_code(self) -> None:
        d = self.root / "scripts" / "lint"
        cfg = self.root / ".pre-commit-config.yaml"
        if not d.is_dir() or not cfg.is_file():
            return
        raw = cfg.read_text(encoding="utf-8", errors="replace")
        # ⚠ Конфиг читается БЕЗ комментариев. Шапка поставляемого файла объясняет
        # настройку ПРИМЕРОМ («… bash scripts/lint/check_grep_gate.sh --rule …»),
        # и проверка «вписан ли гейт» ловила этот пример как проводку: доктор
        # гонял гейт, снятый с коммита, и честно объявлял его слепым. Пятый
        # рецидив класса, ради которого в сьюте живёт `extract.code_only()`, —
        # и второй за одну правку: читалку env чинили тем же способом абзацем ниже.
        text = "\n".join(l for l in raw.splitlines() if not l.lstrip().startswith("#"))

        # ⚠ Судить слепоту можно ТОЛЬКО там, где есть чему быть увиденным.
        # На bootstrap-развёртывании (контур поставлен, кода ещё нет) ноль
        # просмотренных — честная бедность, а не ложь, и красный доктор на таком
        # стенде снимут первым: §4.3b, и ровно об этом предупреждает собственный
        # тест процедуры («доктор, красный на неполном стенде, снимают первым»).
        # Поймано этим тестом, а не полем.
        code, listing = run(["git", "ls-files"], self.root)
        files = [l for l in listing.splitlines()
                 if l.endswith(self.SOURCE_EXT) and not l.startswith("scripts/lint/")]
        if code != 0 or not files:
            self.add(SKIP, "область гейтов",
                     "в репозитории нет исходников вне scripts/lint — слепоту "
                     "судить не на чем (bootstrap: контур есть, кода ещё нет)")
            return
        for script in sorted(d.glob("check_*")):
            name = script.name
            if not script.is_file() or name in NOT_GATES:
                continue
            if name not in text:                      # не на коммите — не наш случай
                continue
            point = f"область {name}"
            cmd = (["python3"] if script.suffix == ".py" else ["bash"]) + [str(script)]
            # Многоправильный гейт без `--rule` падает с usage. Область у правил
            # одного скрипта общая, поэтому довольно первого вписанного.
            body = script.read_text(encoding="utf-8", errors="replace")
            if "--list-rules" in body:
                wired = re.findall(rf"{re.escape(name)}\s+--rule\s+([A-Za-z0-9_-]+)", text)
                if not wired:
                    continue
                cmd += ["--rule", wired[0]]
            env = self._hook_env(text, name)
            code, out = run(cmd, self.root, env=env)
            m = self.SCANNED_RE.search(out)
            if not m:
                # Гейт не отчитывается числом — либо не сканирующий, либо красный
                # по делу. Молча зачесть за успех нельзя, но и ронять не за что.
                self.add(SKIP, point, "гейт не печатает «просмотрено N» — "
                                      "сканирующий ли он, отсюда не видно")
                continue
            n = int(m.group(1) or m.group(2))
            if n:
                self.add(AUTO, point, f"просмотрено {n} файл(ов)")
                continue

            # Ноль бывает ДВУХ природ, и путать их нельзя.
            #
            # ① Гейт настроен на НЕСУЩЕСТВУЮЩИЙ путь — это ложь всегда: роль
            #    объявлена закрытой, а смотреть физически некуда.
            # ② У правила свой FILTER (`service-no-web` смотрит только в
            #    `/services/`), и ноль честно значит «предмета здесь нет».
            #
            # Первая редакция звала DEAD в обоих случаях и обвинила
            # `check_grep_gate.sh` на стенде, где каталог был на месте, а у
            # правила просто не было предмета. Ложное срабатывание — дефект
            # проверки (§4.3b), и такой доктор снимают раньше, чем он окупится.
            # Поймано собственным тестом процедуры, а не полем.
            roots = [v for k, v in env.items() if k.endswith("_SRC") or k.endswith("_DIR")]
            missing = [r for r in roots if r and not (self.root / r).is_dir()]
            if missing:
                self.add(DEAD, point,
                         "настроен на НЕСУЩЕСТВУЮЩИЙ путь "
                         f"({', '.join(missing)}) — смотреть некуда, а роль "
                         "объявлена закрытой (§6: значения живут в `entry:`)")
            elif "--list-rules" in body:
                self.add(WEAK, point,
                         "просмотрено 0 файлов. У правила свой FILTER, поэтому "
                         "ноль может честно значить «предмета нет» — но может и "
                         "«маска шаблонная». Отсюда не различить: сверь §6")
            else:
                self.add(DEAD, point,
                         "подключён и смотрит в ПУСТОТУ: просмотрено 0 файлов. "
                         "Роль объявлена закрытой, а гейт не видит кода — маска "
                         "или путь остались шаблонными (§6: значения в `entry:`)")

    # --- Что в контуре разошлось с каноном и почему (cqg@1.71) ----------------
    # Обновление контура было археологией: §5 описывает развёртывание на
    # greenfield, а что делать со СТАРЫМ проектом, часть скриптов которого
    # адаптирована под стек, не сказано нигде. Слепое копирование payload'а
    # адаптацию уничтожает — замерено на Swift-проекте: канонная python-версия
    # затёрла `check_grep_gate.sh` с тремя своими правилами (`force-unwrap`,
    # `hardcoded-network`), и спасло только чистое дерево и `git checkout`.
    #
    # Различать «адаптирован» и «просто устарел» приходилось глазами, и признак
    # неочевиден: из шести разошедшихся скриптов два оказались НЕ адаптированными
    # (ноль упоминаний своего стека в теле), один — настоящей адаптацией, а
    # ещё один нёс адаптацию ЛИШНЮЮ: маска Swift была зашита в тело, хотя
    # канонная версия давно принимает её через `LINT_LENGTH_GLOBS`.
    #
    # Отсюда `scripts/lint/adapted.json`: проект объявляет, что и почему изменено
    # против канона. Расхождение без объявления — не ложь (быть на версию позади
    # нормально), но и не молчание: печатается списком, чтобы обновление
    # начиналось с готового ответа, а не с раскопок.
    ADAPTED = "scripts/lint/adapted.json"

    def check_divergence_from_canon(self) -> None:
        snap = self.root / "docs" / "canon" / "CODE_QUALITY_GATES.md"
        d = self.root / "scripts" / "lint"
        if not snap.is_file() or not d.is_dir():
            return                       # снимка канона нет — сверять не с чем
        text = snap.read_text(encoding="utf-8", errors="replace")

        declared = {}
        f = self.root / self.ADAPTED
        if f.is_file():
            try:
                declared = json.loads(f.read_text(encoding="utf-8")) or {}
            except (OSError, ValueError) as exc:
                self.add(SKIP, self.ADAPTED, f"не разобран ({exc}) — адаптации "
                                             "объявлены и не прочитаны")
        for script in sorted(d.glob("*")):
            if not script.is_file() or script.suffix not in (".sh", ".py"):
                continue
            marker = f"### `scripts/lint/{script.name}`"
            if marker not in text:
                continue                 # свой гейт проекта — не наше дело
            lang = "python" if script.suffix == ".py" else "bash"
            body = _block_after(text, marker, lang)
            if body is None:
                continue
            same = body.strip() == script.read_text(
                encoding="utf-8", errors="replace").strip()
            spec = declared.get(script.name)
            point = f"расхождение с каноном {script.name}"
            if same:
                if spec:
                    self.add(WEAK, point, "объявлен адаптированным, а тело "
                                          "СОВПАДАЕТ с каноном — объявление "
                                          "устарело и мешает обновлению")
                continue
            if isinstance(spec, dict) and str(spec.get("reason", "")).strip():
                self.add(WEAK, point, "адаптирован намеренно: "
                                      + str(spec["reason"])[:90])
            else:
                self.add(WEAK, point,
                         "тело отличается от снимка канона, а объявления нет. "
                         "Либо устарел (обнови из payload'а), либо адаптирован "
                         f"под стек (объяви в {self.ADAPTED} с причиной) — "
                         "иначе обновление начнётся с раскопок и затрёт правку")

    def check_canaries(self) -> None:
        d = self.root / "scripts" / "lint"
        if not d.is_dir():
            self.add(ABSENT, "проба канарейкой", "нет scripts/lint")
            return
        for script in sorted(d.glob("*")):
            if not script.is_file():
                continue
            name = script.name
            if name in NOT_GATES or name == "contour_doctor.py":
                self.add(TOOL, f"{name}", "измерительный инструмент, не гейт — "
                                          "канарейке нечего ловить")
                continue
            if not name.startswith("check_"):
                continue
            # Объявленная проектом канарейка идёт ПЕРВОЙ — раньше пробы
            # честного пропуска. До cqg@1.67 порядок был обратным, и для
            # tool-зависимого гейта до `_probe_declared` дело не доходило
            # НИКОГДА: объявление принималось и молча не исполнялось. Проект,
            # положивший канарейку, тем самым утверждает, что инструмент у него
            # есть и класс нарушения ему известен, — это сильнее, чем проверка
            # «а честно ли гейт пропускает, когда инструмента нет».
            if name in self.own:
                for rule, path, body in self.own[name]:
                    self._probe_declared(script, path, body, rule)
                continue
            if name in TOOL_DEPENDENT:
                self._probe_honest_skip(script, TOOL_DEPENDENT[name])
                continue
            if name in DIRECT_SETUP:
                self._probe_state(script, DIRECT_SETUP[name])
                continue
            rules = self._rules_of(script)
            if rules:
                for rule in rules:
                    self._probe(script, rule)
            else:
                # Односложный гейт: `--rule` он не принимает, канарейка ищется по
                # имени скрипта. Прежняя версия отправляла такие в SKIP целиком —
                # то есть доктор не пробовал file-length и сложность вообще.
                self._probe(script, None)

    def _probe_state(self, script: Path, setup) -> None:
        """Канарейка — СОСТОЯНИЕ репозитория, а не файл с нарушением в коде."""
        point = f"канарейка {script.name}"
        with tempfile.TemporaryDirectory(prefix="doctor-state-") as tmp:
            lab = Path(tmp)
            (lab / "scripts" / "lint").mkdir(parents=True)
            (lab / "backend" / "features").mkdir(parents=True)
            (lab / "backend" / "features" / "a.py").write_text("x = 1\n", encoding="utf-8")
            shutil.copy(script, lab / "scripts" / "lint" / script.name)
            run(["git", "init", "-q", "."], lab)
            run(["git", "add", "-A"], lab)
            run(["git", "-c", "user.email=d@d", "-c", "user.name=d",
                 "commit", "-qm", "base"], lab)
            extra_args, extra_env = setup(lab)
            cmd = (["python3"] if script.suffix == ".py" else ["bash"]) \
                + [str(lab / "scripts" / "lint" / script.name)] + extra_args
            code, out = run(cmd, lab, env={"LINT_PY_SRC": "backend/features",
                                           **extra_env})
            if code != 0:
                self.add(AUTO, point, "канарейка поймана")
            elif any(w in out for w in SKIP_WORDS):
                self.add(WEAK, point, out.strip().splitlines()[0][:78])
            else:
                self.add(DEAD, point,
                         f"МОЛЧИТ на подготовленном нарушении: {out.strip()[:66]!r}")

    def _probe_honest_skip(self, script: Path, tool: str) -> None:
        """Инструмента нет — гейт обязан НАЗВАТЬ пропуск и не выдать его за успех.

        Прямая канарейка тут потребовала бы самого инструмента (сеть, npm, venv), а
        это свойство важнее и проверяется без него. Класс ловился трижды: `timeout`
        на macOS ронял мутационный гейт в «мутанты не сгенерированы» и exit 0 (F14);
        secrets-хук с голым `command -v` печатал `Passed`, не просмотрев ни файла
        (F10); `deps_audit_waiver: no` работал как разрешение при critical=1.
        """
        # ⚠ В названии точки сказано, ЧЬЁ окружение проверяется. Проба идёт с
        # голым PATH и без переменных хука — это её замысел, но вердикт
        # «нет каталога фронта (frontend)» читался как диагноз ПРОЕКТУ, хотя под
        # pre-commit тот же гейт работает. Полевой аудит поймал ровно это:
        # доктор писал WEAK там, где настроено верно. Зонд, не воспроизводящий
        # окружение хука, обязан хотя бы не выдавать себя за него.
        point = f"честный пропуск {script.name} (в пробе нет {tool})"
        with tempfile.TemporaryDirectory(prefix="doctor-skip-") as tmp:
            lab = Path(tmp)
            (lab / "backend" / "features").mkdir(parents=True)
            (lab / "scripts" / "lint").mkdir(parents=True)
            shutil.copy(script, lab / "scripts" / "lint" / script.name)
            run(["git", "init", "-q", "."], lab)
            run(["git", "add", "-A"], lab)
            run(["git", "-c", "user.email=d@d", "-c", "user.name=d",
                 "commit", "-qm", "base"], lab)
            run(["git", "branch", "-f", "b0"], lab)
            # Изменённый prod-файл появляется ПОСЛЕ базы: иначе диффа нет, гейт
            # честно скажет «изменённых prod-файлов нет», а доктор примет честный
            # ответ за ложь. Первая версия пробы делала ровно так и дала ложный
            # DEAD у diff-coverage — неверна была проба, а не гейт.
            (lab / "backend" / "features" / "a.py").write_text(
                "def f(x):\n    return x + 1\n", encoding="utf-8")
            run(["git", "add", "-A"], lab)
            run(["git", "-c", "user.email=d@d", "-c", "user.name=d",
                 "commit", "-qm", "change"], lab)
            cmd = (["python3"] if script.suffix == ".py" else ["bash"]) \
                + [str(lab / "scripts" / "lint" / script.name)]
            code, out = run(cmd, lab, env={"PATH": BARE_PATH, "BASE": "b0",
                                           "LINT_PY_SRC": "backend/features",
                                           "MUTATION_NO_BUDGET": "0"})
            named = any(w in out for w in SKIP_WORDS)
            claims_ok = any(w in out for w in SUCCESS_WORDS)
            # Заявленный успех бьёт названный пропуск, а не наоборот. Гейт может
            # шепнуть «○ пропущено: …» в теле и напечатать `: OK` в итоге — читают
            # итог, и сводка pre-commit показывает `Passed`. Это форма F10, и она
            # DEAD, даже если пропуск где-то упомянут.
            # Проверено обратным прогоном: пока это условие стояло как
            # `claims_ok and not named`, переменная была МЁРТВОЙ — вердикт давала
            # финальная ветка, и опустошение SUCCESS_WORDS ничего не меняло.
            if claims_ok:
                self.add(DEAD, point,
                         f"инструмента НЕТ, а гейт заявляет успех: {out.strip()[:70]!r}")
            elif named:
                self.add(WEAK, point, out.strip().splitlines()[0][:78])
            elif code != 0:
                self.add(AUTO, point, "инструмента нет → гейт краснеет, а не молчит")
            else:
                self.add(DEAD, point,
                         f"пропуск НЕ НАЗВАН и не красный: {out.strip()[:70]!r}")

    def _probe_declared(self, script: Path, path: str, content: str,
                        rule: str | None = None) -> None:
        """Гейт по канарейке, объявленной проектом — ДИФФЕРЕНЦИАЛЬНО и В ДЕРЕВЕ.

        Прогонов два: **зелен без канарейки и красен с ней**. Одного «красный с
        канарейкой» мало — гейт мог упасть на отсутствии окружения; тогда судить
        нечем, и это SKIP с названной причиной, а не AUTO.

        ⚠ **Проба идёт в дереве САМОГО ПРОЕКТА, и это исправление, а не стиль.**
        До cqg@1.67 канарейка разворачивалась во временном репозитории, куда
        копировались только скрипт и `canaries.json`. Для гейта, стоящего на
        внешнем инструменте, там нет ни `node_modules`, ни `tsconfig.json`, ни
        конфига контрактов — то есть **проектный контракт был непроверяем в
        принципе**, и объявление молча не исполнялось. Замерено на живом
        развёртывании: проект объявил две канарейки, доктор напечатал `DEAD 0` и
        ни строки про них. Принятое и неисполненное объявление хуже отсутствующего.

        Цена: доктор пишет файл в рабочее дерево. Поэтому — отказ, если файл уже
        есть (чужое не трогаем), и удаление в `finally` вместе с каталогами,
        которые создали сами. Коммитить канарейку НЕЛЬЗЯ: индекс проекта не наш.
        """
        point = f"канарейка {script.name}" + (f":{rule}" if rule else "") + " (своя)"
        target = self.root / path
        cmd = (["python3"] if script.suffix == ".py" else ["bash"]) + [str(script)]
        if rule:
            cmd += ["--rule", rule]

        # Канарейка бывает ДВУХ видов, и оба законны: новый файл (нарушение,
        # которого в дереве нет) и ПОДМЕНА существующего (вендоренная копия
        # канона — находка 7). Первая редакция пробы в дереве отказывалась
        # трогать существующий файл и тем сломала второй вид — поймано
        # собственным сьютом, а не полем. Поэтому: содержимое сохраняем и
        # возвращаем, созданное — удаляем.
        clean = target.exists()
        backup = target.read_text(encoding="utf-8") if clean else None
        made: list[Path] = []
        d = target.parent
        while not d.exists() and d != self.root:
            made.append(d)
            d = d.parent
        try:
            before_code, before_out = run(cmd, self.root)
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(content, encoding="utf-8")
            after_code, after_out = run(cmd, self.root)
        finally:
            if backup is None:
                if target.exists():
                    target.unlink()
                for d in made:                  # только свои, снизу вверх
                    try:
                        d.rmdir()
                    except OSError:
                        break
            else:
                target.write_text(backup, encoding="utf-8")

        # Гейт, судящий по `git ls-files`, некоммитнутой канарейки не увидит, и
        # его зелёное здесь ничего не значит. Отличаем это от настоящего DEAD:
        # молчать «проверено» на непроверенном — ровно то, против чего доктор.
        body = script.read_text(encoding="utf-8", errors="replace")
        if before_code == 0 and after_code == 0 and "ls-files" in body:
            self.add(SKIP, point, "гейт судит по `git ls-files`, а канарейка не "
                                  "закоммичена — проверить исполнением нечем "
                                  "(индекс проекта доктор не трогает)")
            return

        if before_code != 0:
            self.add(SKIP, point, "гейт красный и БЕЗ канарейки "
                                  f"({before_out.strip()[:60]!r}) — судить нечем")
        elif after_code != 0:
            self.add(AUTO, point, "канарейка поймана"
                                  + (f" ({path})" if not clean else ""))
        elif any(w in after_out for w in SKIP_WORDS):
            self.add(WEAK, point, after_out.strip().splitlines()[0][:80])
        else:
            self.add(DEAD, point, "МОЛЧИТ на объявленной канарейке (exit 0): "
                                  f"{after_out.strip()[:60]!r}")

    def _probe(self, script: Path, rule: str | None) -> None:
        point = f"канарейка {script.name}" + (f":{rule}" if rule else "")
        canary = CANARIES.get(rule or script.name)
        if canary is None:
            declared = self.own.get(script.name)
            if declared:
                for d_rule, d_path, d_body in declared:
                    self._probe_declared(script, d_path, d_body, d_rule or rule)
                return
            self.add(SKIP, point, "канарейки для этого правила у доктора нет — "
                                  "правило НЕ проверено исполнением. Свой гейт? "
                                  f"объяви канарейку в {OWN_CANARIES} "
                                  '({"path": …, "content": …})')
            return
        fname, body = canary
        with tempfile.TemporaryDirectory(prefix="doctor-") as tmp:
            lab = Path(tmp)
            src = lab / "backend" / "features"
            src.mkdir(parents=True)
            (src / fname).write_text(body, encoding="utf-8")
            (lab / "scripts" / "lint").mkdir(parents=True)
            shutil.copy(script, lab / "scripts" / "lint" / script.name)
            run(["git", "init", "-q", "."], lab)
            run(["git", "add", "-A"], lab)
            run(["git", "-c", "user.email=d@d", "-c", "user.name=d",
                 "commit", "-qm", "canary"], lab)
            cmd = (["python3"] if script.suffix == ".py" else ["bash"]) \
                + [str(lab / "scripts" / "lint" / script.name)]
            if rule:
                cmd += ["--rule", rule]
            code, out = run(cmd, lab, env={"LINT_PY_SRC": "backend/features"})
            named_skip = any(w in out for w in
                             ("пропущен", "не судит", "не проверен", "нет каталога"))
            if code != 0:
                self.add(AUTO, point, "канарейка поймана")
            elif named_skip:
                self.add(WEAK, point, out.strip().splitlines()[0][:80])
            else:
                self.add(DEAD, point,
                         f"МОЛЧИТ на своём же нарушении (exit 0): {out.strip()[:70]!r}")

    # --- вывод ---------------------------------------------------------------
    def report(self, as_json: bool) -> int:
        dead = [r for r in self.rows if r[0] == DEAD]
        if as_json:
            print(json.dumps({
                "verdicts": [{"verdict": v, "point": p, "detail": d}
                             for v, p, d in self.rows],
                "counts": {k: sum(1 for r in self.rows if r[0] == k) for k in ORDER},
                "dead": len(dead),
            }, ensure_ascii=False, indent=2))
            return 1 if dead else 0

        for verdict, point, detail in sorted(self.rows, key=lambda r: (ORDER[r[0]], r[1])):
            print(f"{COLOR[verdict]}{verdict:6}{RESET} {point:44} {detail}")

        counts = {k: sum(1 for r in self.rows if r[0] == k) for k in ORDER}
        print(f"\ncontour-doctor: AUTO {counts[AUTO]} · WEAK {counts[WEAK]} · "
              f"ABSENT {counts[ABSENT]} · TOOL {counts[TOOL]} · "
              f"SKIP {counts[SKIP]} · DEAD {counts[DEAD]}")
        # Примечание про SKIP печатается ТОЛЬКО когда они есть. Иначе доктор
        # объявлял бы слепоту, которой у него нет, — а преувеличенная скромность
        # так же уводит от правды, как преувеличенная уверенность.
        if counts[SKIP]:
            print("SKIP — область, которую доктор не пробовал: это его собственная "
                  "непокрытость,\nи она названа, а не спрятана.")
        if dead:
            print(f"\n\033[31mERROR{RESET}: {len(dead)} проверк(и) объявлены и МОЛЧАТ "
                  "на своём же нарушении.")
            print("Это не бедность (ABSENT/WEAK честны и не роняют доктора), а ложь: "
                  "контур\nсообщает о защите, которой нет.")
            return 1
        print("\nЛжи нет: всё объявленное либо судит, либо честно названо непокрытым.")
        return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="диагностика развёрнутого контура")
    ap.add_argument("--json", action="store_true", help="машинно-читаемый вывод")
    ap.add_argument("--root", default=None, help="корень проекта (по умолчанию — git-root)")
    args = ap.parse_args()

    root = Path(args.root) if args.root else None
    if root is None:
        code, out = run(["git", "rev-parse", "--show-toplevel"], Path.cwd())
        root = Path(out.strip()) if code == 0 and out.strip() else Path.cwd()

    doc = Doctor(root.resolve())
    doc.check_canons()
    doc.check_enforcement()
    doc.check_tools()
    doc.check_snapshots()
    doc.check_canaries()
    doc.check_gates_see_code()
    doc.check_divergence_from_canon()
    return doc.report(args.json)


if __name__ == "__main__":
    sys.exit(main())
