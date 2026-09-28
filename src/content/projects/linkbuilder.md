---
title: "LinkBuilder — Outreach Automation Platform"
oneLiner: "What took a team of five ran on one operator: prospecting, AI-assisted negotiation, payment requests and placement control."
metric: "97.9% delivery"
status: "production"
stack: ["Python", "FastAPI", "PostgreSQL", "Redis/RQ", "React/TS", "OpenAI API"]
proof:
  brief: "/briefs/linkbuilder.pdf"
contract: "Every drafted email passes behavioral contracts held as versioned specs — payment invariants, governance caps, kill-switch — before a human ever sees it."
featured: true
order: 1
updated: 2026-09-26
draft: false
---

Ran in production: outreach from finding a site to requesting its payment and
watching the placement, with no handoff between people.

- 11,000+ backend tests, 137 DB migrations, 20+ background workers — designed and built solo
- Contracts are specs in version control, one per agent: hard invariants that must never break and soft ones that are judged
- The AI earns autonomy by measurement, not trust: shadow runs on real mail score every draft, and auto-send stays off until replay shows 70–80% of first replies go out unchanged
- Language is part of the contract: a reply must stay in the webmaster's language, checked by a detector rather than trusted to the prompt
- 12,000+ emails sent, 97.9% delivery on a 5,400-recipient campaign

AI drafts, a human approves the send. Relevance scoring runs on one shared
embedding service instead of a copy of the model inside every worker.
