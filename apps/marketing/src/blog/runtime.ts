import { getSecret } from "astro:env/server";
import { type BlogCache, createBlogService } from "@marketing/blog/service";

export function directusUrl() {
  return getSecret("DIRECTUS_URL") ?? "";
}
export function blogService() {
  const cache = (
    globalThis as typeof globalThis & { caches?: { default?: BlogCache } }
  ).caches?.default;
  return createBlogService(
    { url: directusUrl(), token: getSecret("DIRECTUS_TOKEN") ?? "" },
    cache,
  );
}
