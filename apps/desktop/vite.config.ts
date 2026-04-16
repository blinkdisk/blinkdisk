import { config } from "dotenv";

config({
  path: "../../.env",
});

import { sentryVitePlugin } from "@sentry/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { TanStackRouterVite as router } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vite";
import env from "vite-plugin-environment";
import { viteStaticCopy as copy } from "vite-plugin-static-copy";
import paths from "vite-tsconfig-paths";

// Path alias seems to break build in CI
import { INTERNAL_PROTOCOL } from "../../libs/constants/src/app";

function injectAppConfig(): Plugin {
  return {
    name: "inject-app-config",
    transformIndexHtml(html) {
      return html.replaceAll("__INTERNAL_PROTOCOL__", INTERNAL_PROTOCOL);
    },
  };
}

export default defineConfig({
  clearScreen: false,
  base: "./",
  build: {
    // Set to hidden to reduce bundle size
    sourcemap: "hidden",
  },
  server: { port: 3002 },
  plugins: [
    devtools({
      eventBusConfig: {
        port: 5001,
      },
    }),
    injectAppConfig(),
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
        WEB_URL: undefined,
        MARKETING_URL: undefined,
        POSTHOG_KEY: null,
        SENTRY_DESKTOP_DSN: null,
        LOGSNAG_PUBLIC_KEY: null,
        DEMO: null,
      },
      {
        loadEnvFiles: false,
      },
    ),
    sentryVitePlugin({
      org: process.env.SENTRY_ORGANIZATION,
      project: process.env.SENTRY_DESKTOP_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        // Remove to reduce bundle size
        filesToDeleteAfterUpload: [
          "./**/*.map",
          ".*/**/public/**/*.map",
          "./dist/**/client/**/*.map",
        ],
      },
    }),
    copy({
      targets: [
        {
          src: ["../../locales/"],
          dest: ".",
        },
        {
          src: ["../../libs/styles/fonts/"],
          dest: ".",
        },
      ],
    }),
  ],
});
