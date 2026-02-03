import { config as reactConfig } from "@blinkdisk/eslint/react.mjs";

export default [
  ...reactConfig,
  {
    ignores: [".astro/**"],
  },
  {
    rules: {
      "react/no-unescaped-entities": "off",
    },
  },
];
