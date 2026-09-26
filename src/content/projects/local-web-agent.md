---
title: "Local Web Agent"
oneLiner: "A private research agent: drop in links, it browses the real sites, compares them and answers only with what it can quote."
metric: "443 tests"
status: "local-demo"
stack: ["Python", "FastAPI", "Playwright", "Ollama", "Qwen3 14B", "React"]
proof:
  github: "https://github.com/AnthonyPriceOne2691/local-web-agent"
contract: "Every action is checked against 14 hard rules before it reaches the browser — bounded recovery, auto-tightening on drift."
featured: false
order: 3
updated: 2026-09-26
draft: false
---

Not a scraper with selectors but an observe → plan → act loop over a real
browser, with vision over screenshots. Every model call runs on the laptop.

- A high-confidence fact must match a quote on the real page, or it is downgraded
- Facts read from a screenshot are tagged as vision and never get top confidence
- Actions are tiered by autonomy and reversibility: destructive ones are forbidden
- No anti-bot spoofing: the agent pauses and a human passes the challenge
- It states its own limit — "I did not read everything" is appended by code, because the model obeyed that instruction about half the time

An honest "not found" instead of an invention. Task in German, three sites, answer in German: the language comes from the question, not from a setting.
