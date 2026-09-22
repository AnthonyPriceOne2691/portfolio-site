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
updated: 2026-09-22
draft: false
---

Shipped and in production: outreach from finding a site to paying for it and
watching the placement, with no handoff between people.

- 11,000+ backend tests, 137 DB migrations, 27 Docker services — designed and built solo
- Contracts are specs in version control, one per agent: hard invariants that must never break, soft ones that are judged, and a drift score watching both
- Negotiation runs in six languages; the rules do not switch to English because they were written in it
- 12,000+ emails sent, 97.9% delivery on a 5,400-recipient campaign

Models run through an internal gateway. AI drafts, a human approves the send.
Relevance scoring runs on one shared embedding service instead of a copy of the
model inside every worker.
