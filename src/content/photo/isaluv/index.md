---
title: "ISALuv - EP Photoshoot"
cardTitle: "ISALuv"
label: "PHOTOGRAPHY"
thumbnail: ./gallery/still-1.jpg
order: 5
background: white
logoColor: black
layout: sections
sectionGap: 32 # vertical gap between bands
sections:
  # 1 — 3-up row (justified, equal height)
  - row:
      [
        { src: ./gallery/still-1.jpg },
        { src: ./gallery/still-2.jpg },
        { src: ./gallery/still-3.jpg },
      ]
    gap: 32

  # 2 — centered couple shot, cropped ~square
  - row: [{ src: ./gallery/still-4.jpg, ar: 1.05 }]
    width: 55

  # 3 — 3-up row (justified, equal height)
  - row:
      [
        { src: ./gallery/still-5.jpg },
        { src: ./gallery/still-6.jpg },
        { src: ./gallery/still-7.jpg },
      ]
    gap: 32
---
