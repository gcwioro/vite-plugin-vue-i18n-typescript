/// <reference types="./vite-env-override" />
/// <reference types="vite/client" />
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import viteTsChecker from 'vite-plugin-checker';
import {join} from "path";
import {fileURLToPath, URL} from "url";

// import unpluginVueI18nDtsGeneration,{VirtualKeysDtsOptions} from "unplugin-vue-i18n-dts-generation";
import unpluginVueI18nDtsGeneration from "../src";
import {viteSingleFile} from "vite-plugin-singlefile"


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
    viteTsChecker({
      overlay: {initialIsOpen: true},
      typescript: true,
      vueTsc: {root: __dirname, tsconfigPath: join('./tsconfig.app.json')}

    }),
    unpluginVueI18nDtsGeneration({
      baseLocale: 'en',
      debug: true,
      // virtualFilePath: './src/i18n/virtual.js',
      emit: {emitJson: false, inlineDataInBuild: true}


    }),
    // unpluginVueI18nDtsGeneration(),

    viteSingleFile()

  ],
})
