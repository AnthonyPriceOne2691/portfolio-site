#!/usr/bin/env python3
"""Оракул артефакта: судит СОБРАННЫЙ сайт, а не исходник (§6.5a).

Зачем он вообще. Пятнадцать ролей CQG развёрнуты, CI зелёный — и при этом до
07.08 ни одна проверка не читала `dist/`. Между «исходник корректен» и «продукт
правилен» лежала зона, которую не судило ничто, и «зелёный CI» читался как
«сайт в порядке», хотя не значил этого.

Что проверяется (acceptance-примеры B1, B8, B10):
  B1  — состав: обязательные страницы на месте, языковой ветки `/en/` больше
        НЕТ, а обещанные редиректы с неё реально уехали в сборку;
  B8  — `<head>` каждой страницы: og:*, JSON-LD Person, title, description,
        canonical и `<html lang="en">`;
  B10 — вес страницы без медиа < 300 KB (design v0.8 §7.1.3).

⚠ 2026-09-22 сайт стал одноязычным. Проверки языковых пар и hreflang сняты
вместе с причиной — но на их место встала обратная: `/en/` не должен собраться
снова, а `_redirects` обязан доехать. Половина переезда хуже, чем оба его
конца: страница `/en/` из старой сборки и редирект на неё же дают петлю.

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
REQUIRED_PAGES = ("index.html", "about/index.html", "404.html")


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

    # Язык страницы объявлен один раз и должен быть английским: `lang="ru"`,
    # переживший переезд, — это скринридер, читающий английский текст русской
    # фонетикой, и никакой тест вёрстки этого не заметит.
    if not re.search(r'<html lang="en"', html):
        bad.append(f'{rel}: нет <html lang="en">')

    # Обещание перевода, которого нет: пара alternate-ссылок на одноязычном
    # сайте вреднее их отсутствия.
    if re.search(r"hreflang=", html):
        bad.append(f"{rel}: остался hreflang — сайт одноязычный с 2026-09-22")
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
    seen: set[str] = set()

    for page in pages:
        rel = str(page.relative_to(root))
        html = page.read_text(encoding="utf-8", errors="replace")

        seen.add(rel)
        # 404 — служебная страница, полного мета-слоя не требует.
        if rel != "404.html":
            problems += check_head(html, rel)

        kb = (page.stat().st_size + sum(a.stat().st_size for a in local_assets(html, page, root))) / 1024
        if kb > MAX_PAGE_KB:
            problems.append(f"{rel}: {kb:.0f} KB — тяжелее бюджета {MAX_PAGE_KB} KB (§7.1.3)")

    # B1: состав сборки.
    for required in REQUIRED_PAGES:
        if required not in seen:
            problems.append(f"нет обязательной страницы: {required}")
    for stale in sorted(p for p in seen if p.startswith("en/")):
        problems.append(f"осталась страница языковой ветки: {stale}")

    # Редиректы — часть артефакта, а не намерение. Файл лежит в `public/` и
    # попадает в `dist/` копированием; не доехал — старые ссылки `/en/…`
    # отдают 404, и узнать об этом можно только от того, кто по ним пришёл.
    redirects = root / "_redirects"
    if not redirects.is_file():
        problems.append("нет _redirects — ссылки /en/… отдадут 404")
        rules = 0
    else:
        text = redirects.read_text(encoding="utf-8", errors="replace")
        rules = len([ln for ln in text.splitlines() if ln.strip() and not ln.startswith("#")])
        for need in ("/en/ / 301", "/en/* /:splat 301"):
            if need not in text:
                problems.append(f"в _redirects нет правила «{need}»")

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
        f"редиректов {rules}, бюджет {MAX_PAGE_KB} KB соблюдён"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
