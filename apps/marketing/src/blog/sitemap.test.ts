import type { BlogPost } from "@marketing/blog/schema";
import { blogSitemapResponse } from "@marketing/blog/sitemap";
import { describe, expect, it, vi } from "vitest";

const post = {
  slug: "example",
  publication_date: "2026-01-01T00:00:00Z",
  last_updated: null,
  date_updated: null,
} as BlogPost;
describe("runtime sitemap", () => {
  it("uses the configured canonical origin and the latest available modification date", async () => {
    const response = await blogSitemapResponse(
      async () => [
        post,
        {
          ...post,
          slug: "edited",
          last_updated: "2026-02-01T00:00:00Z",
          date_updated: "2026-03-01T00:00:00Z",
        },
        {
          ...post,
          slug: "editorial",
          last_updated: "2026-04-01T00:00:00Z",
          date_updated: "2026-03-01T00:00:00Z",
        },
      ],
      "https://preview.example.com",
      vi.fn(),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("application/xml");
    const xml = await response.text();
    expect(xml).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    );
    expect(xml).toContain(
      "<loc>https://preview.example.com/blog/example</loc><lastmod>2026-01-01T00:00:00.000Z</lastmod>",
    );
    expect(xml).toContain(
      "<loc>https://preview.example.com/blog/edited</loc><lastmod>2026-03-01T00:00:00.000Z</lastmod>",
    );
    expect(xml).toContain(
      "<loc>https://preview.example.com/blog/editorial</loc><lastmod>2026-04-01T00:00:00.000Z</lastmod>",
    );
  });
  it("reports outages and returns 503 without caching or leaking the error", async () => {
    const error = new Error("private CMS detail");
    const report = vi.fn();
    const response = await blogSitemapResponse(
      async () => {
        throw error;
      },
      "https://blinkdisk.com",
      report,
    );
    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(report).toHaveBeenCalledWith(error);
    expect(await response.text()).not.toContain(error.message);
  });
});
