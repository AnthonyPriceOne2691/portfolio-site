---
title: "LinkBuilder: link building on autopilot"
oneLiner: "Finds sites, writes to webmasters, negotiates with AI drafts, pays and keeps every link live — the work of a team of five, run by one operator."
metric: "5 people → 1 operator"
status: "production"
stack: ["Python", "FastAPI", "PostgreSQL", "Redis/RQ", "React/TS", "OpenAI API"]
proof:
  brief: "/briefs/linkbuilder.pdf"
  video: "/demo-linkbuilder.mp4"
  captions:
    en: "/demo-linkbuilder.vtt"
    ru: "/demo-linkbuilder.ru.vtt"
  poster: "/poster-linkbuilder.jpg"
  teaser: "/teaser-linkbuilder.mp4"
contract: "No AI letter goes out unchecked: every draft is tested against ten written rules — budgets, payment terms, the language of the reply — before a person sees it, and an admin can switch the checks live, without a restart."
featured: true
order: 1
updated: 2026-09-30
draft: false
---

**The problem:** link building eats people. Finding sites, writing to webmasters,
haggling, paying and checking links took a team of five.

**The result:** in production, one operator ran the whole cycle — with no handoffs
between people.

- **Outreach at scale:** letters go out in controlled batches; replies land in one inbox with the deal stage and its owner
- **AI drafts, people decide:** a draft that breaks the rules — like offering money after the webmaster said the budget is frozen — is blocked, not sent
- **Links that stay bought:** every placement is re-checked; a lost link becomes a ticket and a letter asking for it back — after a second check, because nearly one "dead" link in five turned out to be alive
- **Money under control:** payment requests go through the service desk, with spend meters and alerts before a balance runs dry
- **Enterprise-grade:** 11,000+ automated tests, three user roles, 137 database migrations — built by one engineer with AI coding agents, under the quality contour
- **12,000+ emails sent, 97.9% delivered** on a 5,400-recipient campaign
