import { config } from "dotenv";

config({
  path: "../../.env",
});

import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite as router } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import env from "vite-plugin-environment";
import paths from "vite-tsconfig-paths";

export default defineConfig({
  clearScreen: false,
  base: "./",
  plugins: [
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
        LANDING_URL: undefined,
        POSTHOG_DESKTOP_KEY: null,
      },
      {
        loadEnvFiles: false,
      },
    ),
  ],
});
