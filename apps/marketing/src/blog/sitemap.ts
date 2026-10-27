import type { BlogPost } from "@marketing/blog/schema";

function xml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
}
export async function blogSitemapResponse(
  load: () => Promise<BlogPost[]>,
  siteUrl: string,
  reportError: (error: unknown) => void,
) {
  try {
    const posts = await load();
    const urls = posts
      .map((post) => {
        const modified = Math.max(
          ...[post.publication_date, post.last_updated, post.date_updated]
            .filter((date): date is string => Boolean(date))
            .map(Date.parse),
        );
        return `<url><loc>${xml(new URL(`/blog/${post.slug}`, siteUrl).toString())}</loc><lastmod>${new Date(modified).toISOString()}</lastmod></url>`;
      })
      .join("");
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
        urls +
        "</urlset>",
      {
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    reportError(error);
    return new Response("Blog sitemap temporarily unavailable.", {
      status: 503,
      headers: { "Retry-After": "60", "Cache-Control": "no-store" },
    });
  }
}
