---
title: "Voice Interview Coach"
oneLiner: "A fully local voice interviewer that runs a real mock interview and returns a grounded review."
metric: "~3 s voice turn"
status: "local-demo"
stack: ["Python", "FastAPI", "Ollama", "whisper.cpp", "Piper", "React"]
proof:
  github: "https://github.com/AnthonyPriceOne2691/voice-coach"
contract: "Every generated sentence is validated before it is spoken: English-only, no coaching, at most three sentences, one question per turn."
featured: false
order: 2
updated: 2026-08-04
draft: false
---

Speech in, speech out, nothing leaves the machine: whisper.cpp transcribes, a
local LLM runs the interview under a behavioral contract, Piper speaks the reply.
The review afterwards is grounded in the transcript rather than generated from
scratch.

Placeholder content for the contour bootstrap — the real page copy lands with the
MVP delivery.
