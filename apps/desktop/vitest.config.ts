import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import paths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    paths(),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler", {}]],
      },
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockData/",
        "**/*.test.{ts,tsx}",
      ],
    },
  },
});