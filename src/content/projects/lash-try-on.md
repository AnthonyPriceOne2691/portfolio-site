---
title: "Lash Try-On (AR)"
oneLiner: "An AR consultation mirror for lash artists: extension looks rendered live on the client's own 3D face mesh."
metric: "59 fps"
status: "poc"
stack: ["Swift", "SwiftUI", "ARKit", "SceneKit", "MediaPipe", "Ollama (VLM)"]
proof:
  github: "https://github.com/AnthonyPriceOne2691"
contract: "A local vision-LLM critic proposes parameter tweaks within a whitelist and clamped ranges; a human applies them."
featured: false
order: 4
updated: 2026-07-20
draft: true
---

Built with a working salon, not as a selfie filter.

- ARKit mesh and MediaPipe landmark fusion with per-eye calibration, 59 fps on an iPhone 11
- Parametric lash geometry with game-style rendering — 2 draw calls per look
- A local vision-LLM critic proposes tweaks, a human applies them
