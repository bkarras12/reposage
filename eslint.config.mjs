import tsParser from "@typescript-eslint/parser";
import js from "@eslint/js";

export default [
  {
    ignores: ["node_modules/", ".next/", "out/"],
  },
  js.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
      globals: {
        // Browser globals
        React: "readonly",
        console: "readonly",
        fetch: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        URL: "readonly",
        Response: "readonly",
        Request: "readonly",
        Headers: "readonly",
        HTMLDivElement: "readonly",
        HTMLButtonElement: "readonly",
        HTMLSpanElement: "readonly",
        HTMLElement: "readonly",
        // Node globals
        process: "readonly",
        Buffer: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["src/**/*.d.ts", "src/**/auth.ts"],
    rules: {
      "no-unused-vars": "off",
    },
  },
];
