import { readFileSync } from "node:fs";
import type { KnipConfig } from "knip";

const tsconfigRaw = readFileSync("./libs/typescript/base.json", "utf8");
const tsconfig = JSON.parse(tsconfigRaw);

const commonIgnore = [
  "src/**/*.test.{ts,tsx}",
  "src/**/*.spec.{ts,tsx}",
  "src/**/__tests__/**",
  "src/**/*.d.ts",
];

const commonProject = ["src/**/*.{ts,tsx}"];

const config: KnipConfig = {
  compilers: {
    mdx: true,
  },
  workspaces: {
    ".": {
      entry: [],
      project: ["turbo.json"],
    },
    "apps/api": {
      project: commonProject,
      ignore: commonIgnore,
    },
    "apps/cloud": {
      entry: ["src/index.ts"],
      project: commonProject,
      ignore: commonIgnore,
    },
    "apps/desktop": {
      entry: ["src/main.tsx", "vite.config.ts"],
      project: commonProject,
      ignore: commonIgnore,
      ignoreDependencies: [
        // Referenced by name in vite.config.ts.
        "babel-plugin-react-compiler",
      ],
      // Vite resolves this from apps/desktop/public at build time.
      ignoreUnresolved: [/^\/animations\/backup\.lottie(\?url)?$/],
      vite: { config: [] },
    },
    "apps/electron": {
      project: commonProject,
      ignore: [...commonIgnore, "src/preload.ts"],
    },
    "apps/web": {
      entry: ["src/main.tsx", "vite.config.ts"],
      project: commonProject,
      ignore: commonIgnore,
      ignoreDependencies: [
        // Referenced by name in vite.config.ts.
        "babel-plugin-react-compiler",
      ],
      vite: { config: [] },
    },
    "apps/marketing": {
      entry: [
        "src/pages/**/*.{astro,ts}",
        "src/content/**/*.mdx",
        "src/components/Callout.astro",
      ],
      project: ["src/**/*.{astro,mdx,ts,tsx}"],
      ignore: commonIgnore,
      ignoreDependencies: [
        // Used in CSS url() imports which knip doesn't detect
        "@fontsource/space-mono",
        // Used in CSS
        "@tailwindcss/typography",
      ],
    },
    "libs/*": {
      includeEntryExports: true,
      project: commonProject,
      ignore: commonIgnore,
    },
    "libs/db": {
      ignore: ["src/schema.ts"],
    },
    "libs/biome": {
      project: ["*.grit"],
    },
    "libs/styles": {
      entry: ["*.css"],
      project: ["*.css"],
    },
    "libs/typescript": {
      entry: ["*.json"],
      project: ["*.json"],
    },
    "libs/assets": {
      entry: [],
      project: [],
    },
  },
  ignore: [
    "node_modules/**",
    ".next/**",
    "dist/**",
    "build/**",
    ".turbo/**",
    "**/*.config.{js,ts,mjs,cjs}",
    "**/.turbo/**",
    "coverage/**",
    ".wrangler/**",
    "*.d.ts",
  ],
  ignoreIssues: {
    "apps/marketing/src/components/react/**": ["exports"],
  },
  ignoreDependencies: [
    "@blinkdisk/.+",
    "cloudflare",
    "@sentry/cloudflare",
    "@sentry/cli",
  ],
  paths: tsconfig.compilerOptions.paths,
};

export default config;
