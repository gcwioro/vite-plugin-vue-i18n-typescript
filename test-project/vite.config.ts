import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath } from 'url'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import unpluginVueI18nDtsGeneration from '../src'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    vue(),
    VueI18nPlugin({
      include: [path.resolve(__dirname, './src/locales/**')],
    }),
    unpluginVueI18nDtsGeneration(),
  ],
})
