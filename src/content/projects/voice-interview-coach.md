---
title: "Voice Interview Coach"
oneLiner: "A voice interviewer that never goes online: 15 minutes of technical interview in English, then a spoken review."
metric: "~3 s per turn"
status: "local-demo"
stack:
  ["Python", "FastAPI", "WebSocket", "whisper.cpp", "Ollama", "Piper", "React"]
proof:
  github: "https://github.com/AnthonyPriceOne2691/voice-coach"
contract: "Every sentence passes a contract before it is spoken: English-only, no coaching, at most three sentences, one question per turn."
featured: false
order: 2
updated: 2026-09-22
draft: false
---

Speech in, speech out, nothing leaves the machine. The real work was not wiring
the pipeline but the latency: a pause longer than three seconds turns a
conversation into correspondence.

- Sentence-level streaming cuts a turn from 4.8 s to 3.0 s; first sound lands in ~1.3 s
- A reasoning model was measured and rejected for dialogue: 31–52 s per turn, kept for the offline review
- The interview structure is code, not prompting: alternating questions, a deterministic follow-up policy
- 176 backend tests at 94.9% coverage, 41 on the front end, gates before every commit

The review is grounded in the transcript rather than generated from scratch.
