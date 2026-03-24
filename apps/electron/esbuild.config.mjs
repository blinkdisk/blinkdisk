/* eslint-disable no-undef */
import { config } from "dotenv";

config({
  path: "../../.env",
});

import { TsconfigPathsPlugin } from "@esbuild-plugins/tsconfig-paths";
import { sentryEsbuildPlugin } from "@sentry/esbuild-plugin";
import esbuild from "esbuild";

const ENV_WHITELIST = [
  "NODE_ENV",
  "DESKTOP_URL",
  "API_URL",
  "CLOUD_URL",
  "WEB_URL",
  "SENTRY_DESKTOP_DSN",
];

const env = {};
for (const key of ENV_WHITELIST) {
  env[`process.env.${key}`] = `"${process.env[key]}"`;
}

const isDev = process.argv[2] === "development";

const base = {
  minify: !isDev,
  entryPoints: ["./src/index.ts", "./src/preload.ts"],
  bundle: true,
  outdir: "build",
  target: "node16",
  // Set to hidden to reduce bundle size
  sourcemap: "hidden",
  plugins: [
    TsconfigPathsPlugin({ tsconfig: "./tsconfig.json" }),
    ...(!isDev
      ? [
          sentryEsbuildPlugin({
            org: process.env.SENTRY_ORGANIZATION,
            project: process.env.SENTRY_DESKTOP_PROJECT,
            authToken: process.env.SENTRY_AUTH_TOKEN,
            sourcemaps: {
              // Removing to reduce bundle size
              filesToDeleteAfterUpload: [
                "./**/*.map",
                ".*/**/public/**/*.map",
                "./dist/**/client/**/*.map",
              ],
            },
          }),
        ]
      : []),
  ],
  external: ["electron"],
  define: env,
};

const index = {
  ...base,
  banner: {
    js:
      "import { createRequire } from 'module';\n" +
      "const require = createRequire(import.meta.url);",
  },
  entryPoints: ["./src/index.ts"],
  format: "esm",
  platform: "node",
};

const preload = {
  ...base,
  entryPoints: ["./src/preload.ts"],
  format: "cjs",
  platform: "browser",
};

if (isDev) {
  await Promise.all([
    (await esbuild.context(index)).watch(),
    (await esbuild.context(preload)).watch(),
  ]);
} else {
  await Promise.all([esbuild.build(index), esbuild.build(preload)]);
}
