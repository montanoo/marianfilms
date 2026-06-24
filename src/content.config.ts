import { defineCollection, type SchemaContext } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const credit = z.object({ role: z.string(), name: z.string().optional() });
const award = z.object({ name: z.string(), awardTitle: z.string() });

const base = ({ image }: SchemaContext) =>
  z.object({
    title: z.string(),
    cardTitle: z.string().optional(),
    label: z.string(),
    thumbnail: image(),
    pageTitle: z.string().optional(),
    span: z.number().int().min(1).max(4).default(1),
    order: z.number().default(0),
    background: z.enum(["black", "white"]).default("black"),
    hero: image().optional(),
    gallery: z.array(image()).default([]),
    videoUrl: z.url().optional(),
  });

const video = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/video" }),
  schema: (ctx) =>
    base(ctx).extend({
      description: z.string().optional(),
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
  schema: (ctx) =>
    base(ctx).extend({
      description: z.string().optional(),
      layout: z.enum(["rows", "grid", "columns", "sections"]).default("rows"),
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
    }),
});

const design = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/design" }),
  schema: (ctx) => base(ctx).extend({ client: z.string().optional() }),
});

export const collections = { video, photo, design };
