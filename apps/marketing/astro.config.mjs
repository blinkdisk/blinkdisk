import { config } from "dotenv";

config({
  path: "../../.env",
});

import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import env from "vite-plugin-environment";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    site: "https://blinkdisk.com",
    output: "static",
    prefetch: true,
    trailingSlash: "never",
    server: { port: 3000 },
    adapter: cloudflare({
        imageService: "compile",
    }),
    integrations: [react(), sitemap()],
    vite: {
        plugins: [
          tailwindcss(),
          env(
            {
              API_URL: undefined,
              MARKETING_URL: undefined,
              LOGSNAG_PUBLIC_KEY: null,
              POSTHOG_MARKETING_KEY: null,
              POSTHOG_API_HOST: null,
              ENDORSELY_PUBLIC_KEY: null,
              CRISP_KEY: null,
            },
            {
              loadEnvFiles: false,
            },
          )
        ],
        resolve: {
            alias: {
                "@marketing": path.resolve(__dirname, "./src"),
                "@ui": path.resolve(__dirname, "../../libs/ui/src"),
                "@utils": path.resolve(__dirname, "../../libs/utils/src"),
                "@hooks": path.resolve(__dirname, "../../libs/hooks/src"),
                "@styles": path.resolve(__dirname, "../../libs/styles"),
                "@config": path.resolve(__dirname, "../../libs/config/src"),
            },
        },
    },
});
