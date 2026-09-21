---
title: "A quality contour for AI agents"
oneLiner: "A rulebook plus gates that deploy into any repository and stop an agent from reporting green on something unchecked."
metric: "53 gates"
status: "production"
stack: ["Python", "Bash", "pre-commit", "GitHub Actions", "dependency-cruiser"]
proof:
  github: "https://github.com/AnthonyPriceOne2691"
contract: "Only what a mechanism can reject counts as done: a gate that cannot turn red is treated as broken."
featured: false
order: 6
updated: 2026-09-21
draft: false
---

An agent ships work that **looks** finished. The usual failure is not bad code —
it is a green light over a check that verified nothing.

- 22,600 lines of canon across four documents, 53 gate scripts
- Deployed on six projects, including this site: gates run on every push
- A separate doctor audits the gates themselves: declared, wired and silent on its own canary counts as a lie
- Ratchets instead of bans: debt is legalised by a snapshot and may only shrink

Proven on itself: while this site was being built, the contour surfaced three
gates that were returning the wrong verdict while staying green.
