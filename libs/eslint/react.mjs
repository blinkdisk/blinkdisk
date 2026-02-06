import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginReact from "eslint-plugin-react";
import reactCompiler from "eslint-plugin-react-compiler";
import pluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";
import { config as baseConfig } from "./base.mjs";

const lucideIconPlugin = {
  rules: {
    "icon-suffix": {
      meta: {
        type: "suggestion",
        docs: {
          description: "Enforce Icon suffix on lucide icon imports",
        },
        messages: {
          missingSuffix:
            'Lucide icon imports must end with "Icon" (e.g., {{ suggestion }} instead of {{ name }}).',
        },
      },
      create(context) {
        return {
          ImportDeclaration(node) {
            const source = node.source.value;
            if (
              typeof source === "string" && (
                source.startsWith("@lucide/astro/icons/") || source.startsWith("lucide-react")
              )
            ) {
              for (const specifier of node.specifiers) {
                const isDefaultImport =
                  specifier.type === "ImportDefaultSpecifier";
                const isNamedImport = specifier.type === "ImportSpecifier";

                if (
                  (isDefaultImport || isNamedImport) &&
                  !specifier.local.name.endsWith("Icon")
                ) {
                  context.report({
                    node: specifier,
                    messageId: "missingSuffix",
                    data: {
                      name: specifier.local.name,
                      suggestion: specifier.local.name + "Icon",
                    },
                  });
                }
              }
            }
          },
        };
      },
    },
  },
};

/**
 * A custom ESLint configuration for libraries that use React.
 *
 * @type {import("eslint").Linter.Config[]} */
export const config = [
  ...baseConfig,
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
    },
  },
  {
    plugins: {
      lucide: lucideIconPlugin,
    },
    rules: {
      "lucide/icon-suffix": "error",
    },
  },
  reactCompiler.configs.recommended,
];
