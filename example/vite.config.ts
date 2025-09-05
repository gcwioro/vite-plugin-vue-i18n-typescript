import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import viteTsChecker from 'vite-plugin-checker';
import {join} from "path";
import {fileURLToPath, URL} from "url";
import unpluginVueI18nDtsGeneration from "../src/plugin";

export default defineConfig({
  cacheDir: '.cache',
  resolve: {
    alias: {

      '@': fileURLToPath(new URL('./src', import.meta.url))

    }
  },
  plugins: [
    vue(),
    unpluginVueI18nDtsGeneration(),
    viteTsChecker({
      overlay: {initialIsOpen: true},
      typescript: true,
      vueTsc: {root: __dirname, tsconfigPath: join(__dirname, './tsconfig.app.json')}
    })
  ],
})
