import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";
import typescriptEslintParser from "@typescript-eslint/parser";

export default [
    {
        files: ["src/**/*.ts"],
        languageOptions: {
            parser: typescriptEslintParser,
            parserOptions: {
                project: "./tsconfig.json",
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            "@typescript-eslint": typescriptEslintPlugin,
        },
        rules: {
            ...typescriptEslintPlugin.configs["recommended"].rules,
            "@typescript-eslint/explicit-function-return-type": "warn",
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-unused-vars": "error",
        },
    },
];