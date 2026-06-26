---
title: "Sander"
cardTitle: "Sander"
label: { es: "FOTOGRAFÍA", en: "PHOTOGRAPHY" }
thumbnail: ./gallery/still-5.jpg
order: 7
background: black
logoColor: white
description:
  es: "Estas fotos no estaban planeadas. Fueron tomadas durante la grabación de un video para una de sus canciones. Sin embargo, me encantó cómo quedaron los colores y la esencia que capturaron."
  en: "These weren't planned. Taken during the shoot of a visualizer for one of his songs. However, I loved how the colors turned out and the essence it captured."
layout: sections
sectionGap: 48 
masonryLeftBias: 1.4 
sections:
  # 1 — 3-up row (justified, equal height)
  - row:
      [
        { src: ./gallery/still-1.jpg },
        { src: ./gallery/still-2.jpg },
        { src: ./gallery/still-3.jpg },
      ]
    gap: 32

  # 2 — sides pinned to row-1 columns, smaller center, all vertically centered
  - justify: between
    valign: center
    row:
      [
        { src: ./gallery/still-4.jpg, w: 0.317 },
        { src: ./gallery/still-5.jpg, w: 0.221 },
        { src: ./gallery/still-6.jpg, w: 0.317 },
      ]
---
