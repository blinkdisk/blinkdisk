import { config } from "dotenv";

config({
  path: "../../.env",
});

import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "@tanstack/react-start/config";
import { cloudflare } from "unenv";
import env from "vite-plugin-environment";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    preset: "cloudflare-pages",
    unenv: cloudflare,
  },
  vite: {
    plugins: [
      tsConfigPaths(),
      tailwindcss(),
      env(
        {
          LOGSNAG_PUBLIC_KEY: undefined,
          POSTHOG_LANDING_KEY: undefined,
        },
        {
          loadEnvFiles: false,
        },
      ),
    ],
    build: {
      cssCodeSplit: false,
    },
  },
});
