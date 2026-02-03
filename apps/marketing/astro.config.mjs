// @ts-check
import { defineConfig } from "astro/config";
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
    adapter: cloudflare({
        imageService: "compile",
    }),
    integrations: [react(), sitemap()],
    vite: {
        plugins: [tailwindcss()],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
                "@ui": path.resolve(__dirname, "../../libs/ui/src"),
                "@utils": path.resolve(__dirname, "../../libs/utils/src"),
                "@hooks": path.resolve(__dirname, "../../libs/hooks/src"),
                "@styles": path.resolve(__dirname, "../../libs/styles"),
                "@config": path.resolve(__dirname, "../../libs/config/src"),
            },
        },
    },
});
