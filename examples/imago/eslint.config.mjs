import globals from "globals";
import nextPlugin from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "public/**",
      "coverage/**",
      "*.config.js",
      "*.config.cjs"
    ]
  },
  tseslint.configs.base,
  nextPlugin.configs["core-web-vitals"],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "@next/next/no-img-element": "off"
    }
  }
];