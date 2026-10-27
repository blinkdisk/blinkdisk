import { blogService } from "@marketing/blog/runtime";
import type { APIRoute } from "astro";
export const prerender = false;
export const GET: APIRoute = async () => {
  try {
    const posts = await blogService().list();
    const urls = posts
      .map(
        (post) =>
          "<url><loc>https://blinkdisk.com/blog/" +
          post.slug +
          "</loc><lastmod>" +
          new Date(
            post.last_updated ?? post.date_updated ?? post.publication_date,
          ).toISOString() +
          "</lastmod></url>",
      )
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
  } catch {
    return new Response("Blog sitemap temporarily unavailable.", {
      status: 503,
      headers: { "Retry-After": "60", "Cache-Control": "no-store" },
    });
  }
};
