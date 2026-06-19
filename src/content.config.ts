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
  schema: base,
});

const design = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/design" }),
  schema: (ctx) => base(ctx).extend({ client: z.string().optional() }),
});

export const collections = { video, photo, design };
