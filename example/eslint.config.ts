/// <reference types="./src/vite-env-override.d.ts" />
import {defineConfigWithVueTs, vueTsConfigs} from '@vue/eslint-config-typescript'
import {globalIgnores} from 'eslint/config'
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';
import vueParser from 'vue-eslint-parser';

console.log(importPlugin.flatConfigs.typescript)
// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default tseslint.config(
  {

    name: 'app/files-to-lint',
    files: ['src/**/*.{ts,mts,tsx,vue}'],
  },
  {extends: [vueTsConfigs.stylisticTypeChecked.toConfigArray()]},

// eslint load env-override.d.ts even if not imported directly

  globalIgnores(['**/dist/**', 'eslint.config.ts', '**/dist-ssr/**', '**/coverage/**']),

  vueTsConfigs.stylisticTypeChecked.toConfigArray(),

  importPlugin.flatConfigs.typescript,

  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', {
        "args": "all",
        "argsIgnorePattern": "*",
        "caughtErrors": "all",
        "caughtErrorsIgnorePattern": "^_",
        "destructuredArrayIgnorePattern": "^_",
        "varsIgnorePattern": "*",
        "ignoreRestSiblings": true
      }],
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    }
  },
  // {
  //   settings: {
  //      "import/cache": {
  //     "lifetime": "∞", // or Infinity, in a JS config
  //   },
  //     "import/parsers": {
  //       "@typescript-eslint/parser": [".ts", ".vue"],
  //     },
  //   },
  //   files: ['**/*.{ts,tsx,vue}'],
  //   extends: [importPlugin.flatConfigs.recommended, importPlugin.flatConfigs.typescript],
  //   // other configs...
  //   rules: {
  //     'import/no-unresolved': 'off',
  //     'import/order': [
  //       'error',
  //       {
  //         'newlines-between': 'always',
  //
  //         distinctGroup: false,
  //
  //         pathGroups: [
  //           {pattern: 'vue', group: 'builtin', position: 'before'},
  //           // {pattern: './**', group: 'sibling', position: 'before'},
  //           {pattern: 'virtual:vue-i18n-types**', group: 'sibling', position: 'after'},
  //
  //         ],
  //         groups: [
  //           'type',
  //           'builtin',
  //           'external',
  //           'internal',
  //           'object',
  //           'index',
  //           'sibling'
  //         ]
  //       }]
  //   }
  // },
  {

    // rules: {
    //   "sort-imports": ["error", {
    //     "ignoreCase": false,
    //     "ignoreDeclarationSort": false,
    //     "ignoreMemberSort": false,
    //     "memberSyntaxSortOrder": ["none", "all", "multiple", "single"],
    //     "allowSeparatedGroups": false
    //   }],
    //
    // }
  },
  {
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        extraFileExtensions: ['.vue', '.json'],
        ecmaVersion: 2020,
        sourceType: 'module',
        projectService: true,

        parser: tseslint.parser,
        // projectService: true,
      },
    },
  },
)
