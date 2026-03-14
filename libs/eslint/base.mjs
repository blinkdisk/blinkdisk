import js from "@eslint/js";
import path from "node:path";
import eslintConfigPrettier from "eslint-config-prettier";
import onlyWarn from "eslint-plugin-only-warn";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";

const ALIAS_TO_DIR = {
  "@ui": "libs/ui",
  "@api": "apps/api",
  "@marketing": "apps/marketing",
  "@styles": "libs/styles",
  "@utils": "libs/utils",
  "@desktop": "apps/desktop",
  "@hooks": "libs/hooks",
  "@db": "libs/db",
  "@emails": "libs/emails",
  "@schemas": "libs/schemas",
  "@config": "libs/config",
  "@forms": "libs/forms",
  "@electron": "apps/electron",
  "@cloud": "apps/cloud",
};

const aliasImportsPlugin = {
  rules: {
    "no-cross-package-alias": {
      meta: {
        type: "problem",
        docs: {
          description:
            "Forbid using path aliases for cross-package imports. Use @blinkdisk/<pkg> instead.",
        },
        messages: {
          crossPackageAlias:
            'Use "{{ suggested }}" instead of "{{ source }}". Path aliases are only for same-package imports.',
        },
      },
      create(context) {
        const filename = context.filename ?? context.getFilename();
        return {
          ImportDeclaration(node) {
            const source = node.source.value;
            if (typeof source !== "string") return;

            for (const [alias, dir] of Object.entries(ALIAS_TO_DIR)) {
              if (source !== alias && !source.startsWith(alias + "/")) continue;

              const normalizedFile = filename.split(path.sep).join("/");
              const dirParts = dir.split("/");

              const dirIdx = normalizedFile.lastIndexOf(
                `/${dirParts.join("/")}/`,
              );
              if (dirIdx !== -1) break;

              const pkgName = dirParts[dirParts.length - 1];
              const rest = source.slice(alias.length);
              const suggested = `@blinkdisk/${pkgName}${rest}`;

              context.report({
                node: node.source,
                messageId: "crossPackageAlias",
                data: { source, suggested },
              });
              break;
            }
          },
        };
      },
    },
  },
};

/**
 * A base ESLint configuration for all libraries.
 *
 * @type {import("eslint").Linter.Config[]} */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { ignoreRestSiblings: true },
      ],
    },
  },
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    plugins: {
      "alias-imports": aliasImportsPlugin,
    },
    rules: {
      "alias-imports/no-cross-package-alias": "error",
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    ignores: [
      "dist/**",
      "build/**",
      "out/**",
      ".wrangler/**",
      ".astro/**",
      "worker-configuration.d.ts",
    ],
  },
];
