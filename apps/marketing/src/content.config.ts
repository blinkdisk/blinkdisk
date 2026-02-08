import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      author: z.string(),
      image: z.object({
        src: image(),
        alt: z.string(),
      }),
      tags: z.array(z.string()).optional(),
      draft: z.boolean().optional(),
      ctaHeadline: z.string().optional(),
    }),
});

const glossary = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/glossary" }),
  schema: z.object({
    term: z.string(),
    slug: z.string(),
    question: z.string(),
    shortAnswer: z.string(),
    category: z.enum([
      "backup-types",
      "security",
      "storage",
      "recovery",
      "best-practices",
    ]),
    relatedTerms: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
  }),
});

export const collections = { blog, glossary };
