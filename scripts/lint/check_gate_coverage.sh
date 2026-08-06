#!/usr/bin/env bash
# МЕТА-ГЕЙТ: каждый гейт обязан быть ПОДКЛЮЧЁН, а не просто существовать.
#
# Зачем. `pre-commit run --all-files` доказывает исправность хуков, ПЕРЕЧИСЛЕННЫХ
# в конфиге, и молчит о недостающих: невключённый гейт неотличим от проходящего.
# Реальный случай (2026-07-27): скрипт jscpd был извлечён и даже адаптирован под
# язык проекта, но не вписан в .pre-commit-config.yaml — приёмка показала 7/7
# зелёных, потому что проверяла «работает ли подключённое», а не «подключено ли
# всё требуемое». Этот гейт закрывает класс ошибки, а не тот один случай.
#
# Что проверяет (в обе стороны):
#   1. Каждый скрипт в $LINT_DIR упомянут хотя бы в одном месте принуждения
#      (pre-commit / CI-workflow / merge_guard / Makefile / justfile).
#   2. Каждый путь `scripts/...`, упомянутый в конфигах, существует на диске
#      (ловит опечатку и удалённый скрипт — «хук есть, гейта нет»).
#
# Осознанно неподключённые перечисляются в is_exempt() С ПРИЧИНОЙ. Отсутствие
# в конфиге должно быть решением в коде, а не пробелом.
#
# Настройка (env): LINT_DIR (дефолт scripts/lint), STRICT=0 — soft.
#
# Режимы:
#   check_gate_coverage.sh          # проверка; exit 1 при непокрытом гейте
#   STRICT=0 check_gate_coverage.sh # soft (warning, exit 0)

set -uo pipefail

STRICT=${STRICT:-1}
LINT_DIR=${LINT_DIR:-scripts/lint}

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$REPO_ROOT" || exit 1

red=$(printf '\033[31m'); yellow=$(printf '\033[33m'); green=$(printf '\033[32m'); reset=$(printf '\033[0m')

# Осознанно НЕ подключённые — причина ОБЯЗАТЕЛЬНА и печатается на каждом прогоне.
# Не список имён в комментарии: причина — это состояние проекта, которое меняется
# («тестов нет», «нет TS»), и когда оно изменится, устаревшее исключение должно
# быть видно глазами на каждом прогоне, а не лежать в коде.
# `case`, а не `declare -A`: на macOS системный bash 3.2 без ассоциативных массивов.
#
# Исключение здесь часто означает `*-oracles: weak` в delivery/active/STATUS.md
# (Delivery §3.1) — не забудь отметить там же.
#
# Этот файл в исключения НЕ вносится: мета-гейт, который сам никем не вызывается,
# — ровно та дыра, от которой он защищает, на уровень выше.
# --- Проектные исключения ролей (cqg@1.67) ------------------------------------
# `not_wired_reason()` ниже — исключения САМОГО КАНОНА, одинаковые везде. Но есть
# второй, куда более частый случай: роль каталога §3 неприменима НА ЭТОМ СТЕКЕ.
# Карта ролей §Применимость велит пометить такую строку `n/a + причина`, а
# механики для этого не было вовсе — и последствия замерены на живом
# Astro/TS-проекте: четыре python-правила и хук mypy остались подключёнными и
# красными, потому что зовут `backend/.venv/bin/python`, которого нет.
#
# Выключить их правкой ЭТОГО скрипта нельзя: payload сверяется байт-в-байт
# (`assert_digest.sh`), и проект, поправивший `not_wired_reason()`, разъезжается
# с каноном навсегда. Поэтому объявление живёт в файле ПРОЕКТА — тот же приём,
# что `canaries.json` (cqg@1.64):
#
#   scripts/lint/not-applicable.json
#   {
#     "check_ast_gate.py:silent-except": "нет python-кода: проект на Astro/TS",
#     "check_deps_audit.sh": "python-манифеста нет; npm-половина работает"
#   }
#
# Ключ — имя скрипта ИЛИ `имя:правило`: гранулярность правила обязательна, потому
# что `check_ast_gate.py` несёт четыре правила разом, и «выключить всё или
# ничего» здесь означало бы выключить всё.
#
# Причина ОБЯЗАТЕЛЬНА и печатается на каждом прогоне — как у `not_wired_reason()`,
# и по той же причине: состояние проекта меняется («тестов нет», «нет TS»), и
# устаревшее исключение должно попадаться на глаза, а не лежать в файле.
NA_FILE="$LINT_DIR/not-applicable.json"
na_reasons=""
if [[ -f "$NA_FILE" ]]; then
  PY_NA=$(command -v python3 2>/dev/null || true)
  if [[ -z "$PY_NA" ]]; then
    printf '%s⚠ есть %s, но python3 не найден — проектные исключения НЕ прочитаны.\n' \
      "$yellow" "$NA_FILE"
    printf 'Это не «исключений нет»: они объявлены и не применены.%s\n' "$reset"
  else
    # stderr забирается ВМЕСТЕ с stdout, и только на ошибке. Первая редакция
    # печатала `$na_reasons` (то есть stdout) в сообщении об ошибке, а диагноз
    # питон писал в stderr — выходило «не применён: » с пустым местом там, где
    # должна стоять причина. Гейт, не назвавший причину, — тот же класс, что
    # «пропуск с чужим диагнозом»: поймано собственным тестом.
    na_out=$("$PY_NA" - "$NA_FILE" 2>&1 <<'PYNA'
import json, sys
try:
    data = json.load(open(sys.argv[1], encoding="utf-8"))
except Exception as exc:
    sys.stderr.write("не разобран как JSON (%s)\n" % exc)
    raise SystemExit(2)
if not isinstance(data, dict):
    sys.stderr.write("ожидался объект {ключ: причина}\n")
    raise SystemExit(2)
for k, v in data.items():
    reason = str(v).strip()
    if not reason:
        sys.stderr.write("%s: объявление БЕЗ причины\n" % k)
        raise SystemExit(3)
    sys.stdout.write("%s\t%s\n" % (k, reason))
PYNA
)
    na_rc=$?
    if (( na_rc != 0 )); then
      printf '%s✗ %s не применён:%s\n' "$red" "$NA_FILE" "$reset" >&2
      printf '%s\n' "$na_out" | sed 's/^/  /' >&2
      printf 'Исключение без причины исключением не является (карта ролей\n' >&2
      printf '§Применимость): «не думали» и «подумали и нет» обязаны различаться\n' >&2
      printf 'в тексте, а не в тишине.\n' >&2
      exit 1
    fi
    na_reasons="$na_out"
  fi
fi

# Причина исключения по ключу `<скрипт>` или `<скрипт>:<правило>`; пусто — нет.
na_reason() {
  [[ -n "$na_reasons" ]] || return 1
  local hit
  hit=$(printf '%s
' "$na_reasons" | awk -F'	' -v k="$1" '$1 == k { print $2; exit }')
  [[ -n "$hit" ]] || return 1
  printf '%s' "$hit"
}

not_wired_reason() {
  case "$1" in
    check_diff_coverage.sh)
      echo "ручной DoD-шаг (§3.5): полный сьют — минуты; в CI подключён отдельным шагом" ;;
    check_gate_value.sh)
      # Это не гейт, а измерительный инструмент: он ничего не запрещает и всегда
      # exit 0. Гоняется периодически (раз в ~10 поставок) при ревизии контура —
      # Delivery §9.1a. Подключать в pre-commit/CI незачем.
      echo "измерительный инструмент, не гейт: ревизия контура раз в ~10 поставок (Delivery §9.1a)" ;;
    check_mutation_gate.sh)
      # Подключён в CI на PR, но не в pre-commit: минуты против бюджета 5 секунд.
      # Строка нужна, если в проекте CI ещё нет — иначе мета-гейт ругался бы верно.
      echo "CI-only на PR (§8.6: минуты не влезают в бюджет pre-commit)" ;;
    check_new_dependency.py)
      # Нужен remote-ref (BASE) для сравнения множеств зависимостей: на коммите
      # его может не быть, и гейт молча пропускал бы находки. То же основание,
      # что у check_baseline_ratchet.sh. С cqg@1.55 он ВПИСАН в pre-push, поэтому
      # эта ветка нормально не достигается — остаётся для проектов, где pre-push
      # не поставлен. Прежний текст говорил «CI-only» и после переноса врал.
      echo "не на коммите: нужен remote-ref BASE (штатное место — pre-push, §8.5)" ;;
    contour_doctor.py)
      # Диагностический инструмент, не гейт: он ничего не запрещает в коммите, а
      # отвечает «что здесь на самом деле судит». Гоняется руками при развёртывании
      # и на приёмке (§6), плюс после смены раскладки/окружения. В pre-commit ему
      # нечего делать: он поднимает временные репозитории под канарейки.
      echo "диагностический инструмент, не гейт: прогон при развёртывании и на приёмке (§6)" ;;
    *) return 1 ;;
  esac
}

# nullglob убирает нераскрывшиеся ГЛОБЫ, но не литеральные имена: каждый
# фиксированный путь проверяется через [[ -f ]], иначе список «мест принуждения»
# никогда не бывает пустым и проверка ниже становится мёртвым кодом.
shopt -s nullglob
CONFIGS=()
for fixed in .pre-commit-config.yaml .gitlab-ci.yml scripts/merge_guard.sh Makefile justfile; do
  [[ -f "$fixed" ]] && CONFIGS+=("$fixed")
done
CONFIGS+=(.github/workflows/*.yml .github/workflows/*.yaml)

if (( ${#CONFIGS[@]} == 0 )); then
  printf '%sERROR%s: не найдено ни одного места принуждения (.pre-commit-config.yaml / CI).\n' "$red" "$reset" >&2
  printf 'Гейты без подключения не работают — см. §5 шаги 5 и 8.\n' >&2
  # STRICT=0 обязан смягчать КАЖДУЮ красную ветку: soft-режим, который местами
  # твёрдый, — это документированное обещание, которое не выполняется (lab-11 F5).
  [[ "$STRICT" == "0" ]] && { printf '%sgate-coverage: WARNING (STRICT=0)%s\n' "$yellow" "$reset" >&2; exit 0; }
  exit 1
fi

# git ls-files, а не файловый glob: считаем только ОТСЛЕЖИВАЕМЫЕ файлы — так же,
# как остальные гейты CQG (§4). Локальный черновик в рабочем дереве гейтом не
# является, и ругаться на него — ложное срабатывание.
gates=()
while IFS= read -r p; do
  [[ -n "$p" ]] && gates+=("$p")
done < <(git ls-files "$LINT_DIR/check_*.sh" "$LINT_DIR/check_*.py")

# Ноль гейтов — ОШИБКА, а не «пропуск». Этот скрипт лежит в $LINT_DIR, значит CQG
# разворачивается; пустой список означает «скрипты не закоммичены» или «сломан
# LINT_DIR». Мягкий пропуск здесь был бы тем самым тихо-зелёным проходом, ради
# которого гейт и написан.
if (( ${#gates[@]} == 0 )); then
  printf '%sERROR%s: в %s нет отслеживаемых гейт-скриптов (check_*.sh|py).\n' "$red" "$reset" "$LINT_DIR" >&2
  printf 'Только что создал? `git add %s` — untracked не считается.\n' "$LINT_DIR" >&2
  exit 1
fi

# --- Карта ролей обязана совпадать с деревом (cqg@1.70) -----------------------
# `delivery/STACK-ACCEPTANCE.md` — то, чем проект ОТВЕЧАЕТ на вопрос «что здесь
# закрыто». До сих пор её не читал никто: чистая проза, заполняемая руками.
#
# Замер, из которого правило родилось (Astro/TS): в карте стояло четыре ✅ —
# `file-length` «маска изменена», `eslint`, его ратчет и `prettier`
# «подключён», — а в конфиге маски остались шаблонными, и все четыре смотрели в
# пустоту. Плюс ✅ у `jscpd`, которого в проекте не установлено вовсе. Пять
# ложных строк в документе, который для читателя и есть ответ про покрытие.
#
# Сверяется НЕ «работает ли гейт» (это A1 и канарейка), а согласованность
# ЗАЯВЛЕНИЯ с механикой: ✅ против объявленного `n/a`, `n/a` без объявления,
# ссылка на несуществующий скрипт. Заявление и механика расходятся молча — и
# именно это молчание документ и продаёт как покрытие.
MAP_FILE="delivery/STACK-ACCEPTANCE.md"
if [[ -f "$MAP_FILE" && -n "${PY_NA:-$(command -v python3 2>/dev/null || true)}" ]]; then
  # Причина бывает ДВУХ законных происхождений, и обе печатаются на прогоне:
  # проектная (not-applicable.json) и канонная (not_wired_reason() — ручной
  # DoD-шаг, измерительный инструмент, CI-only). Первая редакция знала только
  # первую и обвинила check_diff_coverage.sh, у которого причина канонная и
  # видна на каждом прогоне. Ложное срабатывание — дефект проверки (§4.3b).
  # ⚠ Список считается ЗДЕСЬ, а не из массива `gates`: он заполняется ниже по
  # файлу, и первая редакция читала его пустым — то есть канонные причины не
  # учитывались вовсе, и проверка обвиняла всех подряд. Молчаливая пустота
  # массива вместо ошибки — ровно тот сорт отказа, против которого весь контур.
  canon_na=""
  while IFS= read -r g; do
    [[ -n "$g" ]] || continue
    b=$(basename "$g")
    not_wired_reason "$b" >/dev/null 2>&1 && canon_na="$canon_na$b "
  done < <(git ls-files "$LINT_DIR/check_*.sh" "$LINT_DIR/check_*.py" 2>/dev/null)
  map_out=$("${PY_NA:-python3}" - "$MAP_FILE" "$NA_FILE" "$LINT_DIR" "$canon_na" 2>&1 <<'PYMAP'
import json, os, re, sys
mp, na_file, lint_dir = sys.argv[1], sys.argv[2], sys.argv[3]
canon_na = set((sys.argv[4] if len(sys.argv) > 4 else "").split())
declared = {}
if os.path.isfile(na_file):
    try:
        declared = json.load(open(na_file, encoding="utf-8")) or {}
    except Exception:
        declared = {}          # битый файл ругается в своём месте, не тут
# ⚠ ДВА множества, и путать их — смысловая ошибка, а не небрежность:
#   not-applicable.json — роль НЕ покрыта: на этом стеке у неё нет предмета;
#   not_wired_reason()  — роль покрыта, просто не на коммите (pre-push, CI,
#                         ручной DoD-шаг) либо это инструмент, а не гейт.
# Первая редакция слила их и обвинила check_new_dependency.py: в карте честное
# (роль закрыта на pre-push), а проверка прочла канонную причину как
# «объявлен неприменимым». Для «плюс против n/a» годится ТОЛЬКО первое
# множество; для «n/a без объявления» — оба: причина печатается в обоих случаях.
na_scripts = {str(k).split(":")[0] for k in declared}
reasoned = na_scripts | canon_na

# Строка карты называет роль ЛИБО именем файла (check_jscpd_gate.sh), либо
# ярлыком (jscpd-DRY) — обе формы живые, и вторая встречается чаще: карта
# пишется человеком про роли, а не про файлы. Псевдоним выводится из имени
# скрипта, а не берётся из выдуманной таблицы соответствий: такая таблица
# разъехалась бы с каталогом §3 на первом же новом гейте.
#
# ⚠ Ни одного символа-бэктика в этом блоке: heredoc живёт внутри $( … ), и
# разбор bash на них спотыкается («unexpected EOF while looking for matching»)
# даже при закавыченном разделителе. Поймано прогоном, а не чтением.
def aliases(fname):
    stem = re.sub(r"^check_|_gate$|\.(sh|py)$", "", fname)
    stem = re.sub(r"_gate$", "", stem)
    return {fname.lower(), stem.lower(), stem.replace("_", "-").lower()}

scripts = [f for f in sorted(os.listdir(lint_dir))
           if f.startswith("check_") and f.endswith((".sh", ".py"))] \
    if os.path.isdir(lint_dir) else []
by_alias = {a: f for f in scripts for a in aliases(f)}

problems = []
for line in open(mp, encoding="utf-8"):
    if not line.lstrip().startswith("|"):
        continue
    names = []
    for tok in re.findall(r"\x60([^\x60]+)\x60", line):
        key = tok.strip().lower()
        # jscpd-DRY -> ярлык jscpd;  check_x.sh --rule y -> имя файла
        key = re.split(r"\s|--", key)[0].strip()
        for cand in (key, key.split("-")[0]):
            if cand in by_alias:
                names.append(by_alias[cand])
                break
    names = sorted(set(names))
    if not names:
        continue
    low = line.lower()
    claims_na = "n/a" in low or "⛔" in line
    claims_on = ("✅" in line or "подключ" in low) and not claims_na
    for n in names:
        if claims_on and n in na_scripts:
            problems.append(
                "%s: в карте ролей ✅, а в not-applicable.json объявлен n/a" % n)
        if claims_na and n not in reasoned and os.path.isfile(
                os.path.join(lint_dir, n)):
            problems.append(
                "%s: в карте ролей n/a, а объявления нет — причина живёт только "
                "в прозе и на прогонах не печатается" % n)
        if not os.path.isfile(os.path.join(lint_dir, n)) and claims_on:
            problems.append("%s: в карте ролей ✅, а скрипта в %s нет"
                            % (n, lint_dir))
for p in sorted(set(problems)):
    sys.stderr.write(p + "\n")
raise SystemExit(1 if problems else 0)
PYMAP
)
  if (( $? != 0 )); then
    printf '%s✗ карта ролей разошлась с деревом (%s):%s\n' "$red" "$MAP_FILE" "$reset" >&2
    printf '%s\n' "$map_out" | sed 's/^/  /' >&2
    printf 'Карта ролей — то, чем проект отвечает на вопрос «что закрыто».\n' >&2
    printf 'Заявление, разошедшееся с механикой, продаёт покрытие, которого нет.\n' >&2
    exit 1
  fi
fi

unwired=()
unwired_rules=()
exempted=0
rules_checked=0

# Все правила, РЕАЛЬНО вызванные в конфигах — собираем один раз и сравниваем
# точно (`grep -qxF`). Первая версия проверяла каждое имя anchored-регуляркой
# `--rule[[:space:]]+$rule([[:space:]]|$|")` и давала ложные срабатывания на
# подключённых правилах: `$` внутри группы ERE ведёт себя по-разному в
# реализациях grep — тот же класс, что §3.1a про замер портируемости.
wired_rules=$(grep -ohsE -- '--rule[[:space:]]+[A-Za-z0-9_-]+' "${CONFIGS[@]}" 2>/dev/null \
  | sed -E 's/^--rule[[:space:]]+//' | sort -u)
for path in "${gates[@]}"; do
  base=$(basename "$path")
  if reason=$(not_wired_reason "$base"); then
    printf '  ○ %-30s не подключён осознанно: %s\n' "$base" "$reason"
    exempted=$((exempted + 1))
    continue
  fi
  # Роль неприменима НА ЭТОМ СТЕКЕ — объявлено проектом, причина печатается.
  if reason=$(na_reason "$base"); then
    printf '  ○ %-30s n/a на этом стеке: %s\n' "$base" "$reason"
    exempted=$((exempted + 1))
    continue
  fi
  # -F: имя содержит точку, как regex она матчила бы лишний символ.
  if ! grep -qsF -- "$base" "${CONFIGS[@]}"; then
    unwired+=("$base")
    continue
  fi

  # --- Гранулярность ПРАВИЛА, а не файла (полевая находка F7).
  # Многоправильный скрипт считался подключённым, если в конфиге упомянут хотя
  # бы один его вызов. Правило `unstructured-log` прожило так целый релиз: было
  # в каталоге §3, в таблице §3.1 и в теле скрипта — и ни в одном конфиге.
  #
  # Поддержку флага определяем ГРЕПОМ, и только потом исполняем. Первая версия
  # этой проверки запускала `--list-rules` у каждого скрипта подряд — и повесила
  # мета-гейт: он вызвал сам себя (он тоже check_*.sh) и ушёл в рекурсию, а
  # `check_deps_audit.sh` при таком «опросе» полез бы в сеть. Опрос обязан быть
  # безопасным: только те скрипты, которые флаг объявили.
  if [[ "$base" != "$(basename "${BASH_SOURCE[0]}")" ]] \
     && grep -qsF -- '--list-rules' "$path"; then
    case "$path" in
      *.py) rules=$(python3 "$path" --list-rules 2>/dev/null) ;;
      *)    rules=$(bash "$path" --list-rules 2>/dev/null) ;;
    esac
    while IFS= read -r rule; do
      [[ -n "$rule" ]] || continue
      # Гранулярность ПРАВИЛА и здесь: `check_ast_gate.py` несёт четыре правила,
      # и на чужом стеке неприменимы обычно все — но объявлять их надо поимённо,
      # иначе «выключить одно» неотличимо от «выключить весь скрипт».
      if reason=$(na_reason "$base:$rule"); then
        printf '  ○ %-30s n/a на этом стеке: %s\n' "$base --rule $rule" "$reason"
        exempted=$((exempted + 1))
        continue
      fi
      rules_checked=$((rules_checked + 1))
      if ! printf '%s\n' "$wired_rules" | grep -qxF -- "$rule"; then
        unwired_rules+=("$base --rule $rule")
      fi
    done < <(printf '%s\n' "$rules")
  fi
done

# Обратная сторона: конфиг ссылается на скрипт, которого нет.
#
# Ссылка ПОД ОХРАНОЙ `[[ -f … ]]` пропускается. `merge_guard.sh` вызывает
# опциональные слои именно так — `[[ -f scripts/okf_sync_gate.py ]] && run_gate …`, —
# потому что контур разворачивается послойно (AGENT_STACK §2.C прямо называет
# конфигурацию без OKF рабочей, а CQG §5 шаг 9 ставит merge_guard внутри ② — до ③).
# Без этого исключения мета-гейт был НАВСЕГДА красным в разрешённой конфигурации
# ①②④: ругался на опциональный скрипт опционального слоя, который уже защищён
# охраной. Это §4.3b случай 1 — «гейт ругается на то, чего проверять не должен», а
# дальше по тому же §4.3b такой гейт сначала бесит, потом его снимают. Нашло восьмое
# развёртывание, в момент когда ② уже стоял, а ③ ещё нет.
missing=()
while IFS= read -r ref; do
  [[ -n "$ref" ]] || continue
  [[ -e "$ref" ]] && continue
  # Охрана в той же строке, где ссылка. Признаются ВСЕ ходовые формы:
  # `[[ -f X ]]` (bash), `[ -f X ]` (POSIX) и `test -f X`, с флагами -f/-x/-e.
  #
  # lab-12: признавалась только двойная скобка, а §8.3 этого же канона
  # поставляет `if [ -f scripts/okf_sync_gate.py ]; then` — одинарную, потому что
  # `run:` в GitHub Actions пишут в POSIX-стиле. В полном развёртывании дефект
  # МАСКИРУЕТСЯ: грепа ищет по всем конфигам сразу, и двойная скобка из
  # `merge_guard.sh` закрывает ссылку, найденную в workflow. Виден он там, где
  # merge_guard не развёрнут или форма другая, — и тогда мета-гейт красен на
  # конфигурации ①②④ без OKF, которую AGENT_STACK §2.C прямо называет рабочей.
  # То есть F6 второй раз: правку сделали на форму, а не на свойство «ссылка
  # защищена проверкой существования».
  guard="(\[\[?[[:space:]]+-[fxe][[:space:]]+\"?${ref//\//\\/}\"?[[:space:]]+\]\]?"
  guard="$guard|test[[:space:]]+-[fxe][[:space:]]+\"?${ref//\//\\/}\"?)"
  if grep -qhsE -- "$guard" "${CONFIGS[@]}" 2>/dev/null; then
    printf '%s  ○  %s: опционален (вызов под охраной -f) — слой не развёрнут%s\n' \
      "$yellow" "$ref" "$reset"
    continue
  fi
  missing+=("$ref")
done < <(grep -ohsE 'scripts/[A-Za-z0-9_/.-]+\.(sh|py)' "${CONFIGS[@]}" | sort -u)

# --- Незаполненный шаблон в КОНФИГЕ контура ---------------------------------
# Для полей STATUS канон это проверяет (`is_placeholder` в delivery_check), а для
# извлечённых конфигов не проверял ничего — и плейсхолдер доезжал до падения
# ЧУЖИМИ СЛОВАМИ. Развёртывание 2026-07-31: в `backend/.importlinter` остался
# `<pkg>` из шаблона, и `lint-imports` сказал «Could not find package '<pkg>'» —
# сообщение инструмента, из которого не видно, что это шаблонная дыра.
#
# Граница — где НАЧИНАЕТСЯ SHELL, а не где кончается расширение файла.
# В shell `<` — это редирект, heredoc и сравнение, поэтому *.sh не сканируются.
# Но shell живёт и ВНУТРИ yaml: блочные скаляры (`run: |`, `entry: |-`) в
# workflow и pre-commit — вложенные программы, и `<путь>` в тексте их
# diagnostic-сообщений — не поле шаблона. lab-11 (обе арки): гейт краснил
# БАЙТ-В-БАЙТ нетронутый quality.yml этого же канона за `<путь>` внутри echo,
# потому что границу держало расширение файла. Фильтруется ВЕСЬ скаляр:
# правка «на слово путь» повторила бы класс, а не закрыла его.
yaml_without_block_scalars() {
  awk '
    function ind(s,  p) { p = match(s, /[^ ]/); return p ? p - 1 : length(s) }
    {
      if (insc) {
        if ($0 ~ /^ *$/) next          # пустая строка скаляр не закрывает
        if (ind($0) > sci) next        # тело скаляра — вложенная программа
        insc = 0                       # отступ вернулся — скаляр кончился
      }
      if ($0 !~ /^[ \t]*#/ && $0 ~ /:[ \t]*[|>][+-]?[ \t]*$/) { insc = 1; sci = ind($0) }
      print                            # строка ключа — конфиг, сканируется
    }' "$1"
}
# Интерпретатор для сканера плейсхолдеров ниже: `python3`, `python` — как у
# соседних хуков. Нет ни одного — сканер молчит, и это честнее, чем grep,
# который «работал» и не находил.
PY_BIN=$(command -v python3 || command -v python || true)
if [[ -z "$PY_BIN" ]]; then
  printf '%s⚠ gate-coverage: питон не найден — проверка незаполненных шаблонов\n' "$yellow"
  printf 'в конфигах ПРОПУЩЕНА (не «шаблонов нет»). Остальные проверки идут.%s\n' "$reset"
fi
placeholders=()
for cfg in "${CONFIGS[@]}" backend/.importlinter .importlinter; do
  [[ -f "$cfg" ]] || continue
  case "$cfg" in
    *.yaml|*.yml)                      content=$(yaml_without_block_scalars "$cfg" 2>/dev/null) ;;
    *.ini|*.cfg|*.toml|*.importlinter) content=$(cat "$cfg" 2>/dev/null) ;;
    *) continue ;;
  esac
  # `<слово>` или `<слово|слово>`: форма шаблона канона. Строки-комментарии тоже
  # считаются: закомментированный плейсхолдер в конфиге — та же незаполненность.
  #
  # ⚠ ПОЧЕМУ ПИТОН, А НЕ `grep -oE`. Прежняя версия искала класс
  # `[A-Za-zА-Яа-я_]`, и **кириллический диапазон в POSIX-классе зависит от
  # локали**: GNU grep под `LC_ALL=C` (а это дефолт CI-раннеров) печатает
  # `grep: Invalid collation character` и **не находит НИЧЕГО**. То есть проверка
  # «незаполненный шаблон в конфиге» была мертва ровно в том слое, который канон
  # называет единственным неподделываемым, — и молча: stderr улетал в лог, а
  # сканер возвращал пустой список. Найдено красным CI этого репозитория
  # (8 прогонов подряд), воспроизведено локально не удалось: у macOS-grep
  # диапазон работает во всех локалях, поэтому «у меня зелено» держалось.
  # `re` в питоне работает с Unicode независимо от локали. Брат того же класса в
  # Delivery (`is_placeholder`) с самого начала на питоне — здесь остался
  # нетронутый.
  # Семантика НЕ унифицирована с Delivery намеренно: там `<pkg>` не находка
  # (иначе `List<int>` и `<100ms` в прозе краснили бы), здесь — находка, потому
  # что это дыра шаблона в конфиге (lab-10, `.importlinter`).
  [[ -n "$PY_BIN" ]] || continue
  while IFS= read -r hit; do
    [[ -n "$hit" ]] && placeholders+=("$cfg: $hit")
  done < <(printf '%s\n' "$content" | "$PY_BIN" -c '
import re, sys
pat = re.compile(r"<[A-Za-z\u0410-\u044f_][A-Za-z0-9\u0410-\u044f_|/. -]{0,30}>")
print("\n".join(sorted({m for m in pat.findall(sys.stdin.read())})))
' 2>/dev/null)
done
# exit НЕ здесь: находка уходит в общий разбор внизу, где STRICT=0 честно
# смягчает ВСЕ красные ветки. До правки exit 1 стоял ВЫШЕ проверки STRICT,
# и документированный soft-режим до этой ветки не доходил (lab-11 F5).

if (( ${#unwired[@]} == 0 && ${#missing[@]} == 0 && ${#unwired_rules[@]} == 0 && ${#placeholders[@]} == 0 )); then
  printf '%sgate-coverage: OK%s — %d скрипт(ов), подключено %d, осознанно нет %d; правил сверено %d (%d конфиг(ов))\n' \
    "$green" "$reset" "${#gates[@]}" "$(( ${#gates[@]} - exempted ))" "$exempted" \
    "$rules_checked" "${#CONFIGS[@]}"
  exit 0
fi

# Циклы под защитой (( ${#arr[@]} )): в bash 3.2 — штатном на macOS — раскрытие
# пустого массива "${arr[@]}" падает по `set -u`, даже если массив объявлен.
if (( ${#unwired[@]} )); then
  for b in "${unwired[@]}"; do
    printf '%s  ✗  %s: скрипт есть, но НЕ подключён (pre-commit / CI / merge_guard)%s\n' "$red" "$b" "$reset" >&2
  done
fi
if (( ${#missing[@]} )); then
  for m in "${missing[@]}"; do
    printf '%s  ✗  %s: упомянут в конфиге, но файла нет%s\n' "$red" "$m" "$reset" >&2
  done
fi
if (( ${#unwired_rules[@]} )); then
  for r in "${unwired_rules[@]}"; do
    printf '%s  ✗  %s: ПРАВИЛО не подключено (скрипт подключён, это правило — нет)%s\n' \
      "$red" "$r" "$reset" >&2
  done
fi
if (( ${#placeholders[@]} )); then
  printf '%sERROR%s: незаполненный шаблон в конфиге контура — процедура развёрнута наполовину:\n' \
    "$red" "$reset" >&2
  for p in "${placeholders[@]}"; do printf '  ✗  %s\n' "$p" >&2; done
  printf 'Подставь значения своего проекта. Иначе инструмент упадёт своими словами\n' >&2
  printf '(«Could not find package «<pkg>»»), и шаблонная дыра будет неотличима от бага.\n' >&2
fi

if [[ "$STRICT" == "0" ]]; then
  printf '%sgate-coverage: WARNING (STRICT=0)%s\n' "$yellow" "$reset" >&2
  exit 0
fi
printf '\n%sERROR%s: гейт без подключения = гейта нет. Впиши его в `.pre-commit-config.yaml`\n' "$red" "$reset" >&2
printf 'или в CI-шаг, либо объяви исключение с причиной в not_wired_reason() этого скрипта.\n' >&2
printf 'Сверься с таблицей §3 построчно — не собирай конфиг «по смыслу».\n' >&2
exit 1
