/* eslint-disable no-undef */
import { config } from "dotenv";

config({
  path: "../../.env",
});

import { TsconfigPathsPlugin } from "@esbuild-plugins/tsconfig-paths";
import esbuild from "esbuild";

const ENV_WHITELIST = ["API_URL", "CLOUD_URL"];

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
  plugins: [TsconfigPathsPlugin({ tsconfig: "./tsconfig.json" })],
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
