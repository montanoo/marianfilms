---
title: "Miscellaneous"
cardTitle: "Miscellaneous"
label: "PHOTOGRAPHY"
thumbnail: ./gallery/still-11.JPG
order: 8
background: white
logoColor: black
description: "I've been toying with cameras for my whole life. These are some of my beginnings. I miss going out and taking some photos, but video has taken over my life. I think I can see some glimpses of what my style would evolve into. However, it's still changing."
layout: sections
sectionGap: 63 # vertical gap between bands
sections:
  # 1 — goldfish, full-width (centered, capped)
  - row: [{ src: ./gallery/still-1.jpg }]
    width: 78

  # 2 — lion · hippo · leopard (3-up, justified)
  - row:
      [
        { src: ./gallery/still-2.jpg },
        { src: ./gallery/still-3.jpg },
        { src: ./gallery/still-4.jpg },
      ]
    gap: 32

  # 3 — mountain (wide) + stormtrooper (narrow), equal height (justified)
  - row:
      [
        { src: ./gallery/still-5.jpg },
        { src: ./gallery/still-6.jpg },
      ]
    gap: 32

  # 4 — masonry: L[turtle, keyboard] · R[dark-tree, cactus]
  - colGap: 32
    rowGap: 17
    columns:
      - width: 213
        rows:
          - [{ src: ./gallery/still-7.jpg }] # turtle (tall, natural)
          - [{ src: ./gallery/still-10.jpg, ar: 1.68 }] # keyboard (cropped wide)
      - width: 230
        rows:
          - [{ src: ./gallery/still-8.jpg }] # dark-tree (natural)
          - [{ src: ./gallery/still-9.jpg, w: 0.75, fill: true }] # cactus (fills column height, left-aligned)

  # 5 — cat on barbed wire, full-width
  - row: [{ src: ./gallery/still-11.JPG }]
    width: 100

  # 6 — planks · black-cat · lily (3-up, justified)
  - row:
      [
        { src: ./gallery/still-12.jpg },
        { src: ./gallery/still-13.jpg },
        { src: ./gallery/still-14.jpg },
      ]
    gap: 32
---
