import { config } from "dotenv";

config({
  path: "../../.env",
});

import { sentryVitePlugin } from "@sentry/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { TanStackRouterVite as router } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import env from "vite-plugin-environment";
import paths from "vite-tsconfig-paths";

export default defineConfig({
  clearScreen: false,
  base: "./",
  build: {
    sourcemap: true,
  },
  plugins: [
    devtools(),
    paths(),
    router({ target: "react", autoCodeSplitting: true }),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler", {}]],
      },
    }),
    tailwindcss(),
    env(
      {
        API_URL: undefined,
        MARKETING_URL: undefined,
        POSTHOG_DESKTOP_KEY: null,
        SENTRY_DESKTOP_DSN: null,
      },
      {
        loadEnvFiles: false,
      },
    ),
    sentryVitePlugin({
      org: process.env.SENTRY_ORGANIZATION,
      project: process.env.SENTRY_DESKTOP_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
});
