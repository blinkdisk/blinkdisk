// @ts-nocheck
import { config as reactConfig } from "@blinkdisk/eslint/react.mjs";
import eslintPluginAstro from "eslint-plugin-astro";

export default [
  ...reactConfig,
  ...eslintPluginAstro.configs.recommended,
  {
    ignores: [".astro/**"],
  },
  {
    rules: {
      "react/no-unescaped-entities": "off",
    },
  },
  {
    files: ["**/*.astro"],
    rules: {
      "react/no-unknown-property": "off",
      "react/jsx-key": "off",
      "react/jsx-no-undef": "off",
    },
  },
  {
    // Script blocks inside Astro files (inline vendor scripts)
    files: ["**/*.astro/*.js", "**/*.astro/*.ts"],
    rules: {
      "no-var": "off",
      "prefer-rest-params": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
