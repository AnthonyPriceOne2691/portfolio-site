#!/usr/bin/env python3
"""Оракул артефакта: судит СОБРАННЫЙ сайт, а не исходник (§6.5a).

Зачем он вообще. Пятнадцать ролей CQG развёрнуты, CI зелёный — и при этом до
07.08 ни одна проверка не читала `dist/`. Между «исходник корректен» и «продукт
правилен» лежала зона, которую не судило ничто, и «зелёный CI» читался как
«сайт в порядке», хотя не значил этого.

Что проверяется (acceptance-примеры B1, B8, B10):
  B1  — состав: обе языковые ветки, у каждой RU-страницы есть EN-двойник;
  B8  — `<head>` каждой страницы: og:*, hreflang ru/en/x-default (=RU),
        JSON-LD Person, title и description;
  B10 — вес страницы без медиа < 300 KB (design v0.8 §7.1.3).

Почему проверка именно здесь, а не в тестах компонентов: ошибка мета-слоя
появляется при СБОРКЕ и на конкретной странице. Компонент можно протестировать
и всё равно потерять тег на одном маршруте — а превью ссылки это нулевой экран
портфолио, его ломать нельзя молча.

Usage:
  python3 scripts/lint/check_dist_oracle.py [dist]
  STRICT=0 ... — soft (warning, exit 0)
"""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path

RED = "\033[31m"
YELLOW = "\033[33m"
GREEN = "\033[32m"
RESET = "\033[0m"

MAX_PAGE_KB = 300
DEFAULT_LOCALE = "ru"


def local_assets(html: str, page: Path, root: Path) -> list[Path]:
    """Локальные css/js, на которые ссылается страница: вес считается с ними."""
    out: list[Path] = []
    for m in re.finditer(r'(?:href|src)="(/[^"]+\.(?:css|js))"', html):
        p = root / m.group(1).lstrip("/")
        if p.is_file():
            out.append(p)
    return out


def check_head(html: str, rel: str) -> list[str]:
    """B8: мета-слой страницы. Каждая недостача называется отдельной строкой."""
    bad: list[str] = []
    need = {
        "og:title": r'property="og:title"',
        "og:description": r'property="og:description"',
        "og:url": r'property="og:url"',
        "og:image": r'property="og:image"',
        "og:locale": r'property="og:locale"',
        "<title>": r"<title>[^<]+</title>",
        "description": r'name="description" content="[^"]+"',
        "canonical": r'rel="canonical"',
        "JSON-LD Person": r'"@type"\s*:\s*"Person"',
    }
    for label, pattern in need.items():
        if not re.search(pattern, html):
            bad.append(f"{rel}: нет {label}")

    for lang in ("ru", "en", "x-default"):
        if not re.search(rf'hreflang="{re.escape(lang)}"', html):
            bad.append(f"{rel}: нет hreflang {lang}")

    # x-default обязан указывать на язык по умолчанию (RU, design v0.8 §7.3).
    # Проверяется отдельно: тег на месте, но ведущий не туда, — худший случай,
    # потому что выглядит правильным.
    m = re.search(r'hreflang="x-default" href="([^"]+)"', html)
    if m and re.search(r"/en(/|$)", m.group(1)):
        bad.append(f"{rel}: x-default ведёт на EN, а язык по умолчанию — RU")
    return bad


def main() -> int:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else "dist")
    strict = os.environ.get("STRICT", "1") == "1"

    if not root.is_dir():
        print(f"{YELLOW}⚠ dist-оракул: каталога {root} нет — сначала `npm run build`{RESET}")
        return 0 if not strict else 1

    pages = sorted(p for p in root.rglob("*.html"))
    if not pages:
        print(f"{YELLOW}dist-оракул: 0 файлов просмотрено{RESET} — в {root} нет html")
        return 1

    problems: list[str] = []
    ru_pages: set[str] = set()
    en_pages: set[str] = set()

    for page in pages:
        rel = str(page.relative_to(root))
        html = page.read_text(encoding="utf-8", errors="replace")

        # 404 — служебная страница, языковой пары и мета-слоя не требует.
        if rel != "404.html":
            problems += check_head(html, rel)
            key = rel[3:] if rel.startswith("en/") else rel
            (en_pages if rel.startswith("en/") else ru_pages).add(key)

        kb = (page.stat().st_size + sum(a.stat().st_size for a in local_assets(html, page, root))) / 1024
        if kb > MAX_PAGE_KB:
            problems.append(f"{rel}: {kb:.0f} KB — тяжелее бюджета {MAX_PAGE_KB} KB (§7.1.3)")

    # B1: ветки обязаны быть зеркальны. Разошлись — часть сайта существует
    # только на одном языке, и узнаётся это обычно от посетителя.
    for missing in sorted(ru_pages - en_pages):
        problems.append(f"нет EN-двойника: en/{missing}")
    for missing in sorted(en_pages - ru_pages):
        problems.append(f"нет RU-двойника: {missing}")

    if problems:
        print(f"{RED}ERROR{RESET}: оракул артефакта нашёл {len(problems)} проблем(ы):")
        for p in problems[:20]:
            print(f"  ✗ {p}")
        if not strict:
            print(f"{YELLOW}STRICT=0 — не роняю{RESET}")
            return 0
        return 1

    # Успех обязан назвать число (§6): молчание неотличимо от «не запускался».
    print(
        f"{GREEN}dist-оракул: OK{RESET} — просмотрено {len(pages)} файл(ов), "
        f"пар языков {len(ru_pages)}, бюджет {MAX_PAGE_KB} KB соблюдён"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
