import { defineConfig, envField } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
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
    env: {
        schema: {
            API_URL: envField.string({ context: "server", access: "public", optional: true }),
            MARKETING_URL: envField.string({ context: "server", access: "public", optional: true }),
            LOGSNAG_PUBLIC_KEY: envField.string({ context: "client", access: "public", optional: true }),
            POSTHOG_MARKETING_KEY: envField.string({ context: "server", access: "public", optional: true }),
            POSTHOG_API_HOST: envField.string({ context: "server", access: "public", optional: true }),
            ENDORSELY_PUBLIC_KEY: envField.string({ context: "server", access: "public", optional: true }),
            CRISP_KEY: envField.string({ context: "server", access: "public", optional: true }),
        },
    },
    vite: {
        plugins: [tailwindcss()],
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
