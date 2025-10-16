// @ts-nocheck - Skip type checking due to Vite version mismatch between parent and example
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import viteTsChecker from 'vite-plugin-checker';
import {join} from "path";
import {fileURLToPath, URL} from "url";
import unpluginVueI18nDtsGeneration from "../src";
// import unpluginVueI18nDtsGeneration from "../src/plugin";


export default defineConfig({
  cacheDir: '.cache',
  resolve: {
    alias: {

      '@': fileURLToPath(new URL('./src', import.meta.url))

    }
  },
  plugins: [
    vue(),
    unpluginVueI18nDtsGeneration({
      include: ["src/**/*en.json"],

      debug: true,
      devUrlPath: "/_virtual_locales.json",
      // Where to find your locale JSON files (customize as needed)
      // include: ["src/locales/**/*.json"],
      //
      // // Optional exclude patterns
      // exclude: ["**/node_modules/**", "**/dist/**"],

      emit: {
        fileName: "assets/locales.json", // hint; final path will be handled by Rollup
        inlineDataInBuild: true,         // also export `data` during build
      },
      // Virtual module id (what you import)
      // virtualId: "virtual:locales",

      // How to derive the locale key from a file path

    }),
    // unpluginVueI18nDtsGeneration(),
    viteTsChecker({
      overlay: {initialIsOpen: true},
      typescript: true,
      vueTsc: {root: __dirname, tsconfigPath: join(__dirname, './tsconfig.app.json')}
    }),

  ],
})
