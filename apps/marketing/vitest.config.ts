import { getViteConfig } from "astro/config";
import { defineConfig } from "vitest/config";

export default getViteConfig(
  defineConfig({
    envDir: false,
    resolve: { tsconfigPaths: true },
    test: {
      include: ["src/blog/**/*.test.ts"],
    },
  }),
  { configFile: false, vite: { envDir: false } },
);
