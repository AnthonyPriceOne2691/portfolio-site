---
title: "Lash Try-On (AR)"
oneLiner: "AR-зеркало для лешмейкера: наращивание видно на живом 3D-меше лица клиента до процедуры."
metric: "59 fps"
status: "poc"
stack: ["Swift", "SwiftUI", "ARKit", "SceneKit", "MediaPipe", "Ollama (VLM)"]
proof:
  github: "https://github.com/AnthonyPriceOne2691"
contract: "Локальный VLM-критик предлагает правки параметров в пределах белого списка и диапазонов; применяет их человек."
featured: false
order: 4
updated: 2026-07-20
draft: true
---

Сделано вместе с работающим салоном, а не как селфи-фильтр.

- Слияние ARKit-меша и лендмарков MediaPipe с калибровкой под каждый глаз, 59 fps на iPhone 11
- Параметрическая геометрия ресниц с игровым рендерингом — 2 draw call на образ
- Локальный VLM-критик предлагает правки, применяет человек
