import eslintPluginAstro from "eslint-plugin-astro";
import {
    config as reactConfig,
} from "../../libs/eslint/react.mjs";

export default [
  ...reactConfig,
  ...eslintPluginAstro.configs.recommended,
  {
    ignores: [".astro/**"],
  },
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@lucide/astro",
              message:
                'Import icons directly from "@lucide/astro/icons/<icon-name>" for better tree-shaking.',
            },
          ],
        },
      ],
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
