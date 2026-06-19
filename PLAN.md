# marianfilms — Build Plan

Portafolio para **Marian Cabezas** (cortos, music videos, fotografía, diseño gráfico).
Sitio estático, content-driven por markdown, deploy en AWS con Terraform + CI/CD.

## Cómo usar este plan en Claude Code

- Guardá este archivo como `PLAN.md` en la raíz del repo.
- Trabajá **fase por fase, en orden**. No avances a la siguiente hasta cumplir la "Definición de hecho" de la actual.
- Las decisiones en "Decisiones cerradas" **no se revisan** salvo que yo (el dueño del repo) lo pida explícitamente.
- Respetá "Restricciones / no-goals". Si algo te tienta a romperlas, parar y preguntar.
- Opcional: además mantené un `CLAUDE.md` con las decisiones cerradas para contexto persistente entre sesiones.

---

## Contexto y objetivo

Portafolio de una creativa visual. Tres tipos de trabajo: **video**, **photo**, **design**.
Cada trabajo es un proyecto con galería, descripción y (en video) créditos y premios.
La dueña no es técnica: debe poder publicar agregando una carpeta con un `.md` y sus imágenes.

Objetivos secundarios del dueño del repo (developer): practicar **Terraform** y **CI/CD en AWS**,
y que el sitio rankee al buscar "marianfilms" (SEO / Core Web Vitals importan).

---

## Decisiones cerradas (no revisar)

1. **Framework: Astro 5**, salida estática (sin adapter, sin SSR). Es la mejor herramienta para un sitio markdown + imágenes + SEO.
2. **Gestor de paquetes: pnpm, siempre.** Nunca npm/yarn.
3. **Contenido: Content Collections (Content Layer API)** con schema de Zod. Validación en build.
4. **Imágenes co-locadas** con su markdown, en `src/content/<tipo>/<slug>/`, optimizadas vía `image()` + `astro:assets`. **NUNCA en `/public`** (ahí se sirven sin optimizar).
5. **Videos: embeds de Vimeo.** El `.md` guarda una `videoUrl`. **Jamás** hostear archivos de video en AWS (egress caro, transcoding innecesario).
6. **Animaciones: GSAP vanilla** dentro de `<script>` de Astro. **Sin React.** Solo se agrega un island (`pnpm astro add react`) si aparece UI con estado real (ej. lightbox con navegación por teclado), y solo ese componente se hidrata.
7. **Deploy: S3 (privado) + CloudFront (OAC) + ACM + Route53**, todo con Terraform.
8. **CI/CD: GitHub Actions con OIDC** (sin access keys). Push a `main` → build → `s3 sync --delete` → invalidación de CloudFront.
9. **Fondo por página:** negro por default; blanco en algunas páginas de detalle de diseño (controlado por frontmatter `background`).
10. **Hero:** transición de scroll blanco → negro (logo central que sube al nav, flechas que se desvanecen), implementada con GSAP ScrollTrigger.

---

## Tech stack

| Capa | Elección |
|---|---|
| Framework | Astro 5 (output estático) |
| Lenguaje | TypeScript (strict) |
| Contenido | Content Collections + Zod |
| Imágenes | `astro:assets` (`<Image />`) |
| Animación | GSAP + ScrollTrigger (vanilla, en `<script>`) |
| Estilos | (a definir: CSS/Tailwind — ver Fase 1) |
| Hosting | S3 + CloudFront |
| DNS / TLS | Route53 + ACM (us-east-1) |
| IaC | Terraform (state remoto en S3, `use_lockfile`) |
| CI/CD | GitHub Actions (OIDC) |
| Video | Vimeo (embed) |
| Paquetes | pnpm |

---

## Modelo de contenido

Archivo `src/content.config.ts` (Astro 5 — **no** `src/content/config.ts`):

```ts
import { defineCollection, z, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';

const credit = z.object({ role: z.string(), name: z.string() });

// Campos compartidos por video / photo / design
const base = ({ image }: SchemaContext) =>
  z.object({
    title: z.string(),
    label: z.string(),                          // "MUSIC VIDEO", "SHORT FILM", "Social Media"...
    thumbnail: image(),                         // optimizada por astro:assets
    span: z.number().int().min(1).max(4).default(1),
    order: z.number().default(0),
    background: z.enum(['black', 'white']).default('black'),
    hero: image().optional(),
    gallery: z.array(image()).default([]),
    videoUrl: z.string().url().optional(),      // Vimeo
  });

const video = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/video' }),
  schema: (ctx) =>
    base(ctx).extend({
      credits: z.array(credit).default([]),
      awards: z.array(z.string()).default([]),
    }),
});

const photo = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/photo' }),
  schema: base,
});

const design = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/design' }),
  schema: (ctx) => base(ctx).extend({ client: z.string().optional() }),
});

export const collections = { video, photo, design };
```

Ejemplo de un `.md` (`src/content/video/esta-bien-estar-mal/index.md`):

```md
---
title: "Dakzze - Esta Bien Estar Mal ft. Gabriela Triste"
label: "MUSIC VIDEO"
thumbnail: ./hero.jpg
span: 2
order: 1
videoUrl: https://vimeo.com/123456789
gallery:
  - ./still-1.jpg
  - ./still-2.jpg
credits:
  - { role: "Script and directing", name: "Marian Cabezas y Grisel Duarte" }
  - { role: "Editing", name: "Marian Cabezas" }
awards:
  - "4th ESCñE Short Film Festival"
---
A simple date turns into a sinister cycle...
```

---

## Rutas

| Ruta | Contenido |
|---|---|
| `/` | Hero (blanco→negro) + grid de video. Video es la "home". |
| `/photo` | Grid índice de fotografía |
| `/design` | Grid índice de diseño |
| `/about` | About me |
| `/video/[...slug]` | Detalle de video (hero, galería, créditos, premios) |
| `/photo/[...slug]` | Detalle de foto (galería masonry) |
| `/design/[...slug]` | Detalle de diseño (galería, cliente) |

> No crear ruta `/video` separada: duplicaría el grid de la home y castiga el SEO. El nav "VIDEO" hace scroll al grid dentro de `/`.

---

## Estructura del proyecto

```
marianfilms/
├── .npmrc
├── astro.config.mjs
├── tsconfig.json
├── src/
│   ├── content.config.ts
│   ├── content/
│   │   ├── video/<slug>/index.md (+ imágenes)
│   │   ├── photo/<slug>/index.md (+ imágenes)
│   │   └── design/<slug>/index.md (+ imágenes)
│   ├── layouts/
│   │   └── Base.astro            # <html>, fondo, fuentes
│   ├── components/
│   │   ├── Nav.astro             # VIDEO PHOTO {logo} DESIGN ABOUT ME
│   │   ├── Hero.astro            # transición GSAP (script vanilla)
│   │   ├── WorkGrid.astro        # grid variable (spans)
│   │   ├── Masonry.astro         # columnas CSS para photo individual
│   │   ├── Credits.astro         # itera credits[]
│   │   └── DetailFooter.astro    # MORE X | BACK TO TOP | BACK TO HOME
│   └── pages/
│       ├── index.astro
│       ├── photo/index.astro
│       ├── design/index.astro
│       ├── about.astro
│       ├── video/[...slug].astro
│       ├── photo/[...slug].astro
│       └── design/[...slug].astro
├── infra/                         # Terraform
└── .github/workflows/deploy.yml
```

---

## Fases de construcción

### Fase 0 — Scaffold
```bash
pnpm create astro@latest marianfilms -- --template minimal --typescript strict
cd marianfilms
pnpm add gsap
```
Crear `.npmrc` con hardening de supply chain:
```
ignore-scripts=true
minimum-release-age=4320   # 3 días en minutos; bloquea paquetes recién publicados
```
**Definición de hecho:** `pnpm dev` levanta; `pnpm build` genera `/dist`.

### Fase 1 — Content layer + schema + decisión de estilos
- Crear `src/content.config.ts` con el schema de arriba.
- Crear 1–2 `.md` de prueba por colección con imágenes reales co-locadas.
- Decidir estilos: **CSS plano/módulos** o **Tailwind** (`pnpm astro add tailwind`). Recomendación: Tailwind por velocidad, pero ojo con el gotcha de clases dinámicas (ver Gotchas).
**Definición de hecho:** `getCollection('video')` devuelve datos tipados; el build valida el schema (un `.md` malformado rompe el build).

### Fase 2 — Templates de detalle
- `src/pages/video/[...slug].astro` con `getStaticPaths` + `render(entry)`.
- `Credits.astro` que itera `credits[]` como `<dl>`.
- `DetailFooter.astro` (MORE VIDEOS / BACK TO TOP / BACK TO HOME).
- Replicar para `photo` y `design` (design soporta `background: white` y `client`).
**Definición de hecho:** cada `.md` produce una página de detalle completa con galería, descripción, créditos y premios. Fondo correcto por `background`.

### Fase 3 — Grids índice
- `WorkGrid.astro`: CSS grid, `grid-auto-flow: dense`, span por item vía **inline style** `grid-column: span N` (ver Gotchas).
- `Masonry.astro` para photo individual: CSS `columns` + `break-inside-avoid`.
- Páginas `/`, `/photo`, `/design` consumiendo `getCollection().sort(order)`.
- Cada card linkea a su detalle (`/video/${entry.id}`).
**Definición de hecho:** los tres grids renderizan, los spans variables se ven sin huecos, las cards navegan al detalle.

### Fase 4 — Nav, layout y about
- `Nav.astro` simétrico: VIDEO PHOTO · {logo} · DESIGN ABOUT ME. En detalle, se reemplaza por flecha "back" + logo con subtítulo de sección.
- `Base.astro` con fondo, fuentes, metadata por defecto.
- `/about`.
**Definición de hecho:** navegación completa entre todas las secciones; layout consistente.

### Fase 5 — Hero (GSAP)
- `Hero.astro` con `<script>` vanilla: ScrollTrigger pinnea el hero, timeline anima `backgroundColor` blanco→negro, flechas fade-out, logo se encoge y sube hacia la posición del nav.
- v1 simple: logo del hero hace fade-out y el del nav fade-in (evita FLIP). FLIP real (`gsap/Flip`) como mejora opcional.
**Definición de hecho:** al scrollear desde la home, la transición blanco→negro entrega en el grid de video sin saltos.

### Fase 6 — SEO
- `<title>`, meta description, Open Graph por página (datos del frontmatter).
- `@astrojs/sitemap`, `robots.txt`, JSON-LD básico.
- Verificar en Google Search Console tras el deploy.
**Definición de hecho:** cada página tiene metadata única; sitemap generado en build.

### Fase 7 — Infra (Terraform, carpeta `infra/`)
Orden: primero local sin dominio, luego dominio.
1. Backend remoto: bucket S3 para el state con `use_lockfile = true` (Terraform ≥1.10, sin DynamoDB).
2. S3 bucket del sitio: **privado**, sin website hosting público.
3. CloudFront con **OAC** (Origin Access Control, no el legacy OAI) → S3.
4. ACM certificate **en us-east-1** (requisito de CloudFront, aunque el bucket esté en otra región).
5. Route53: hosted zone + records (A/AAAA alias a CloudFront).
6. OIDC provider de GitHub + rol IAM least-privilege (solo `s3:PutObject`/`s3:DeleteObject`/`s3:ListBucket` en ese bucket y `cloudfront:CreateInvalidation` en esa distribución).
**Definición de hecho:** `terraform apply` levanta todo; deploy manual `aws s3 sync ./dist s3://<bucket>` sirve el sitio por el dominio con HTTPS.

### Fase 8 — CI/CD (GitHub Actions)
`.github/workflows/deploy.yml`:
```yaml
name: Deploy
on:
  push: { branches: [main] }
permissions: { id-token: write, contents: read }
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE_ARN }}
          aws-region: us-east-1
      - run: aws s3 sync ./dist s3://<bucket> --delete
      - run: aws cloudfront create-invalidation --distribution-id ${{ secrets.CF_DIST_ID }} --paths "/*"
```
**Definición de hecho:** un push a `main` deploya automáticamente y la invalidación refleja los cambios.

---

## Restricciones / no-goals

- **No** React ni ningún framework de UI, salvo un island puntual justificado por estado real. Por default, cero JS.
- **No** hostear video en AWS. Solo embeds de Vimeo.
- **No** poner imágenes de contenido en `/public`. Van en `src/content/<tipo>/<slug>/`.
- **No** usar npm/yarn. Solo pnpm.
- **No** SSR ni adapters. Sitio 100% estático.
- **No** guardar access keys de AWS en secrets. Solo OIDC.
- **No** crear ruta `/video` separada (duplica la home).
- **No** clases dinámicas de Tailwind para spans (se purgan). Usar inline style.

---

## Gotchas conocidos

**Astro 5:**
- Config en `src/content.config.ts`, **no** `src/content/config.ts`.
- Colecciones usan `loader: glob({ pattern, base })`, no `type: 'content'`.
- El slug es `entry.id` (ya viene slugificado), **no** `entry.slug`.
- Render con `render(entry)` importado de `astro:content`, **no** `entry.render()`.
- `image()` en el schema (vía `SchemaContext`) optimiza la imagen; rutas relativas `./`.

**CSS / layout:**
- Tailwind purga `col-span-${n}` dinámico. Usar `style="grid-column: span N"` inline.
- `grid-auto-flow: dense` para que los spans variables rellenen huecos.
- Masonry (photo individual): CSS `columns` + `break-inside-avoid`, no CSS grid.

**AWS:**
- El certificado ACM **debe** estar en `us-east-1` para CloudFront, sin importar la región del bucket. (Error #1 de todos la primera vez.)
- Usar OAC (no OAI, deprecado) para el acceso CloudFront→S3.
- Antes de tocar nada: configurar un **AWS Budget alert** (ej. $5) y billing alerts.

---

## Pendiente de decidir (no bloquea el arranque)

- **Estilos:** Tailwind vs CSS módulos (Fase 1).
- **CMS para la dueña:** editar `.md` a mano vs. Decap CMS (git-based, panel `/admin`) encima de las mismas colecciones. Evaluar tras el MVP.
- **Lightbox de fotos:** vanilla vs. island de React. Decidir al llegar al detalle de Photo.
- **Dominio:** `marianfilms.com` parece ocupado; evaluar `.studio` / `.film` / `.sv`.
- **FLIP del logo** en el hero (mejora opcional sobre el fade simple).