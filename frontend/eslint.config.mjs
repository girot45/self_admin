import js from "@eslint/js";
import vue from "eslint-plugin-vue";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "*.config.js",
      "*.config.mjs",
      "postcss.config.js",
      "tailwind.config.js",
    ],
  },
  js.configs.recommended,
  ...vue.configs["flat/essential"],
  {
    files: ["src/**/*.{js,vue}"],
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "vue/multi-word-component-names": "off",
    },
  },
];
