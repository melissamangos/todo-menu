import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: ["**/dist/**", "**/coverage/**", "**/node_modules/**"],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    rules: {
      // TypeScript already reports undefined identifiers at compile time, and
      // does so more accurately than ESLint's scope-based analysis (which
      // doesn't understand ambient/global types). See typescript-eslint's docs
      // on rules you don't need: https://typescript-eslint.io/troubleshooting/faqs/general#eslint-plugin-import
      "no-undef": "off",
      // Express's error-handling middleware needs a 4-arg signature to be
      // recognized by arity, even when a param goes unused (see
      // server/src/middleware/error.middleware.ts) — underscore-prefixed
      // params signal "intentionally unused" instead of being deleted.
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },

  // Server + shared: plain Node/TS
  {
    files: ["server/**/*.ts", "shared/**/*.ts"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },

  // Client: browser environment + React hooks rules
  {
    files: ["client/src/**/*.{ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser },
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  // Turns off ESLint stylistic rules that would conflict with Prettier.
  // Keep this last so it wins over the rule sets above.
  prettierConfig,
);
