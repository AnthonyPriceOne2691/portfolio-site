---
title: "Local Web Agent: competitor research in minutes"
oneLiner: "Give it a few links and a question — it reads the real sites, compares them, scores each one and shows the quote behind every confident fact. Runs on your laptop."
metric: "Every confident fact quoted"
status: "local-demo"
stack: ["Python", "FastAPI", "Playwright", "Ollama", "Qwen3 14B", "React"]
proof:
  github: "https://github.com/AnthonyPriceOne2691/local-web-agent"
  video: "/demo-local-web-agent.mp4"
  captions:
    en: "/demo-local-web-agent.vtt"
    ru: "/demo-local-web-agent.ru.vtt"
  poster: "/poster-local-web-agent.jpg"
  teaser: "/teaser-local-web-agent.mp4"
contract: "Every action is checked against 14 hard rules before it reaches the browser, and anything that can’t be undone — like paying — waits for a person."
featured: false
order: 3
updated: 2026-09-30
draft: false
---

**The problem:** comparing competitors by hand means hours of clicking through sites
and copying notes nobody double-checks.

**The result:** one question in — a scored comparison and a winner out, with a quote
behind every confident fact.

- **Reads the real web:** opens each site in a real browser and finds the pages that matter
- **A verdict you can act on:** every site is scored on the same criteria, side by side
- **Proof, not guesses:** a confident fact must match a quote on the page, or it is dropped; it also says what it didn't read
- **Safe on live sites:** fills in forms itself but stops before paying; captchas are left to a person
- **Private and open:** all AI runs on the laptop; 451 automated tests; the code is public
