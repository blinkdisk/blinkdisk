import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      publicationDate: z.coerce.date(),
      lastUpdated: z.coerce.date().optional(),
      author: z.string(),
      image: z.object({
        src: image(),
        alt: z.string(),
      }),
      tags: z.array(z.string()).optional(),
      faqs: z
        .array(
          z.object({
            question: z.string(),
            answer: z.string(),
          }),
        )
        .optional(),
      draft: z.boolean().optional(),
      ctaHeadline: z.string().optional(),
    }),
});

const security = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/security" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publicationDate: z.coerce.date(),
    lastUpdated: z.coerce.date().optional(),
    author: z.string(),
    severity: z.string(),
    cvssScore: z.number(),
    cvssVector: z.string(),
    cveId: z.string(),
    ghsaId: z.string(),
    credits: z.array(
      z.object({
        name: z.string(),
        url: z.string().url().optional(),
      }),
    ),
    references: z
      .array(
        z.object({
          title: z.string(),
          url: z.string().url(),
        }),
      )
      .optional(),
    tags: z.array(z.string()).optional(),
    faqs: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        }),
      )
      .optional(),
    draft: z.boolean().optional(),
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

export const collections = { blog, security, glossary };
