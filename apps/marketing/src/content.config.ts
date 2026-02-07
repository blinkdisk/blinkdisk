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

export const collections = { blog };
