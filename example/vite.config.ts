import {defineConfig, type Plugin} from 'vite'
import vue from '@vitejs/plugin-vue'
import viteTsChecker from 'vite-plugin-checker';
import {join} from "path";
import {fileURLToPath, URL} from "url";
import unpluginVueI18nDtsGeneration from "../src";


export default defineConfig({
  resolve: {
    alias: {

      '@': fileURLToPath(new URL('./src', import.meta.url))

    }
  },
  plugins: [
    vue(),
    unpluginVueI18nDtsGeneration({
      typesPath: 'src/i18n/i18n.types.d.ts',
      constsPath: 'src/i18n/i18n.consts.ts'
    }) as Plugin,
    viteTsChecker({
      overlay: {initialIsOpen: true},
      typescript: true,
      vueTsc: {root: __dirname, tsconfigPath: join(__dirname, './tsconfig.app.json')}
    })
  ],
})
