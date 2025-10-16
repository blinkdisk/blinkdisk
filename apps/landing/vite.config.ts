import { config } from "dotenv";

config({
  path: "../../.env",
});

import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart as start } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
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
        POSTHOG_LANDING_KEY: undefined,
      },
      {
        loadEnvFiles: false,
      },
    ),
  ],
});
