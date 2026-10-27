import { BlogContentError } from "@marketing/blog/content";
import { type BlogCache, createBlogService } from "@marketing/blog/service";
import { describe, expect, it, vi } from "vitest";

const post = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "test-post",
  status: "published",
  title: "Title",
  description: "Description",
  author: "Paul Koeck",
  content: "## Heading\n\nContent",
  publication_date: "2026-01-01T00:00:00.000Z",
  last_updated: null,
  date_updated: null,
  cover_image: {
    id: "22222222-2222-4222-8222-222222222222",
    width: 1200,
    height: 630,
  },
  image_alt: "Cover",
  tags: [],
  faqs: [],
  cta_headline: null,
};
function harness() {
  let time = Date.parse("2026-10-27T00:00:00Z");
  const records = new Map<string, Response>();
  const cache: BlogCache = {
    match: async (key) => records.get(key)?.clone(),
    put: async (key, response) => {
      records.set(key, response);
    },
    delete: async (key) => records.delete(key),
  };
  const fetcher = vi
    .fn<typeof fetch>()
    .mockResolvedValue(Response.json({ data: [post] }));
  const service = createBlogService(
    { url: "https://cms.example.com", token: "private-token" },
    cache,
    fetcher,
    () => time,
  );
  return {
    service,
    fetcher,
    advance: (ms: number) => {
      time += ms;
    },
    records,
  };
}
describe("Directus blog service", () => {
  it("filters every public query, expands media, and caches successful data for five minutes", async () => {
    const h = harness();
    const result = await h.service.post("test-post");
    expect(result?.post.slug).toBe(post.slug);
    const url = new URL(String(h.fetcher.mock.calls[0]?.[0]));
    expect(JSON.parse(url.searchParams.get("filter") ?? "")._and).toEqual(
      expect.arrayContaining([
        { status: { _eq: "published" } },
        { publication_date: { _lte: "2026-10-27T00:00:00.000Z" } },
      ]),
    );
    expect(url.searchParams.get("fields")?.split(",")).toEqual(
      expect.arrayContaining([
        "cover_image.id",
        "cover_image.width",
        "cover_image.height",
      ]),
    );
    expect(h.fetcher.mock.calls[0]?.[1]?.headers).toMatchObject({
      Authorization: "Bearer private-token",
    });
    await h.service.post("test-post");
    expect(h.fetcher).toHaveBeenCalledTimes(1);
    h.advance(300_001);
    h.fetcher.mockResolvedValue(
      Response.json({ data: [{ ...post, title: "Updated" }] }),
    );
    expect((await h.service.post("test-post"))?.post.title).toBe("Updated");
  });
  it.each([
    "draft",
    "archived",
    "future",
  ])("never exposes %s records, even if the CMS returns them", async (status) => {
    const h = harness();
    h.fetcher.mockResolvedValue(
      Response.json({
        data: [
          {
            ...post,
            status: status === "future" ? "published" : status,
            publication_date:
              status === "future"
                ? "2030-01-01T00:00:00.000Z"
                : post.publication_date,
          },
        ],
      }),
    );
    expect(await h.service.post("test-post")).toBeNull();
  });
  it("serves last good data during transient outages, but expires it after one hour", async () => {
    const h = harness();
    await h.service.post("test-post");
    h.advance(300_001);
    h.fetcher.mockRejectedValue(new Error("offline"));
    expect((await h.service.post("test-post"))?.post.title).toBe("Title");
    h.advance(3_600_000);
    await expect(h.service.post("test-post")).rejects.toThrow(
      "temporarily unavailable",
    );
  });
  it("evicts unpublished content and does not resurrect it on subsequent outages", async () => {
    const h = harness();
    await h.service.post("test-post");
    h.advance(300_001);
    h.fetcher.mockResolvedValue(Response.json({ data: [] }));
    expect(await h.service.post("test-post")).toBeNull();
    expect(h.records.size).toBe(0);
    h.fetcher.mockRejectedValue(new Error("offline"));
    await expect(h.service.post("test-post")).rejects.toThrow();
  });
  it("does not mask authentication failures with cached content", async () => {
    const h = harness();
    await h.service.post("test-post");
    h.advance(300_001);
    h.fetcher.mockResolvedValue(new Response("denied", { status: 403 }));
    await expect(h.service.post("test-post")).rejects.toThrow();
  });
  it("previews saved drafts without using the public cache", async () => {
    const h = harness();
    h.fetcher.mockResolvedValue(
      Response.json({ data: [{ ...post, status: "draft" }] }),
    );
    expect((await h.service.preview(post.id))?.post.status).toBe("draft");
    expect(h.records.size).toBe(0);
    const url = new URL(String(h.fetcher.mock.calls[0]?.[0]));
    expect(JSON.parse(url.searchParams.get("filter") ?? "")).toEqual({
      id: { _eq: post.id },
    });
  });
  it("sorts published posts and returns a valid empty listing", async () => {
    const h = harness();
    h.fetcher.mockResolvedValue(
      Response.json({
        data: [
          { ...post, slug: "older" },
          {
            ...post,
            slug: "newer",
            publication_date: "2026-02-01T00:00:00.000Z",
          },
        ],
      }),
    );
    expect((await h.service.list()).map((item) => item.slug)).toEqual([
      "newer",
      "older",
    ]);
    h.advance(300_001);
    h.fetcher.mockResolvedValue(Response.json({ data: [] }));
    expect(await h.service.list()).toEqual([]);
  });
  it("rejects invalid article content and reports cold CMS failures", async () => {
    const h = harness();
    h.fetcher.mockResolvedValue(
      Response.json({ data: [{ ...post, content: "{dangerous()}" }] }),
    );
    await expect(h.service.post("test-post")).rejects.toThrow(BlogContentError);
    expect(h.records.size).toBe(0);
  });
  it("loads an explicit content version through the single-item endpoint", async () => {
    const h = harness();
    h.fetcher
      .mockResolvedValueOnce(
        Response.json({ data: [{ ...post, status: "draft" }] }),
      )
      .mockResolvedValueOnce(
        Response.json({
          data: { ...post, status: "draft", title: "Private version" },
        }),
      );
    expect((await h.service.preview(post.id, "revision"))?.post.title).toBe(
      "Private version",
    );
    const url = new URL(String(h.fetcher.mock.calls[1]?.[0]));
    expect(url.pathname).toBe(`/items/blog_posts/${post.id}`);
    expect(url.searchParams.get("version")).toBe("revision");
    expect(h.records.size).toBe(0);
  });
  it("rejects a mismatched slug and reuses valid cached content when a later edit cannot render", async () => {
    const h = harness();
    h.fetcher.mockResolvedValueOnce(
      Response.json({ data: [{ ...post, slug: "different-post" }] }),
    );
    expect(await h.service.post("test-post")).toBeNull();
    h.fetcher.mockResolvedValueOnce(Response.json({ data: [post] }));
    await h.service.post("test-post");
    h.advance(300_001);
    h.fetcher.mockResolvedValueOnce(
      Response.json({ data: [{ ...post, content: "{dangerous()}" }] }),
    );
    expect((await h.service.post("test-post"))?.post.content).toBe(
      post.content,
    );
  });
});
