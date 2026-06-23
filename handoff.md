# marianfilms — Session Handoff

Portfolio for **Marian Cabezas** (short films, music videos, photography, graphic design).
Astro 5 static site, content-driven by markdown, GSAP animation, Tailwind v4.

> Read `PLAN.md` first — it holds the closed architectural decisions, routes, the full
> build phases (0–8), and the deploy plan (S3 + CloudFront + Terraform + GitHub Actions).
> This file captures the **current state** on top of that plan.

---

## Stack & ground rules

- **Astro 5**, static output (no SSR/adapter). **pnpm only** (never npm/yarn).
- **Tailwind v4** via `@tailwindcss/vite`. Theme font = Helvetica (`src/styles/global.css`).
- **GSAP + ScrollTrigger** in Astro `<script>` (vanilla, no React).
- **Content Collections + Zod** (`src/content.config.ts`, NOT `src/content/config.ts`).
- **Images co-located** with markdown in `src/content/<type>/<slug>/`, optimized via
  `image()` + `<Image />`. Never in `/public`.

### Gotchas (bitten us already)
- **Restart `pnpm dev` after editing `src/content.config.ts`** — collections load once at
  startup; a schema change or new entry won't appear until restart (causes phantom 404s).
- **No dynamic Tailwind class strings** (e.g. `` `text-${x}` ``) — they get purged. Use
  static class maps / `class:list`.
- **`sharp` is not installed locally** → `MissingSharp` warnings on build; the build still
  succeeds (images just aren't optimized locally). Install with `pnpm add sharp` if needed.
- YAML in frontmatter: watch for **duplicate keys** (a duplicate `description:` broke a build).

### Commands
```bash
pnpm dev                 # local dev
pnpm exec astro build    # full build → ./dist  (validates content schema)
```

---

## Current status

### Done
- **Homepage** (`src/pages/index.astro`): `Hero` (white→black scroll) + `Nav` + `WorkGrid`.
- **Video** fully working: `/video` grid index + `/video/<slug>` detail pages (9 entries),
  with YouTube embeds, galleries, credits, awards.
- **Photo** framework working: `/photo` grid index + `/photo/<slug>` detail with **three**
  gallery layout modes (rows / grid / columns). **2 of 8** photo folders authored.

### In progress / WIP
- **Photo detail title/description** block is active again (was commented out during
  iteration). Styled as bold title + description under the gallery, above `PageNav`.
- **`logoColor`** is destructured in `src/pages/photo/[...slug].astro` but **not in the
  schema yet and not passed anywhere** — looks like an in-progress idea (per-page logo
  color). Either wire it through `Base`/`Nav`/`Header` + add to schema, or remove it.

### Not started
- Remaining **6 photo folders**: `gysin`, `isa`, `misc`, `sander`, `self-portrait`,
  `trash` (folders don't exist yet — need images + `index.md`).
- **`design`** collection: schema exists, **no pages, no content**.
- **`/about`** page.
- **SEO** (Phase 6), **Terraform infra** (Phase 7), **CI/CD** (Phase 8) — see PLAN.md.
- **Not pushed to GitHub yet** (see "Deploy / Git" below).

---

## Architecture

### Layout
- `src/layouts/Base.astro` — `<html>/<head>/<body>`. Props: `title`, `background`
  (`'black'`|`'white'`, default black → sets body `bg/text`). Imports `global.css`.

### Components
| Component | Purpose |
|---|---|
| `Hero.astro` | Homepage white→black scroll hero. GSAP timeline: logo fade-in (4s) → arrows fade-in (2s) → arrows bounce; logo rises/shrinks & arrows fade on scroll. Full-height single bg gradient (`white 0→76% → black`). Honors `prefers-reduced-motion`. |
| `Nav.astro` | Sticky top nav: `VIDEO PHOTO {logo} DESIGN ABOUT ME`. Prop `active` underlines current. Center logo = `logo.svg` → `/`. |
| `WorkGrid.astro` | Homepage video grid. `getCollection('video').sort(order)`. Hover-reveal cards: `cardTitle` (uppercase, tracked) + `label`, centered. Links `/video/<id>`. Staggered scroll-in. |
| `Header.astro` | Detail-page header: back-arrow + center logo + section text. **Color-adaptive** (inherits page text color, works on white pages). Back arrow is a `<button>`, enabled only if `document.referrer` is same-origin → `history.back()`, else disabled. |
| `Gallery.astro` | Video detail gallery. Variants `below` / `aside`. Co-located GSAP scroll-reveal on `.image-gallery`. Has a `<slot/>` (used for awards-in-grid). |
| `Information.astro` | Generic titled definition list (CREDITS / AWARDS). Props: `title`, `items:[{term,description}]`, `alignment`, `boldTitle`, `boldTerms`, `constrain`, `fallback`. Static alignment classes. |
| `PageNav.astro` | Detail footer: `MORE X / BACK TO TOP / BACK TO HOME`. Props `moreHref` (default `/video`), `moreLabel`. |
| `PhotoGallery.astro` | Photo gallery with **3 layout modes** — see below. |

### Pages / routes
| Route | File | Notes |
|---|---|---|
| `/` | `pages/index.astro` | Hero + Nav + WorkGrid |
| `/video` | `pages/video.astro` | video grid index (Nav + WorkGrid) |
| `/video/<slug>` | `pages/video/[...slug].astro` | video detail |
| `/photo` | `pages/photo/index.astro` | photo grid index |
| `/photo/<slug>` | `pages/photo/[...slug].astro` | photo detail |

> Note: PLAN.md said "no separate `/video` route" but we **added one** (owner override).
> `/video` (page) and `/video/<slug>` (rest route) coexist fine.

---

## Content model (`src/content.config.ts`)

`base` (shared): `title`, `cardTitle?`, `label`, `thumbnail` (image, required),
`pageTitle?`, `span` (1–4, default 1), `order` (default 0), `background`
(`black`|`white`), `hero?` (image), `gallery?` (image[]), `videoUrl?` (url).

- **video** = base + `description?`, `credits:[{role,name?}]`, `awards:[{name,awardTitle}]`,
  `awardsInGrid` (bool), `layout` (`credits-below`|`credits-aside`).
- **photo** = base + `description?` + the layout fields below.
- **design** = base + `client?`. (No pages yet.)

### Video detail behavior (`video/[...slug].astro`)
- Big media = **YouTube embed** if `videoUrl` set (id extracted, `youtube-nocookie`,
  playlist params stripped), else falls back to `hero ?? thumbnail` image.
- `layout: credits-below` → gallery grid, then centered title + CREDITS.
- `layout: credits-aside` → 2-col gallery + aside (description, CREDITS, AWARDS).
  `awardsInGrid: true` puts AWARDS inside the gallery grid instead of the aside.
- All 9 video entries set: `thumbnail: ./thumbnail.jpg`, `hero: ./hero.jpg`, `order`,
  `cardTitle`, and a YouTube `videoUrl`.

### Photo layout modes (`PhotoGallery.astro`) — the intricate part

**1. `rows`** (default) — justified rows.
```yaml
layout: rows
rows:
  - [ { src: ./a.jpg } ]                         # single → centered, capped (singleWidth, default 72%)
  - [ { src: ./b.jpg }, { src: ./c.jpg } ]       # multi → justified: equal height, widths by aspect
```
Used by **`danie`** (layout `1×3×1×3×2×3`).

**2. `grid`** — explicit bento on a column template.
```yaml
layout: grid
gridTemplate: "574 407 430"     # column widths → fr units (also accepts gridCols: N uniform)
gridGap: 14
grid:
  - { src: ./a.jpg, col: "1 / 2" }               # CSS grid-column line string
  - { src: ./b.jpg, col: "2 / 4", ar: 1.6 }      # spans cols 2-3; ar = crop aspect (else natural)
  - { src: ./c.jpg, col: "1 / 2", row: "1 / 14" }# optional explicit row; else auto from aspect
```
Heights auto-derived from aspect (or `ar`); `object-cover` crops to the cell.

**3. `columns`** — independent columns (true masonry). **Used by `daniel-estrada`.**
```yaml
layout: columns
colGap: 32      # horizontal gap BETWEEN columns
pairGap: 19     # horizontal gap inside a multi-image (justified) row
rowGap: 17      # vertical gap between stacked images
columns:
  - width: 574                                   # relative flex weight
    rows:
      - [ { src: ./1.jpg } ]                      # single → fills column width
      - [ { src: ./3.jpg } ]
  - width: 851
    align: end                                    # start|center|end (aligns partial single rows)
    rows:
      - [ { src: ./2.jpg, w: 0.506 } ]            # w = fraction of column width (partial single)
      - [ { src: ./4.jpg }, { src: ./5.jpg } ]    # multi → justified, uses pairGap
      - [ { src: ./7.jpg } ]
```
Columns are flex `items-start` so they stagger; `w` on a single image makes it partial-width
(e.g. the top-right image with `align: end` creates the top-middle gap). Single-image height =
its width ÷ aspect, so to match another column's first image, set `w` to equal the target width
ratio (that's how `slide-2`'s `w: 0.506` was derived to hit 765px = `slide-1`'s height).

#### Authoring a new photo folder
1. Drop images in `src/content/photo/<slug>/gallery/` + a `thumbnail.jpg` (currently
   `danie`/`daniel-estrada` point `thumbnail` at a gallery still as a placeholder).
2. Create `index.md` with `title`, `cardTitle`, `label`, `thumbnail`, `order`,
   `background`, `description`, and one of the three layouts above.
3. Tip: `sips -g pixelWidth -g pixelHeight <img>` to get aspect ratios when laying out.
4. Restart `pnpm dev`.

---

## Assets
- `src/assets/logo.svg` — "Marian Cabezas" signature mark (uses `currentColor`, so it adapts
  to text color). Used in `Nav` center and `Header`.
- `src/assets/camera-with-text.svg` — camera + signature; used in the `Hero`.
- `src/assets/arrow.svg` — sketch arrow (`currentColor`). Native orientation ≈ down;
  `Header` rotates it 90° for the back arrow.

---

## Deploy / Git (not done yet)
- **No git remote, `gh` CLI not installed**, still on the initial commit. ~20 uncommitted
  files (all the work this session).
- Real payload to push ≈ **~100MB** of content images (fine for GitHub; `node_modules`/`dist`
  are gitignored). Discussed but did NOT do: downscaling source images and/or Git LFS.
- `.git` has **~57MB of stray loose objects** from a prior `git add` of images — run
  `git gc --prune=now` before/after first push to clear them.
- To publish: commit, create repo (`brew install gh` then `gh repo create … --source=. --push`,
  or make it on github.com and `git remote add origin …`), `git push -u origin main`.

---

## Suggested next steps
1. Resolve **`logoColor`** in `photo/[...slug].astro` (wire it or remove it).
2. Author the **6 remaining photo folders** (pick rows/grid/columns per design).
3. Build **`/photo` and `/about`** polish; then the **`design`** collection + pages.
4. SEO (Phase 6) → Infra (Phase 7) → CI/CD (Phase 8) per PLAN.md.
