import paths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [paths()],
  test: {
    globals: true,
  },
});
