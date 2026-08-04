#!/usr/bin/env bash
# Мутационное тестирование изменённых файлов — единственный механический способ
# спросить «а тесты вообще что-то утверждают».
#
# Зачем. diff-coverage мерит, какие строки ИСПОЛНИЛИСЬ, а не что проверено. Тест
# без единого assert даёт 100% покрытия. Мутант — намеренно испорченный код
# (`>` → `>=`, `+` → `-`, `True` → `False`); если тесты остались зелёными, они это
# поведение не проверяют. «Выжил» — значит тесты пропустили бы такой баг в проде.
#
# Дорого по времени, поэтому: ТОЛЬКО изменённые файлы + жёсткий бюджет времени.
# Это ручной DoD-шаг и шаг CI, НЕ commit-хук (§8.6: бюджет pre-commit — 5 секунд).
#
# Настройка (env):
#   BASE          — база диффа (дефолт origin/main)
#   MIN_KILLED    — минимальная доля убитых мутантов, % (дефолт 60)
#   BUDGET_SEC    — жёсткий потолок времени (дефолт 300)
#   LINT_PY_SRC, LINT_BE_DIR, LINT_VENV
#   STRICT=0      — soft (отчёт, exit 0)
#   MUTATION_NO_BUDGET=1 — гнать без потолка времени, когда нет timeout/gtimeout
#
# Нет mutmut — мягкий пропуск с указанием установки: инструмент опционален,
# но пропуск не должен быть тихим.
#
# ⚠ Правило этого гейта, выведенное из F14: у КАЖДОГО мягкого пропуска причина
# должна быть настоящей. Пропуск с чужим диагнозом хуже красного гейта — он учит
# искать проблему не там, где она есть. Различаются восемь исходов: нет mutmut · нет
# timeout · область не настроена · это mutmut 2.x · ключ мутанта не совпал с путём
# импорта · бюджет исчерпан · mutmut упал · формат вывода незнаком. Ни один не
# печатает «нет тестов», если тесты тут не при чём.

set -uo pipefail

STRICT=${STRICT:-1}
BASE=${BASE:-origin/main}
MIN_KILLED=${MIN_KILLED:-60}
BUDGET_SEC=${BUDGET_SEC:-300}
BE_DIR=${LINT_BE_DIR:-backend}
PY_SRC=${LINT_PY_SRC:-$BE_DIR/features}
VENV=${LINT_VENV:-$BE_DIR/.venv}
# Значение, данное «относительно backend» (так его описывала §6 до cqg@1.33),
# тоже принимается: одно написание не могло удовлетворить обе трактовки, и
# документированное `.venv` глушило этот гейт мягким пропуском (lab-9 №7).
[[ -d "$VENV" || ! -d "$BE_DIR/$VENV" ]] || VENV="$BE_DIR/$VENV"

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$REPO_ROOT" || exit 1

red=$(printf '\033[31m'); yellow=$(printf '\033[33m'); green=$(printf '\033[32m'); reset=$(printf '\033[0m')

# Корень исходников обязан СУЩЕСТВОВАТЬ — и это проверяется ПЕРВЫМ, раньше проверок
# инструментов. Ошибка настройки принадлежит оператору и не должна маскироваться
# ошибкой среды: «поставь mutmut» на неверном пути посылает чинить не то.
#
# lab-12: дефолт `LINT_PY_SRC` — `backend/features` (раскладка проекта, на котором
# писался канон); у арены пакет назывался `app`, переменная была задана только в
# `quality.yml`, а CI в конфигурации без хостинга не исполнялся ни разу. Гейт всю
# поставку печатал ЗЕЛЁНОЕ «изменённых prod-файлов нет» — утверждение, что он
# смотрел и не нашёл изменений, — глядя в несуществующий каталог. Единственный
# оракул на «утверждают ли тесты хоть что-нибудь» был выключен молча.
# Брат `check_complexity_gate.sh` на том же входе честен («нет каталога … —
# гейт пропущен, настрой LINT_PY_SRC»); класс F15 — расхождение между братьями.

# --- TS-половина: тот же вопрос, другой инструмент ---------------------------
# Роль «тесты хоть что-то утверждают» на TS закрывает Stryker. Это ПОДСТАНОВКА
# инструмента в существующую строку каталога §3, а не новый гейт: снимка у роли
# нет вовсе, порог один (`MIN_KILLED`) и сообщение одно — значит строка таблицы
# остаётся одна, и бюджет §9.1a не трогается (единица счёта — строка, §3).
#
# Замер, ради которого ветка и написана (Stryker 9.6.1 + vitest 4.1, 24 мутанта):
#   утверждения на месте → убито 20 из 24 (83%)
#   утверждения ВЫРЕЗАНЫ → убито 0 из 24, и `vitest run` при этом ЗЕЛЁНЫЙ (7 passed)
# Обе строки — с кодом возврата Stryker РАВНЫМ НУЛЮ.
#
# ⚠ Отсюда несущее правило ветки: код возврата Stryker вердиктом НЕ является.
# Он ноль и при 0% убитых, потому что `thresholds.break` по умолчанию не задан.
# Судить можно только по отчёту — ровно как python-половина судит по счётчикам
# mutmut, а не по его коду возврата.
FE_DIR=${LINT_FE_DIR:-frontend}
TS_SRC=${LINT_TS_SRC:-$FE_DIR/src}

ts_mutation() {
  local STRYKER changed n cfg runner runners out rc report line score
  STRYKER="$FE_DIR/node_modules/.bin/stryker"
  [[ -x "$STRYKER" ]] || STRYKER="node_modules/.bin/stryker"
  [[ -x "$STRYKER" ]] || STRYKER=$(command -v stryker 2>/dev/null || true)
  if [[ -z "$STRYKER" ]]; then
    printf '%s⚠ mutation: Stryker не найден — TS-половина пропущена.\n' "$yellow"
    printf 'Установка: npm i -D @stryker-mutator/core @stryker-mutator/<runner>-runner%s\n' "$reset"
    return 0
  fi
  if ! git rev-parse --verify --quiet "$BASE" >/dev/null; then
    printf '%s⚠ mutation: ref %s недоступен — TS-половина пропущена%s\n' "$yellow" "$BASE" "$reset"
    return 0
  fi
  # Тесты из населения исключаются: мутировать надо продуктовый код. Маска шире
  # дефолта Stryker намеренно — проекты зовут каталог и `test`, и `tests`, и `__tests__`.
  changed=$(git diff --name-only "$BASE"...HEAD -- "$TS_SRC" 2>/dev/null \
    | grep -E '\.(ts|tsx|js|jsx|mts|cts)$' \
    | grep -vE '(^|/)__tests__/|(^|/)tests?/|\.(test|spec)\.' || true)
  if [[ -z "$changed" ]]; then
    printf '%smutation: изменённых prod-файлов нет (BASE=%s, смотрел в %s)%s\n' \
      "$green" "$BASE" "$TS_SRC" "$reset"
    return 0
  fi
  n=$(printf '%s\n' "$changed" | wc -l | tr -d ' ')
  printf 'mutation/ts: %s файл(ов), бюджет %ss, цель ≥%s%% убитых\n' "$n" "$BUDGET_SEC" "$MIN_KILLED"

  # Конфиг проекта, если он есть, Stryker находит сам — тогда гейт добавляет только
  # область и репортёр. Если конфига нет, нужен раннер, и угадывать его нельзя:
  # берём тот, что реально установлен, и только когда он ОДИН. Два раннера — это
  # выбор проекта, а не гейта; ноль — честный пропуск с командой установки.
  cfg=""
  for c in stryker.config.json stryker.config.mjs stryker.config.cjs stryker.config.js \
           .stryker.conf.json .stryker.conf.js "$FE_DIR/stryker.config.json"; do
    [[ -f "$c" ]] && { cfg="$c"; break; }
  done
  runner=""
  if [[ -z "$cfg" ]]; then
    runners=$(ls -d "$FE_DIR"/node_modules/@stryker-mutator/*-runner node_modules/@stryker-mutator/*-runner \
                2>/dev/null | sed -E 's#.*/([a-z0-9]+)-runner$#\1#' | sort -u)
    if [[ -z "$runners" ]]; then
      printf '%s⚠ mutation: ни конфига Stryker, ни раннера — TS-половина не судит.\n' "$yellow"
      printf 'Поставь раннер под свой сьют: npm i -D @stryker-mutator/vitest-runner%s\n' "$reset"
      return 0
    fi
    if [[ $(printf '%s\n' "$runners" | wc -l | tr -d ' ') -gt 1 ]]; then
      printf '%s⚠ mutation: раннеров несколько (%s) — какой брать, решает ПРОЕКТ.\n' \
        "$yellow" "$(printf '%s' "$runners" | tr '\n' ',')"
      printf 'Заведи stryker.config.json с полем testRunner — гейт его подхватит.%s\n' "$reset"
      return 0
    fi
    runner="$runners"
  fi

  out=$(mktemp)
  # Бюджет держим тем же способом, что python-половина: 124 от timeout — это
  # НЕПОЛНЫЕ данные, а не «зелено».
  if [[ -n "$TIMEOUT_BIN" ]]; then
    "$TIMEOUT_BIN" "$BUDGET_SEC" "$STRYKER" run ${cfg:+"$cfg"} ${runner:+--testRunner "$runner"} \
      --mutate "$(printf '%s' "$changed" | tr '\n' ',')" --reporters json >"$out" 2>&1
  else
    "$STRYKER" run ${cfg:+"$cfg"} ${runner:+--testRunner "$runner"} \
      --mutate "$(printf '%s' "$changed" | tr '\n' ',')" --reporters json >"$out" 2>&1
  fi
  rc=$?
  if (( rc == 124 )); then
    printf '%s⚠ mutation: бюджет %ss исчерпан — данные НЕПОЛНЫЕ, гейт не судит.\n' "$yellow" "$BUDGET_SEC"
    printf 'Это не «зелено»: часть мутантов не проверена. Сузь дифф или подними BUDGET_SEC.%s\n' "$reset"
    rm -f "$out"; return 0
  fi

  # Путь к отчёту берём из СЛОВ САМОГО Stryker'а, а не из своего представления о
  # дефолте: замер дал `reports/mutation/mutation.json`, а конфиг проекта волен
  # положить его куда угодно. Зашитый путь молча читал бы вчерашний отчёт.
  report=$(grep -oE 'file://[^ ]*\.json' "$out" | tail -1 | sed 's#^file://##')
  [[ -n "$report" && -f "$report" ]] || report="${MUTATION_TS_REPORT:-reports/mutation/mutation.json}"
  if [[ ! -f "$report" ]]; then
    printf '%s⚠ mutation: Stryker отработал, но отчёт не найден — гейт НЕ судит.%s\n' "$yellow" "$reset"
    tail -5 "$out" >&2; rm -f "$out"; return 0
  fi

  score=$(python3 -c '
import json, sys
try:
    d = json.load(open(sys.argv[1]))
except Exception:
    sys.stderr.write("отчёт Stryker не разобран\n"); raise SystemExit(3)
det = und = 0
for info in d.get("files", {}).values():
    for m in info.get("mutants", []):
        s = m.get("status")
        if s in ("Killed", "Timeout"):
            det += 1
        elif s in ("Survived", "NoCoverage"):
            und += 1
total = det + und
if total == 0:
    sys.stderr.write("мутанты не сгенерированы\n"); raise SystemExit(4)
sys.stdout.write("%d %d %d" % (det, total, 100 * det // total))
' "$report" 2>&1)
  if [[ ! "$score" =~ ^[0-9]+\ [0-9]+\ [0-9]+$ ]]; then
    printf '%s⚠ mutation: отчёт есть, а вердикта из него нет — гейт НЕ судит: %s%s\n' \
      "$yellow" "$score" "$reset"
    rm -f "$out"; return 0
  fi
  rm -f "$out"
  set -- $score
  printf 'mutation/ts: убито %s из %s (%s%%), порог %s%%\n' "$1" "$2" "$3" "$MIN_KILLED"
  if (( $3 < MIN_KILLED )); then
    printf '\n%sERROR%s: тесты не убивают мутантов изменённого кода — они его не проверяют.\n' \
      "$red" "$reset" >&2
    printf 'Выживший мутант = поведение, которое сьют пропустил бы в проде.\n' >&2
    printf 'Кто выжил: %s\n' "$report" >&2
    [[ "$STRICT" == "0" ]] && { printf '%sWARNING (STRICT=0)%s\n' "$yellow" "$reset" >&2; return 0; }
    return 1
  fi
  printf '%smutation/ts: OK%s\n' "$green" "$reset"
  return 0
}

if [[ ! -d "$REPO_ROOT/$PY_SRC" ]]; then
  # Python-каталога нет — но это ещё не значит «смотреть не на что». Прежде чем
  # печатать пропуск, пробуем TS-половину: ровно на этом месте второе развёртывание
  # (Astro/TS) оставалось без единственного оракула «тесты утверждают».
  if [[ -d "$REPO_ROOT/$TS_SRC" ]]; then
    TIMEOUT_BIN=$(command -v timeout 2>/dev/null || command -v gtimeout 2>/dev/null || true)
    ts_mutation
    exit $?
  fi
  printf '%s⚠ mutation: нет ни %s, ни %s — мутационный гейт пропущен (§6).\n' \
    "$yellow" "$PY_SRC" "$TS_SRC"
  printf 'Это НЕ «изменений нет»: гейт не смотрел никуда. Пакет проекта редко зовётся\n'
  printf '`features` — задай LINT_PY_SRC/LINT_TS_SRC во ВСЕХ местах вызова, не только в CI.%s\n' "$reset"
  exit 0
fi

# Обе половины сразу гейт НЕ считает, и это названный предел, а не недосмотр:
# `MIN_KILLED` — одна доля убитых, а два населения мутантов в одну долю не
# складываются. На fullstack-репо судится python, и о непросуженной TS-половине
# гейт говорит вслух — молчание тут было бы тем самым тихим пропуском.
if [[ -d "$REPO_ROOT/$TS_SRC" ]]; then
  printf '%s⚠ mutation: TS-половина (%s) этим прогоном НЕ судится — считается python.\n' \
    "$yellow" "$TS_SRC"
  printf 'Нужен вердикт по фронту — прогони отдельно: LINT_PY_SRC=%s %s%s\n' \
    "нет-такого-каталога" "$0" "$reset"
fi

MUTMUT="$VENV/bin/mutmut"
[[ -x "$MUTMUT" ]] || MUTMUT=$(command -v mutmut 2>/dev/null || true)
if [[ -z "$MUTMUT" ]]; then
  printf '%s⚠ mutmut не найден — мутационный гейт пропущен. Установка: pip install mutmut%s\n' \
    "$yellow" "$reset"
  exit 0
fi

if ! git rev-parse --verify --quiet "$BASE" >/dev/null; then
  printf '%s⚠ ref %s недоступен — мутационный гейт пропущен%s\n' "$yellow" "$BASE" "$reset"
  exit 0
fi

changed=$(git diff --name-only "$BASE"...HEAD -- "$PY_SRC/*.py" 2>/dev/null \
  | grep -vE '/tests/|/test_[^/]*\.py$' || true)
if [[ -z "$changed" ]]; then
  printf '%smutation: изменённых prod-файлов нет (BASE=%s, смотрел в %s)%s\n' \
    "$green" "$BASE" "$PY_SRC" "$reset"
  exit 0
fi

n=$(printf '%s\n' "$changed" | wc -l | tr -d ' ')
printf 'mutation: %s файл(ов), бюджет %ss, цель ≥%s%% убитых\n' "$n" "$BUDGET_SEC" "$MIN_KILLED"

# Дальше — проверки инструментов, и они СПЕЦИАЛЬНО тут, а не выше: пока не известно,
# что мутировать, требовать coreutils незачем. Порядок «сначала есть ли работа, потом
# чем её делать» экономит и время, и ложные советы «поставь brew».

# `timeout` — GNU coreutils, и на macOS его НЕТ по умолчанию. Проверяется наравне с
# mutmut: до cqg@1.32 вызов шёл без проверки, `timeout` не находился, rc=127 не
# совпадал с 124, дальше парсинг давал нули — и гейт печатал «мутанты не
# сгенерированы (пустые файлы? нет тестов?)» и выходил НУЛЁМ. То есть единственный
# оракул на «тесты что-то утверждают» был молчаливым no-op с ложным диагнозом на
# машине разработчика (F14; поймано полевым прогоном, воспроизведено поведением).
TIMEOUT_BIN=$(command -v timeout 2>/dev/null || command -v gtimeout 2>/dev/null || true)
if [[ -z "$TIMEOUT_BIN" ]]; then
  if [[ "${MUTATION_NO_BUDGET:-0}" == "1" ]]; then
    printf '%s⚠ mutation: timeout не найден, MUTATION_NO_BUDGET=1 — прогон БЕЗ потолка времени%s\n' \
      "$yellow" "$reset" >&2
  else
    printf '%s⚠ mutation: timeout (GNU coreutils) не найден — гейт пропущен, потому что\n' "$yellow"
    printf 'без него бюджет %ss не удержать, а прогон мутантов может идти часами.\n' "$BUDGET_SEC"
    printf 'macOS: brew install coreutils (даёт gtimeout, скрипт его подхватит).\n'
    printf 'Осознанно без потолка: MUTATION_NO_BUDGET=1.%s\n' "$reset"
    exit 0
  fi
fi

# ⚠ ГДЕ ЗАПУСКАТЬ — условие работоспособности, а не деталь, и оно определяется ДО
# любого вызова mutmut: конфиг `[mutmut]` он читает из своего cwd, поэтому даже
# `--version` из неверного каталога падает «не могу понять, что мутировать».
#
# mutmut 3.x выводит ключ мутанта ИЗ ПУТИ ФАЙЛА относительно cwd:
# `backend/app/calc.py` → `backend.app.calc`. Тесты при этом импортируют `app.calc`,
# ключи не совпадают, и прогон останавливается сам («tests recorded trampoline hits
# but none match any mutant key»). Именно это, а НЕ копирование в `mutants/`, —
# корень несовместимости с раскладкой `backend/`; поэтому `PYTHONPATH` и не помогал:
# он менял путь ИМПОРТА, то есть увеличивал расхождение.
#
# Следствие приятное: относительно `backend/` раскладка канона УЖЕ плоская. Запуск
# из корня импортов (`dirname` от PY_SRC) выравнивает ключи без единого изменения в
# проекте. Замерено на mutmut 3.7.0: с утверждениями 5 из 5 убито, с вырезанными —
# 0 из 5 при зелёном pytest (§3.7). `also_copy` в дефолте берёт `tests/` относительно
# cwd, поэтому `backend/tests` копируется сам, без настройки.
MUT_CWD=$(dirname "$PY_SRC")            # backend/app → backend;  app → .
MUT_SRC=$(basename "$PY_SRC")           # имя пакета: то, что ждём в source_paths
[[ "$MUTMUT" == /* ]] || MUTMUT="$REPO_ROOT/$MUTMUT"   # cwd сменится — путь абсолютный

# Версия читается, а не предполагается: в 3.x флага --paths-to-mutate НЕТ (жёсткая
# ошибка «No such option»), область берётся из конфига `[mutmut] source_paths`, а
# счётчики из `results` пропали — там теперь только выжившие, построчно. Проверено
# на mutmut 3.6.0.
# Версия берётся ТОЛЬКО из строки со словом `version`, а не первым числом из всего
# вывода. lab-12: `mutmut --version` печатает в stderr предупреждения о конфиге, а в
# них есть путь `…/python3.12/site-packages/…` — наивная грепа выхватывала оттуда
# «3.12» и объявляла её версией mutmut при фактической 3.7.0. Здесь совпало по
# мажору и потому прошло незамеченным, но ветка «2.x против 3.x» выбиралась бы по
# версии Python. Третий случай класса «наивный поиск числа находит похожее» — после
# id примера `A1` в проверке observability и хвоста версии в `test_prose_matches_payload`.
ver_out=$( cd "$REPO_ROOT/$MUT_CWD" && "$MUTMUT" --version 2>&1 )
MUT_VER=$(printf '%s\n' "$ver_out" \
  | grep -iE '(^|[^[:alnum:]])version[[:space:]]+v?[0-9]' \
  | grep -oE '[0-9]+\.[0-9]+(\.[0-9]+)?' | head -1)
if [[ -z "$MUT_VER" ]]; then
  # Три исхода, и они РАЗНЫЕ. Общий «версия не читается» стоит последним, иначе
  # конкретные были бы недостижимы — тот же промах, что уже ловил тест в undecided().
  if printf '%s\n' "$ver_out" | grep -q 'source_paths'; then
    # 3.x падает на импорте, если область не настроена, — даже на --version.
    printf '%s⚠ mutation: mutmut не может определить, что мутировать — гейт не судит.\n' "$yellow"
    printf 'Добавь в %s/pyproject.toml: [tool.mutmut] source_paths = ["%s"]%s\n' \
      "$MUT_CWD" "$MUT_SRC" "$reset"
  elif printf '%s\n' "$ver_out" | grep -q "No such option '--version'"; then
    # mutmut 2.x. Он НЕ поддерживается, и сказать это надо прямо: у 2.5.1 нет
    # `--version`, поэтому мажор по нему не определить в принципе; он зовёт `python`
    # (на macOS без активации venv такого файла нет) и падает на Python 3.14
    # (`cannot pickle 'itertools.count'`), последний релиз — 2023. Прежний канон
    # предлагал 2.x как рабочий выход из несовместимости раскладок — предлагал зря.
    printf '%s⚠ mutation: это mutmut 2.x — гейт его НЕ поддерживает и не судит.\n' "$yellow"
    printf 'Причина не в лени: у 2.x нет `--version` (мажор не определить), он зовёт\n'
    printf '`python`, и на Python 3.13+ падает при копировании AST. Релизов нет с 2023.\n'
    printf 'Ставь 3.x: pip install '"'"'mutmut>=3.6'"'"' (он в requirements-dev.txt шага 4).%s\n' "$reset"
  else
    printf '%s⚠ mutation: версия mutmut не читается — гейт не судит:%s\n' "$yellow" "$reset"
    printf '%s\n' "$ver_out" | head -3 >&2
  fi
  exit 0
fi

# Бюджет — жёсткий: timeout убивает прогон, и это НЕ провал гейта, а неполные
# данные. Молча считать «зелено» нельзя, поэтому печатаем явно.
out=$(mktemp); trap 'rm -f "$out"' EXIT

# 2.x не поддерживается СОЗНАТЕЛЬНО, и это замер, а не лень: у 2.5.1 нет флага
# `--version` вообще, поэтому мажор по нему не определить — прежняя ветка
# `MUT_MAJOR < 3` с `--paths-to-mutate` была недостижима by construction. Плюс он
# зовёт `python` (которого на macOS без venv-активации нет) и падает на Python 3.14
# (`cannot pickle 'itertools.count'`); последний релиз — 2023.
#
# ⚠ ОБЛАСТЬ. До cqg@1.55 здесь стояло «3.x не умеет ограничивать область», и это
# было неверно: флага действительно нет, но `mutmut run` принимает **имена мутантов
# позиционно** и фильтрует их `fnmatch`-глобом. Значит замысел гейта («только
# изменённые файлы + бюджет») выполним, и цена прогона становится пропорциональна
# диффу, а не размеру пакета. Замерено: на двух модулях полный прогон — 25 мутантов,
# `mutmut run 'app.calc.*'` — 10.
#
# И это не только про время. Порог `MIN_KILLED` применяется к НАСЕЛЕНИЮ мутантов:
# считая по всему пакету, гейт судил бы автора диффа за легаси-модуль, который он не
# трогал, — то есть был бы красным навсегда на любом проекте с непокрытым старым
# кодом. Ровно тот провал, который у гейта сложности лечили снимком-ратчетом.
mut_globs=()
while IFS= read -r f; do
  [[ -n "$f" ]] || continue
  rel=${f#"$MUT_CWD"/}                 # backend/app/calc.py → app/calc.py
  rel=${rel%.py}
  rel=${rel%/__init__}                 # пакетный __init__ = сам пакет
  mut_globs+=("${rel//\//.}.*")        # app/calc → app.calc.*
done < <(printf '%s\n' "$changed")

# Население обязано быть РОВНО диффом, поэтому каталог мутантов пересоздаётся.
# Иначе на тёплом `mutants/` статистика возвращает результаты и по нетронутым
# модулям (замерено: 20/5 из 25 вместо 9/1 из 10), и процент считался бы по пакету.
# Кэш при сужении области почти ничего не экономит: тестируются только мутанты
# диффа. Охрана на имя каталога — чтобы `rm -rf` не мог уехать никуда ещё.
mut_dir="$REPO_ROOT/$MUT_CWD/mutants"
[[ "$mut_dir" == */mutants ]] && rm -rf "$mut_dir"

printf 'mutation: область — %s (глобы: %s), запуск из %s\n' \
  "$(printf '%s файл(ов)' "$n")" "${mut_globs[*]}" "$MUT_CWD"

if [[ -n "$TIMEOUT_BIN" ]]; then
  ( cd "$REPO_ROOT/$MUT_CWD" && "$TIMEOUT_BIN" "$BUDGET_SEC" "$MUTMUT" run "${mut_globs[@]}" ) >"$out" 2>&1
else
  ( cd "$REPO_ROOT/$MUT_CWD" && "$MUTMUT" run "${mut_globs[@]}" ) >"$out" 2>&1
fi
rc=$?
if (( rc == 124 )); then
  printf '%s⚠ mutation: бюджет %ss исчерпан — данные неполные, гейт не судит%s\n' \
    "$yellow" "$BUDGET_SEC" "$reset" >&2
  printf 'Сузь область (MIN файлов) или подними BUDGET_SEC в CI.\n' >&2
  exit 0
fi

# Счётчики. Три источника, по убыванию надёжности — потому что формат менялся, и
# «не распарсилось» обязано отличаться от «мутантов нет» (иначе гейт зелен на
# непроверенном — тот же класс, что deps-audit с py_total=0):
#   1) export-cicd-stats -> mutants/mutmut-cicd-stats.json (машинный, стабильный);
#   2) прогресс-строка прогона: "🎉 1 🫥 0  ⏰ 0  🤔 0  🙁 0 …" (берём последнюю);
#   3) `mutmut results` с той же эмодзи-сводкой.
# Все три читаются ИЗ КОРНЯ ИМПОРТОВ: `mutants/` лежит рядом с пакетом, а не в
# корне репозитория. До cqg@1.54 путь был repo-root-относительным, и на раскладке
# `backend/` первый источник не находился бы никогда.
killed=""; survived=""
stats="$REPO_ROOT/$MUT_CWD/mutants/mutmut-cicd-stats.json"
if ( cd "$REPO_ROOT/$MUT_CWD" && "$MUTMUT" export-cicd-stats >/dev/null 2>&1 ) && [[ -f "$stats" ]]; then
  killed=$(grep -oE '"killed"[[:space:]]*:[[:space:]]*[0-9]+' "$stats" | grep -oE '[0-9]+$' | head -1)
  survived=$(grep -oE '"survived"[[:space:]]*:[[:space:]]*[0-9]+' "$stats" | grep -oE '[0-9]+$' | head -1)
fi
if [[ -z "$killed" && -z "$survived" ]]; then
  killed=$(grep -oE '🎉 *[0-9]+' "$out" | grep -oE '[0-9]+' | tail -1)
  survived=$(grep -oE '🙁 *[0-9]+' "$out" | grep -oE '[0-9]+' | tail -1)
fi
if [[ -z "$killed" && -z "$survived" ]]; then
  res=$( cd "$REPO_ROOT/$MUT_CWD" && "$MUTMUT" results 2>/dev/null )
  killed=$(printf '%s\n' "$res" | grep -oE '🎉 *[0-9]+' | grep -oE '[0-9]+' | head -1)
  survived=$(printf '%s\n' "$res" | grep -oE '🙁 *[0-9]+' | grep -oE '[0-9]+' | head -1)
fi

# Ни один источник не дал числа. Причин несколько, и они РАЗНЫЕ: ключи мутантов не
# совпали с путями импорта, mutmut не смог запустить pytest, мутанты не покрыты,
# mutmut упал (rc != 0), формат вывода незнаком. Каждая печатается с уликами, и ни
# одна не притворяется диагнозом «нет тестов».
# Один разборщик на ВСЕ исходы «гейт не судит»: конкретная причина обязана бить
# общую, а улика печатается всегда. До lab-12 конкретные причины были распределены
# по двум местам, и та, что стояла позже, была недостижима: mutmut выходил rc=1,
# срабатывала общая ветка «завершился с кодом 1», а настоящая причина (не смог
# запустить pytest / мутанты не покрыты) не называлась никогда. Тест поймал это
# на первой же попытке — ветку писали, а достижимость не проверили.
undecided() {
  # Расхождение ключей — самый вероятный исход на непривычной раскладке, и апстрим
  # называет его сам. Ветка стоит ПЕРВОЙ, потому что mutmut при этом выходит rc=0:
  # общая ветка «завершился с кодом N» его бы не поймала, а «мутанты не
  # сгенерированы» соврала бы про тесты.
  if grep -q 'Filtered for specific mutants, but nothing matches' "$out"; then
    # Изменённые файлы не дали ни одного мутанта: константы, только импорты,
    # `__all__`. Это честный «нечего судить», а НЕ «тесты плохие» и не поломка
    # гейта — иначе исполнитель увидел бы трассировку AssertionError апстрима.
    printf '%smutation: изменённые файлы не дали мутантов (константы? только импорты?)\n' "$yellow"
    printf 'Область была: %s. Гейт не судит — судить нечего.%s\n' "${mut_globs[*]}" "$reset"
  elif grep -q 'none match any mutant key' "$out"; then
    printf '%s⚠ mutation: путь импорта пакета не совпал с путём файла — гейт не судит\n' "$yellow"
    printf '(тесты тут ни при чём). mutmut выводит ключ мутанта ИЗ ПУТИ ФАЙЛА, и он обязан\n'
    printf 'совпасть с тем, как тесты импортируют пакет. Гейт уже запускается из `%s`,\n' "$MUT_CWD"
    printf 'то есть ждёт `import %s...`. Расхождение обычно даёт лишний `pythonpath` или\n' "$MUT_SRC"
    printf 'sys.path-инъекция в conftest. Ключи, которые не сошлись, — в выводе ниже.%s\n' "$reset"
  elif grep -qE 'BadTestExecutionCommandsException|Failed to run pytest' "$out"; then
    printf '%s⚠ mutation: mutmut не смог ЗАПУСТИТЬ pytest — гейт не судит (тесты тут ни при чём).\n' "$yellow"
    printf 'mutmut копирует `source_paths` в `%s/mutants/` и гоняет pytest ИЗ НЕГО,\n' "$MUT_CWD"
    printf 'поэтому путь до тестов обязан резолвиться оттуда. `also_copy` в дефолте берёт\n'
    printf '`tests/` относительно `%s` — если тесты лежат иначе, добавь их туда.\n' "$MUT_CWD"
    printf 'Диагноз апстрима включается `debug=true` в [tool.mutmut].%s\n' "$reset"
  elif grep -qE 'could not find any test case|do not cover any code' "$out"; then
    printf '%s⚠ mutation: pytest запустился, но НИ ОДИН мутант не покрыт тестами — гейт не судит.\n' "$yellow"
    printf 'Тесты импортируют установленный пакет, а не мутированную копию из\n'
    printf '`%s/mutants/` — измерено на mutmut %s. Это НЕ «тесты ничего не\n' "$MUT_CWD" "$MUT_VER"
    printf 'утверждают»: см. §3.7.%s\n' "$reset"
  elif (( rc != 0 )); then
    printf '%s⚠ mutation: mutmut %s завершился с кодом %s — гейт не судит, вывод ниже%s\n' \
      "$yellow" "$MUT_VER" "$rc" "$reset" >&2
  elif [[ -n "${1:-}" ]]; then
    printf '%s⚠ mutation: мутанты не сгенерированы (пустые файлы? нет тестов?) — гейт не судит%s\n' \
      "$yellow" "$reset"
  else
    printf '%s⚠ mutation: счётчики не найдены в выводе mutmut %s — формат незнаком,\n' \
      "$yellow" "$MUT_VER"
    printf 'гейт не судит (это НЕ «мутантов нет»). Вывод ниже.%s\n' "$reset" >&2
  fi
  tail -15 "$out" >&2
  exit 0
}

if [[ -z "$killed" && -z "$survived" ]]; then
  undecided
fi

killed=${killed:-0}; survived=${survived:-0}
total=$((killed + survived))

if (( total == 0 )); then
  # Счётчики есть, но нули: тот же разборщик, аргумент включает ветку
  # «мутанты не сгенерированы» как ПОСЛЕДНЮЮ, а не как единственную.
  undecided empty
fi

pct=$(( killed * 100 / total ))
printf 'mutation: убито %d из %d (%d%%), выжило %d\n' "$killed" "$total" "$pct" "$survived"

if (( pct >= MIN_KILLED )); then
  printf '%smutation: OK%s\n' "$green" "$reset"
  exit 0
fi

printf '\n%sERROR%s: убито %d%% мутантов, цель ≥%d%%.\n' "$red" "$reset" "$pct" "$MIN_KILLED" >&2
# Улика обязательна: красный гейт без списка выживших учит искать не там.
# Список даёт `results`, а НЕ `show`: у 3.x `show` требует имя мутанта
# (`Error: Missing argument 'MUTANT_NAME'`), и голый вызов печатал только эту
# ошибку — под `2>/dev/null` не печатал вообще ничего. То есть обвинение
# предъявлялось без улик всё время существования ветки.
printf 'Выжившие мутанты = поведение, которое тесты НЕ проверяют:\n' >&2
( cd "$REPO_ROOT/$MUT_CWD" && "$MUTMUT" results 2>/dev/null ) | grep -F survived | head -30 >&2
printf 'Разобрать конкретный: cd %s && mutmut show <имя-из-списка>\n' "$MUT_CWD" >&2
printf 'Починка: добавить утверждения на выжившие случаи, а не поднимать порог.\n' >&2
[[ "$STRICT" == "0" ]] && { printf '%sWARNING (STRICT=0)%s\n' "$yellow" "$reset" >&2; exit 0; }
exit 1
