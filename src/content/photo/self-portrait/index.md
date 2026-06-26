---
title: { es: "Autorretratos", en: "Self-portraits" }
cardTitle: { es: "Autorretratos", en: "Self-portraits" }
label: { es: "FOTOGRAFÍA", en: "PHOTOGRAPHY" }
thumbnail: ./gallery/still-6.PNG
order: 6
background: white
logoColor: black
description:
  es: "Antes de fotografiar a otra gente, mi única modelo era yo misma. Me ayudó a comprender la iluminación, el maquillaje, la ropa y la intención. Me encanta hacerme autorretratos; es un ejercicio estupendo cuando no hay nadie más dispuesto a posar."
  en: "Before I took pictures of anyone, my only model was myself. It helped me understand lighting, makeup, outfits, and intention. I love taking self-portraits, great exercise when no one else is down to model."
layout: sections
sectionGap: 32 # vertical gap between bands
# 3-up rows are cropped to a uniform box (ar 0.63); centered singles are natural.
sections:
  - row:
      [
        { src: ./gallery/still-1.jpg, ar: 0.63 },
        { src: ./gallery/still-2.jpg, ar: 0.63 },
        { src: ./gallery/still-3.jpg, ar: 0.63 },
      ]
    gap: 32

  - row: [{ src: ./gallery/still-4.jpg }] # red portrait (natural landscape)
    width: 56

  - row:
      [
        { src: ./gallery/still-5.jpg, ar: 0.63 },
        { src: ./gallery/still-6.PNG, ar: 0.63 },
        { src: ./gallery/still-7.jpg, ar: 0.63 },
      ]
    gap: 32

  - row: [{ src: ./gallery/still-8.jpg }] # backlit silhouette (natural landscape)
    width: 56

  - row:
      [
        { src: ./gallery/still-9.jpg, ar: 0.63 },
        { src: ./gallery/still-10.jpg, ar: 0.63 },
        { src: ./gallery/still-11.jpg, ar: 0.63 },
      ]
    gap: 32

  - row: [{ src: ./gallery/still-12.jpg }] # yellow jacket (natural portrait)
    width: 47
---
