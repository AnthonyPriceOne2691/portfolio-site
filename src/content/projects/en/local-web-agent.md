---
title: "Local Web Agent"
oneLiner: "A private web-research agent: drop URLs into a chat, it browses real sites, compares them and returns a ranked, quote-verified report."
metric: "~180 tests"
status: "local-demo"
stack: ["Python", "FastAPI", "Playwright", "Ollama", "Qwen3 14B", "React"]
proof:
  github: "https://github.com/AnthonyPriceOne2691"
contract: "Every action is validated before it reaches the browser — under 10 ms per check, bounded recovery, auto-tightening on drift."
featured: false
order: 3
updated: 2026-07-20
draft: false
---

An observe → plan → act loop over a real browser, with local vision on
screenshots. Every model call runs on the laptop.

- A high-confidence fact must match a quote on the real page, or it is downgraded
- Actions are tiered by autonomy and reversibility: destructive ones are forbidden
- No anti-bot spoofing: the agent pauses and a human passes the challenge

An honest "not found" instead of an invention.
