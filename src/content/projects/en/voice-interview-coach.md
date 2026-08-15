---
title: "Voice Interview Coach"
oneLiner: "A fully offline voice AI: a 15-minute mock technical interview, then a spoken review of your answers."
metric: "~3 s per turn"
status: "local-demo"
stack:
  ["Python", "FastAPI", "WebSocket", "whisper.cpp", "Ollama", "Piper", "React"]
proof:
  github: "https://github.com/AnthonyPriceOne2691/voice-coach"
contract: "Every sentence passes a contract before it is spoken: English-only, no coaching, at most three sentences, one question per turn."
featured: false
order: 2
updated: 2026-07-20
draft: false
---

Speech in, speech out, nothing leaves the machine: whisper.cpp transcribes, a
local LLM runs the interview under a behavioral contract, Piper speaks the reply.

- A sentence-streaming pipeline cuts perceived latency from 4.8 s to 3.0 s
- Every sentence passes a contract gate before it is spoken
- Afterwards: a rubric summary and a vocabulary bank, generated offline

The review is grounded in the transcript rather than generated from scratch.
