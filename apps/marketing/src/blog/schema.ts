import { z } from "astro/zod";

const imageSchema = z.object({
  id: z.uuid(),
  width: z.number().nullable(),
  height: z.number().nullable(),
});
export const blogPostSchema = z.object({
  id: z.uuid(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  status: z.enum(["draft", "published", "archived"]),
  title: z.string().min(1),
  description: z.string().min(1),
  author: z.string().min(1),
  content: z.string().min(1).max(500_000),
  publication_date: z.iso.datetime({ offset: true }),
  last_updated: z.iso.datetime({ offset: true }).nullable(),
  date_updated: z.iso.datetime({ offset: true }).nullable(),
  cover_image: imageSchema,
  image_alt: z.string().min(1),
  tags: z.array(z.string()).nullable(),
  faqs: z
    .array(z.object({ question: z.string().min(1), answer: z.string().min(1) }))
    .nullable(),
  cta_headline: z.string().nullable(),
});
export type BlogPost = z.infer<typeof blogPostSchema>;
export function isPublished(post: BlogPost, now = Date.now()) {
  return (
    post.status === "published" && Date.parse(post.publication_date) <= now
  );
}
export function imageUrl(baseUrl: string, id: string, width?: number) {
  const url = new URL(`/assets/${id}`, baseUrl);
  if (width) {
    url.searchParams.set("width", String(width));
    url.searchParams.set("format", "webp");
    url.searchParams.set("quality", "85");
  }
  return url.toString();
}
