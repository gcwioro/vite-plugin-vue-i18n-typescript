/// <reference types="./vite-env-override" />
/// <reference types="vite/client" />
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import viteTsChecker from 'vite-plugin-checker';
import {join} from "path";
import {fileURLToPath, URL} from "url";


import unpluginVueI18nDtsGeneration from "../src";
// import unpluginVueI18nDtsGeneration, {
//     VirtualKeysDtsOptions
// } from "../src/index";
// import unpluginVueI18nDtsGeneration,{VirtualKeysDtsOptions} from "unplugin-vue-i18n-dts-generation";


// const plugin :Plugin<VirtualKeysDtsOptions>= unpluginVueI18nDtsGeneration(pluginOptions );
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
      baseLocale: 'en',
      debug: true,

      emit: {emitJson: false, inlineDataInBuild: false}


    }) as any,
    // unpluginVueI18nDtsGeneration(),
    viteTsChecker({
      overlay: {initialIsOpen: true},
      typescript: true,
      vueTsc: {root: __dirname, tsconfigPath: join('./tsconfig.app.json')}
    }),

  ],
})
