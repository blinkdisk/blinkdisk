import type { KnipConfig } from "knip";

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
      entry: ["src/index.ts"],
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
      entry: ["src/index.ts"],
      project: commonProject,
      ignore: [...commonIgnore, "src/preload.ts"],
    },
    "apps/marketing": {
      ignore: commonIgnore,
      ignoreDependencies: [
        // Used in CSS url() imports which knip doesn't detect
        "@fontsource-variable/inter",
        "@fontsource/space-mono",
        // Used internally by Astro image processing
        "sharp",
        // Used in eslint.config.mjs (eslint provided via @blinkdisk/eslint)
        "eslint-plugin-astro",
      ],
      ignoreBinaries: ["eslint"],
    },
    "libs/config": {
      entry: commonProject,
      project: commonProject,
      ignore: commonIgnore,
    },
    "libs/db": {
      entry: commonProject,
      project: commonProject,
      ignore: commonIgnore,
    },
    "libs/emails": {
      entry: commonProject,
      project: commonProject,
      ignore: commonIgnore,
    },
    "libs/hooks": {
      entry: commonProject,
      project: commonProject,
      ignore: commonIgnore,
    },
    "libs/schemas": {
      entry: commonProject,
      project: commonProject,
      ignore: commonIgnore,
    },
    "libs/ui": {
      entry: commonProject,
      project: commonProject,
      ignore: commonIgnore,
    },
    "libs/utils": {
      entry: commonProject,
      project: commonProject,
      ignore: commonIgnore,
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
    // Used in the global.css file, required when imported in apps
    "../../ui/src",
    // Vite allows adding "?url" to an import
    /.+\?url$/,
  ],
  ignoreIssues: {
    "apps/marketing/src/components/react/**": ["exports"],
  },
  ignoreDependencies: ["@types/electron", "@blinkdisk/.+", "cloudflare"],
  paths: {
    "@ui/*": ["./libs/ui/src/*"],
    "@api/*": ["./apps/api/src/*"],
    "@marketing/*": ["./apps/marketing/src/*"],
    "@styles/*": ["./libs/styles/*"],
    "@utils/*": ["./libs/utils/src/*"],
    "@desktop/*": ["./apps/desktop/src/*"],
    "@hooks/*": ["./libs/hooks/src/*"],
    "@db/*": ["./libs/db/src/*"],
    "@db": ["./libs/db/src/index.ts"],
    "@emails/*": ["./libs/emails/src/*"],
    "@schemas/*": ["./libs/schemas/src/*"],
    "@config/*": ["./libs/config/src/*"],
    "@electron/*": ["./apps/electron/src/*"],
    "@cloud/*": ["./apps/cloud/src/*"],
  },
};

export default config;
