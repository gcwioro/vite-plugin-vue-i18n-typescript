/// <reference types="./src/vite-env-override.d.ts" />
import {defineConfigWithVueTs, vueTsConfigs} from '@vue/eslint-config-typescript'
import {globalIgnores} from 'eslint/config'
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';
import vueParser from 'vue-eslint-parser';
// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {

    name: 'app/files-to-lint',
    files: ['src/**/*.{ts,mts,tsx,vue}'],
  },
// eslint load env-override.d.ts even if not imported directly

  globalIgnores(['**/dist/**', 'eslint.config.ts', '**/dist-ssr/**', '**/coverage/**']),

  vueTsConfigs.recommendedTypeChecked.toConfigArray(),

  importPlugin.flatConfigs.recommended,

  {
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    }
  }
  ,
  {

    rules: {
      'import/no-unresolved': 'off',
      'import/order': [
        'warn',
        {
          'newlines-between': 'always',
          distinctGroup: true,
          alphabetize: {order: 'asc'},
          pathGroups: [
            {pattern: '@/**', group: 'internal', position: 'after'},
            {pattern: './**', group: 'sibling', position: 'before'},
            {pattern: '@virtual**', group: 'builtin', position: 'after'}
          ],
          groups: [
            'builtin',
            'external',
            'internal',
            'object',
            'sibling'
          ]
        }]
    }
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
