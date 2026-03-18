import { readFileSync } from "fs";
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
      entry: ["src/main.tsx"],
      project: commonProject,
      ignore: commonIgnore,
    },
    "apps/electron": {
      project: commonProject,
      ignore: [...commonIgnore, "src/preload.ts"],
    },
    "apps/marketing": {
      ignore: commonIgnore,
      ignoreDependencies: [
        // Used in CSS url() imports which knip doesn't detect
        "@fontsource/space-mono",
        // Used in eslint.config.mjs (eslint provided via @blinkdisk/eslint)
        "eslint-plugin-astro",
        // Used in CSS
        "@tailwindcss/typography",
      ],
      ignoreBinaries: ["eslint"],
    },
    "libs/*": {
      includeEntryExports: true,
      project: commonProject,
      ignore: commonIgnore,
    },
    "libs/db": {
      ignore: ["src/schema.ts"],
    },
    "libs/eslint": {
      entry: ["*.mjs"],
      project: ["*.mjs"],
      ignore: ["node_modules/**"],
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
  ignoreUnresolved: [
    // Vite allows adding "?url" to an import
    /.+\?url$/,
  ],
  ignoreIssues: {
    "apps/marketing/src/components/react/**": ["exports"],
  },
  ignoreDependencies: [
    "@types/electron",
    "@blinkdisk/.+",
    "cloudflare",
    "@sentry/cloudflare",
    "@sentry/cli",
  ],
  paths: tsconfig.compilerOptions.paths,
};

export default config;
