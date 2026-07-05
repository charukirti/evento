import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default defineConfig([
    {
        ignores: ["dist/**", "build/**", "node_modules/**", "*.config.js", "drizzle/**"],
    },
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
        plugins: {
            js,
        },
        extends: ["js/recommended", tseslint.configs.recommended],

        rules: {
            "no-console": "warn",

            "@typescript-eslint/no-unused-vars": ["warn", {
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_",
            }],

            "prefer-const": "off",

            "@typescript-eslint/no-empty-object-type": 'off',
            "@typescript-eslint/no-explicit-any": "warn"
        },

    },

]);
