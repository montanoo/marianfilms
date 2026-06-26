import { defineCollection, type SchemaContext } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

// A field that is either language-neutral (a single string) or an { es, en }
// pair. Rendered through <T>, which ships both languages for the client toggle.
const localized = z.union([
  z.string(),
  z.object({ es: z.string(), en: z.string() }),
]);

const credit = z.object({ role: localized, name: z.string().optional() });
const award = z.object({ name: localized, awardTitle: localized });

const base = ({ image }: SchemaContext) =>
  z.object({
    title: localized,
    cardTitle: localized.optional(),
    label: localized,
    thumbnail: image(),
    pageTitle: z.string().optional(),
    span: z.number().int().min(1).max(4).default(1),
    order: z.number().default(0),
    background: z.enum(["black", "white"]).default("black"),
    hero: image().optional(),
    gallery: z.array(image()).default([]),
    videoUrl: z.url().optional(),
  });

// Shared gallery/layout fields for any collection rendered through <PhotoGallery />.
// Used by both `photo` and `design` so they stay in sync.
const galleryFields = (ctx: SchemaContext) => ({
  description: localized.optional(),
  layout: z
    .enum(["rows", "grid", "columns", "sections", "blocks"])
    .default("rows"),
  rows: z
    .array(
      z.array(
        z.object({
          src: ctx.image(),
          span: z.number().positive().optional(), // relative width weight; else sized by aspect
        }),
      ),
    )
    .default([]),
  gridCols: z.number().int().min(2).max(12).default(6),
  gridTemplate: z.string().optional(),
  gridGap: z.number().default(14),
  grid: z
    .array(
      z.object({
        src: ctx.image(),
        col: z.string(), // CSS grid-column, e.g. "1 / 2" or "2 / 4"
        row: z.string().optional(), // optional explicit CSS grid-row
        ar: z.number().optional(), // crop aspect (w/h); else natural
      }),
    )
    .default([]),
  colGap: z.number().default(14),
  pairGap: z.number().default(14),
  rowGap: z.number().default(67),
  singleWidth: z.number().default(72), // % width for single-image rows
  captionAlign: z.enum(["center", "left"]).default("center"), // block caption alignment
  leadGap: z.number().optional(), // extra gap (px) after the first row
  logoColor: z.enum(["black", "white"]).default("black"),
  columns: z
    .array(
      z.object({
        width: z.number(),
        align: z.enum(["start", "center", "end"]).default("start"),
        rows: z
          .array(
            z.array(
              z.object({
                src: ctx.image(),
                w: z.number().optional(), // fraction of column width (single rows)
              }),
            ),
          )
          .default([]),
      }),
    )
    .default([]),
  sections: z
    .array(
      z.object({
        row: z
          .array(
            z.object({
              src: ctx.image(),
              span: z.number().positive().optional(), // relative width weight; else by aspect
              ar: z.number().positive().optional(), // crop aspect (w/h); else natural
              w: z.number().optional(), // fixed width fraction (no grow)
            }),
          )
          .optional(),
        columns: z
          .array(
            z.object({
              width: z.number(),
              align: z.enum(["start", "center", "end"]).default("start"),
              rows: z
                .array(
                  z.array(
                    z.object({
                      src: ctx.image(),
                      w: z.number().optional(), // fraction of column width
                      ar: z.number().positive().optional(), // crop aspect (w/h)
                      fill: z.boolean().optional(), // grow to fill remaining column height
                    }),
                  ),
                )
                .default([]),
            }),
          )
          .optional(),
        width: z.number().optional(), // single-image row max-width (%)
        gap: z.number().optional(), // horizontal gap within a multi-image row
        justify: z
          .enum(["start", "center", "end", "between", "around"])
          .optional(), // horizontal distribution of a multi-image row
        valign: z.enum(["start", "center", "end"]).optional(), // vertical alignment of a row
        colGap: z.number().optional(), // masonry: gap between columns
        pairGap: z.number().optional(), // masonry: gap inside a multi-image row
        rowGap: z.number().optional(), // masonry: vertical gap between images
      }),
    )
    .default([]),
  sectionGap: z.number().default(28), // vertical gap between sections
  masonryLeftBias: z.number().default(1), // mobile masonry: left-column flex-grow (1 = equal, >1 = bigger left)
});

const video = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/video" }),
  schema: (ctx) =>
    base(ctx).extend({
      description: localized.optional(),
      credits: z.array(credit).default([]),
      awards: z.array(award).default([]),
      awardsInGrid: z.boolean().default(false),
      layout: z
        .enum(["credits-below", "credits-aside"])
        .default("credits-aside"),
    }),
});

const photo = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/photo" }),
  schema: (ctx) => base(ctx).extend(galleryFields(ctx)),
});

const design = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/design" }),
  schema: (ctx) =>
    base(ctx).extend({
      ...galleryFields(ctx),
      client: z.string().optional(),
      subtitle: localized.optional(), // line under the big title on a flat page
      gap: z.number().optional(), // horizontal gap (px) between side-by-side images in a blocks row
      blockGap: z.number().optional(), // vertical gap (px) between blocks (overrides the default)
      // Stacked blocks: an optional header above + small description below a group
      // of images. Use `src` for one image, `images` for several side by side, or
      // `rows` for several stacked (each inner array is one side-by-side row).
      blocks: z
        .array(
          z.object({
            src: ctx.image().optional(),
            images: z.array(ctx.image()).optional(),
            rows: z.array(z.array(ctx.image())).optional(),
            heading: localized.optional(),
            caption: localized.optional(),
            gap: z.number().optional(), // horizontal gap between images in a row
            rowGap: z.number().optional(), // vertical gap between stacked rows
          }),
        )
        .default([]),
    }),
});

export const collections = { video, photo, design };
