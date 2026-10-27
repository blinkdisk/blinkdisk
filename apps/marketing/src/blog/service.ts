import {
  BlogContentError,
  type ParsedContent,
  parseContent,
} from "@marketing/blog/content";
import {
  type BlogPost,
  blogPostSchema,
  isPublished,
} from "@marketing/blog/schema";

export type BlogCache = {
  match(key: string): Promise<Response | undefined>;
  put(key: string, response: Response): Promise<unknown>;
  delete(key: string): Promise<unknown>;
};
class CmsUnavailableError extends Error {
  constructor(
    public staleAllowed = true,
    public diagnostic = "CMS availability error",
  ) {
    super("The blog is temporarily unavailable. Please try again shortly.");
  }
}
export type PreparedPost = { post: BlogPost; content: ParsedContent };
const FRESH_MS = 5 * 60 * 1000;
const RETAIN_MS = 60 * 60 * 1000;
const fields =
  "id,slug,status,title,description,author,content,publication_date,last_updated,date_updated,cover_image.id,cover_image.width,cover_image.height,image_alt,tags,faqs,cta_headline";

export function createBlogService(
  config: { url: string; token: string; allowHttpLocal?: boolean },
  cache?: BlogCache,
  fetcher: typeof fetch = fetch,
  now: () => number = Date.now,
) {
  async function request(path: string, params: Record<string, string> = {}) {
    if (!config.url || !config.token)
      throw new CmsUnavailableError(false, "Missing runtime configuration");
    let origin: URL;
    try {
      origin = new URL(config.url);
    } catch {
      throw new CmsUnavailableError(false, "Invalid Directus origin");
    }
    const localHttp =
      config.allowHttpLocal &&
      origin.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(origin.hostname);
    if (
      (origin.protocol !== "https:" && !localHttp) ||
      origin.username ||
      origin.password ||
      origin.pathname !== "/" ||
      origin.search ||
      origin.hash
    )
      throw new CmsUnavailableError(
        false,
        "Directus must use an HTTPS origin without credentials, a path, query, or fragment",
      );
    const url = new URL(path, origin);

    for (const [key, value] of Object.entries(params))
      url.searchParams.set(key, value);
    let response: Response;
    try {
      response = await fetcher(url, {
        headers: {
          Authorization: `Bearer ${config.token}`,
          "User-Agent": "BlinkDisk-Blog/1.0",
        },
        signal: AbortSignal.timeout(8000),
        redirect: "manual",
      });
    } catch (error) {
      throw new CmsUnavailableError(
        true,
        `CMS fetch failed: ${error instanceof Error ? error.message.slice(0, 200) : "unknown error"}`,
      );
    }
    if (!response.ok)
      throw new CmsUnavailableError(
        response.status >= 500 || response.status === 429,
        `CMS HTTP ${response.status}`,
      );
    try {
      return ((await response.json()) as { data: unknown }).data;
    } catch {
      throw new CmsUnavailableError();
    }
  }
  function publicFilter(extra: Record<string, unknown> = {}) {
    return JSON.stringify({
      _and: [
        { status: { _eq: "published" } },
        { publication_date: { _lte: new Date(now()).toISOString() } },
        extra,
      ],
    });
  }
  async function cached<T>(
    key: string,
    load: () => Promise<T | null>,
  ): Promise<T | null> {
    const cacheKey =
      "https://blinkdisk.com/__blog-cache/v1/" +
      encodeURIComponent(config.url) +
      "/" +
      key;
    let previous: { savedAt: number; value: T } | undefined;
    try {
      const response = await cache?.match(cacheKey);
      if (response) previous = (await response.json()) as typeof previous;
    } catch {
      previous = undefined;
    }
    const age = previous ? now() - previous.savedAt : Infinity;
    if (previous && age >= 0 && age < FRESH_MS) return previous.value;
    try {
      const value = await load();
      try {
        if (value === null) await cache?.delete(cacheKey);
        else
          await cache?.put(
            cacheKey,
            Response.json(
              { savedAt: now(), value },
              { headers: { "Cache-Control": "public, max-age=3600" } },
            ),
          );
      } catch {
        /* Cache storage is best effort. */
      }
      return value;
    } catch (error) {
      if (
        previous &&
        age >= 0 &&
        age < RETAIN_MS &&
        ((error instanceof CmsUnavailableError && error.staleAllowed) ||
          error instanceof BlogContentError)
      )
        return previous.value;
      throw error;
    }
  }
  function parsePosts(value: unknown) {
    const parsed = blogPostSchema.array().safeParse(value);
    if (!parsed.success)
      throw new CmsUnavailableError(
        true,
        `Invalid CMS response: ${parsed.error.issues.map((issue) => issue.path.join(".")).join(", ")}`,
      );
    return parsed.data;
  }
  return {
    async list(): Promise<BlogPost[]> {
      return (
        (await cached("list", async () => {
          const posts: BlogPost[] = [];
          for (let offset = 0; ; offset += 100) {
            const page = parsePosts(
              await request("/items/blog_posts", {
                fields,
                filter: publicFilter(),
                sort: "-publication_date,slug",
                limit: "100",
                offset: String(offset),
              }),
            );
            posts.push(...page.filter((post) => isPublished(post, now())));
            if (page.length < 100) break;
          }
          return posts.sort(
            (a, b) =>
              Date.parse(b.publication_date) - Date.parse(a.publication_date) ||
              a.slug.localeCompare(b.slug),
          );
        })) ?? []
      );
    },
    async post(slug: string): Promise<PreparedPost | null> {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
      return cached(`post/${slug}`, async () => {
        const posts = parsePosts(
          await request("/items/blog_posts", {
            fields,
            filter: publicFilter({ slug: { _eq: slug } }),
            limit: "1",
          }),
        );
        const post = posts[0];
        if (!post || post.slug !== slug || !isPublished(post, now()))
          return null;
        return { post, content: parseContent(post.content) };
      });
    },
    async preview(id: string, version?: string): Promise<PreparedPost | null> {
      if (
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          id,
        )
      )
        return null;
      if (version && !/^[a-zA-Z0-9_-]{1,64}$/.test(version)) return null;
      const posts = parsePosts(
        await request("/items/blog_posts", {
          fields,
          filter: JSON.stringify({ id: { _eq: id } }),
          limit: "1",
        }),
      );
      let post = posts[0];
      if (post && version) {
        const versioned = blogPostSchema.safeParse(
          await request(`/items/blog_posts/${id}`, { fields, version }),
        );
        if (!versioned.success) throw new CmsUnavailableError();
        post = versioned.data;
      }
      return post ? { post, content: parseContent(post.content) } : null;
    },
  };
}
