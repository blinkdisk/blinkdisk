import { defineConfig } from "vitest/config";
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    include: ["src/blog/**/*.test.ts", "scripts/directus/**/*.test.mjs"],
  },
});
