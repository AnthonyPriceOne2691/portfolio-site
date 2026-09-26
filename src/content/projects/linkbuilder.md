---
title: "LinkBuilder — Outreach Automation SaaS"
oneLiner: "What took a team of five now runs on one operator: prospecting, AI-assisted negotiation, payments and placement control."
metric: "97.9% delivery"
status: "production"
stack: ["Python", "FastAPI", "PostgreSQL", "Redis/RQ", "React/TS", "OpenAI API"]
proof:
  case: "https://github.com/AnthonyPriceOne2691"
contract: "Every drafted email passes behavioral contracts held as versioned specs — payment invariants, governance caps, kill-switch — before a human ever sees it."
featured: true
order: 1
updated: 2026-09-26
draft: false
---

Shipped and in production: outreach from finding a site to paying for it and
watching the placement, with no handoff between people.

- 11,000+ backend tests, 137 DB migrations, 20+ queue workers — designed and built solo
- Contracts are specs in version control, one per agent: hard invariants that must never break, soft ones that are judged, and a drift score watching both
- The AI earns autonomy by measurement, not trust: shadow runs on real mail score every draft, and auto-send waits until the numbers clear the bar
- Language is part of the contract: a reply must stay in the webmaster's language, checked by a detector rather than trusted to the prompt
- 12,000+ emails sent, 97.9% delivery on a 5,400-recipient campaign

AI drafts, a human approves the send. Relevance scoring runs on one shared
embedding service instead of a copy of the model inside every worker.
