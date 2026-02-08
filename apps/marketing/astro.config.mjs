import { defineConfig, envField } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import mermaid from "astro-mermaid";
import mdx from "@astrojs/mdx";
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
    integrations: [
        mermaid({
            theme: "base",
            autoTheme: false,
            mermaidConfig: {
                themeVariables: {
                    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
                    fontSize: "20px",
                    clusterLabelFontSize: "25px",
                    primaryColor: "#2d2d32",
                    primaryTextColor: "#fafafa",
                    primaryBorderColor: "#3f3f46",
                    secondaryColor: "#2d2d32",
                    secondaryTextColor: "#fafafa",
                    secondaryBorderColor: "#3f3f46",
                    tertiaryColor: "#27272a",
                    tertiaryTextColor: "#fafafa",
                    tertiaryBorderColor: "#3f3f46",
                    lineColor: "#a1a1aa",
                    textColor: "#e4e4e7",
                    mainBkg: "#2d2d32",
                    nodeBorder: "#3f3f46",
                    clusterBkg: "#18181b",
                    clusterBorder: "#3f3f46",
                    titleColor: "#fafafa",
                    edgeLabelBackground: "#27272a",
                    nodeTextColor: "#fafafa",
                },
                flowchart: {
                    htmlLabels: true,
                    curve: "basis",
                    nodeSpacing: 50,
                    rankSpacing: 50,
                    padding: 20,
                    useMaxWidth: true,
                    subGraphTitleMargin: { top: 10, bottom: 10 },
                    wrappingWidth: 200,
                },
            },
        }),
        mdx(),
        react(),
        sitemap(),
    ],
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
