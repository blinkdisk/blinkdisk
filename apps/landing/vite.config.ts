import { config } from "dotenv";

config({
  path: "../../.env",
});

import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart as start } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { writeFileSync } from "fs";
import type { Plugin } from "vite";
import { defineConfig } from "vite";
import env from "vite-plugin-environment";
import paths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    paths(),
    start({}),
    react(),
    tailwindcss(),
    env(
      {
        LANDING_URL: undefined,
        LOGSNAG_PUBLIC_KEY: undefined,
        POSTHOG_API_HOST: undefined,
        POSTHOG_LANDING_KEY: undefined,
        CRISP_KEY: null,
      },
      {
        loadEnvFiles: false,
      },
    ),
    sitemap(),
  ],
});

function sitemap(): Plugin {
  function update() {
    const manifest = (
      globalThis as unknown as {
        TSS_ROUTES_MANIFEST: { routes: Record<string, string> };
      }
    ).TSS_ROUTES_MANIFEST;
    if (!manifest || !manifest.routes) return;

    const routes = Object.keys(manifest.routes);
    const today = new Date().toISOString().split("T")[0];

    const sitemapContent = [
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">',
      routes
        .filter((route) => route !== "__root__")
        .map((route) => route.replace(/^\/\([^)]*\)/g, ""))
        .map((route) =>
          [
            `   <url>`,
            `      <loc>https://blinkdisk.com${route}</loc>`,
            `      <lastmod>${today}</lastmod>`,
            `      <changefreq>daily</changefreq>`,
            `      <priority>0.7</priority>`,
            `   </url>`,
          ].join("\n"),
        )
        .join("\n"),
      "</urlset>",
    ].join("\n");

    writeFileSync("public/sitemap.xml", sitemapContent, "utf8");
  }

  return {
    name: "vite-plugin-sitemap",
    buildStart: update,
    buildEnd: update,
    hotUpdate: update,
  };
}
