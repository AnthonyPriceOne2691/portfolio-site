---
title: "Answers from your documents — with the source"
oneLiner: "Ask your company’s documents a question and get an answer with the exact file and section — or an honest “not covered” instead of a made-up reply."
metric: "680 answers, 0 without an address"
status: "local-demo"
stack: ["Python", "Ollama", "qwen3:8b", "bge-m3", "BM25", "RRF"]
proof:
  brief: "/briefs/canon-rag.pdf"
contract: "A question the documents don’t cover stops at the gate: the AI never sees a line of them and answers “not covered”. Across 680 answers, not one came without an address — a real file and section, or “not covered”."
featured: false
order: 5
updated: 2026-09-30
draft: false
---

**The problem:** a team asks the same questions about internal rules, and a chatbot
that guesses is worse than none.

**The result:** a search desk that answers only from your documents and shows where
each answer came from.

- **Checkable answers:** an answer names the file and section it came from — open it and the same words are there
- **Knows its limits:** a question the documents don't cover gets “not covered”, not an invention
- **Measured, not assumed:** tested on 314 independent questions, with the weak spots written down next to the strong ones
- **Private:** runs on a laptop; no document leaves the building
- **Proven on a real rulebook:** four documents, 110K tokens — the rules my own development follows
