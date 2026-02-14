import type { APIRoute } from "astro";
import { generateOgImage, createOgImageResponse } from "@marketing/utils/og-image";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const title = url.searchParams.get("title") || "BlinkDisk";
  const description = url.searchParams.get("description") || "Backup and secure your files";
  const badge = url.searchParams.get("badge") || undefined;

  const png = await generateOgImage({ title, description, badge });
  return createOgImageResponse(png);
};
