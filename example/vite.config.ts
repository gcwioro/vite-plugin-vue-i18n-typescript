/// <reference types="./src/vite-env-override" />
/// <reference types="vite/client" />

import {join} from "path";
import {fileURLToPath, URL} from "url";

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import {defineConfig} from 'vite'
import viteTsChecker from 'vite-plugin-checker';
import {viteSingleFile} from "vite-plugin-singlefile"
import vitePluginVueI18nTypes from "vite-plugin-vue-i18n-types";
// @xts-nocheck
// import vitePluginVueI18nTypes from "../src/plugin.ts";

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  plugins: [
    vue(),
    viteTsChecker({
      overlay: {initialIsOpen: true},
      typescript: true,
      vueTsc: {root: __dirname, tsconfigPath: join('./tsconfig.app.json')}

    }),
    // @ts-expect-error Only because of import of ../src/..
    vitePluginVueI18nTypes({
      baseLocale: 'en',
      debug: true,
      // virtualFilePath: './src/i18n/virtual.js',
      emit: {emitJson: false, inlineDataInBuild: true}
    }),
    tailwindcss(),
    viteSingleFile()

  ],
})
