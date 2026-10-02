---
title: "Quality contour: senior-team standards for AI-built software"
oneLiner: "The quality system behind every service I ship: AI coding agents write at team speed, and automatic checks on every change hold the result to the level of a senior engineering team."
metric: "2 services live in under 3 weeks"
status: "production"
stack: ["Python", "Bash", "pre-commit", "GitHub Actions", "dependency-cruiser"]
proof:
  brief: "/briefs/agent-contour.pdf"
  video: "/demo-agent-contour.mp4"
  captions:
    en: "/demo-agent-contour.vtt"
    ru: "/demo-agent-contour.ru.vtt"
  poster: "/poster-agent-contour.jpg"
contract: "Only what a mechanism can reject counts as done: a gate that cannot turn red is treated as broken."
featured: false
order: 2
updated: 2026-10-02
draft: false
---

**The problem:** AI coding agents are fast — and happily report “done” on things
nobody checked. That is how prototypes end up in production.

**The result:** software built at AI speed and checked like a corporate product. Two
services for an SEO agency went from a bare spec to production in under three weeks,
in parallel.

- **22 automatic checks on every change** — tests, code quality, architecture, security; nothing merges while a check is red
- **The checks are checked:** a “doctor” plants a known mistake in front of every check — a check that stays silent is flagged as broken
- **Lean on purpose:** the number of checks is capped; a new one comes in only by replacing an old one
- **Proven in the field:** runs in eight repositories, including this site; every missed problem is logged together with the check that should have caught it
- **A written rulebook behind it:** 22,000+ lines across four documents — searchable through my RAG desk
