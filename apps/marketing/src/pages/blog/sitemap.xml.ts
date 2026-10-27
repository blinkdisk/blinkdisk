import { MARKETING_URL } from "astro:env/server";
import { blogService } from "@marketing/blog/runtime";
import { blogSitemapResponse } from "@marketing/blog/sitemap";
import * as Sentry from "@sentry/astro";
import type { APIRoute } from "astro";
export const prerender = false;
export const GET: APIRoute = () =>
  blogSitemapResponse(
    () => blogService().list(),
    MARKETING_URL ?? "https://blinkdisk.com",
    (error) => {
      console.error("Unable to load blog sitemap", error);
      Sentry.captureException(error);
    },
  );
