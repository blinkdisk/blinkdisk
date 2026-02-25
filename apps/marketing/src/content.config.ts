import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";

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
    summary: z.string(),
    author: z.string(),
    relatedTerms: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
  }),
});

export const collections = { blog, glossary };
