/// <reference types="./src/vite-env-override.d.ts" />
/// <reference types="vite-plugin-vue-i18n-typescript" />
/// <reference types="vite/client" />

import {join} from "path";
import {URL, fileURLToPath} from "url";

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import {defineConfig} from 'vite'
import viteTsChecker from 'vite-plugin-checker';
import {viteSingleFile} from "vite-plugin-singlefile"

import vitePluginVueI18nTypes from "vite-plugin-vue-i18n-typescript";
// @xts-nocheck
// import vitePluginVueI18nTypes from "../../dist/index";

export default defineConfig({
  resolve: {

    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {sourcemap: true, minify: false},
  plugins: [
    vue(),
    viteTsChecker({
      overlay: {initialIsOpen: true},
      typescript: true,
      vueTsc: {root: __dirname, tsconfigPath: join('./tsconfig.app.json')}

    }),
    //@ts-expect-error Only because of import of ../src/..
    vitePluginVueI18nTypes({
      baseLocale: 'en',
      include: ['./src/**/*.json',],
      // exclude: ['src/**/FileMergingDemo.de.json',],
      typesPath: 'src/vite-env-override.d.ts',
      // virtualFilePath: 'src/i18n/i18n.virtual.gen.js',
      debug: true,

    } as any),
    tailwindcss(),

  ],
})
