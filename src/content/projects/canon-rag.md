---
title: "RAG over a rulebook"
oneLiner: "A search desk over 110K tokens of rules: it answers with an exact citation, or it says the question is not covered."
metric: "0 uncited answers"
status: "local-demo"
stack: ["Python", "Ollama", "qwen3:8b", "bge-m3", "BM25", "RRF"]
proof:
  github: "https://github.com/AnthonyPriceOne2691"
contract: "An answer without a (file, §) address is never emitted: out-of-corpus questions are refused by a gate before the model runs."
featured: false
order: 5
updated: 2026-09-22
draft: false
---

Search across four rulebooks: question → hybrid retrieval → selector → local
model → an answer with an address, or a refusal. All on the laptop, no cloud.

- BM25, RRF fusion and parent-document retrieval written by hand, no dependencies outside stdlib
- The instrument is calibrated against someone else's benchmark: nDCG@10 **0.666** vs a 0.665 anchor (BEIR/SciFact, 300 queries)
- recall@20 — **76%** [71..80] over 314 held-out questions
- Across 680 answers: none without an address, 0.3% fabricated pairs
- Every look at the holdout is logged — three so far, and one is recorded as unsanctioned, because an architectural choice was made with the holdout inside the denominator

Limits are stated, not hidden: exact (file, section) accuracy is 50% on an
independent holdout, and that line sits in the README above the strengths.
