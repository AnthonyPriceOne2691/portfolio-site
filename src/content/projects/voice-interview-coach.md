---
title: "Voice agent: talks in real time, works offline"
oneLiner: "An AI you talk to by voice — shown here as Henry, an English job interviewer. The same engine can run a support line, a booking assistant or a voice bot for your chat."
metric: "100% offline"
status: "local-demo"
stack:
  ["Python", "FastAPI", "WebSocket", "whisper.cpp", "Ollama", "Piper", "React"]
proof:
  brief: "/briefs/voice-interview-coach.pdf"
contract: "Every sentence is checked before it is spoken: English only, no scores during the interview, three sentences at most."
featured: false
order: 4
updated: 2026-09-30
draft: false
---

**The problem:** voice AI usually means a cloud bill, a pause that kills the
conversation, and your data on someone else's server.

**The result:** a voice agent that holds a real conversation on one laptop — here, a
mock job interviewer.

- **Feels like a conversation:** it answers within about three seconds of your last word, sentence by sentence
- **Smart, not chatty:** it knows the context, asks about what you actually said, and handles side requests — "slower, please", "where do I start?" — without losing the thread
- **Rules it can't be talked out of:** English only, no scores mid-interview, three sentences at most — checked in code before every sentence
- **Useful afterwards:** a written review with five scores, what to fix and better versions of weak answers
- **Built to last:** 205 automated tests covering 95% of the code

The same engine can become a support line, a booking assistant or a voice bot for
your chat — offline, or with the data kept in-house.
