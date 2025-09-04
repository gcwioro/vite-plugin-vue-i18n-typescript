import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

import unpluginVueI18nDtsGeneration from '../src'


export default defineConfig({
    plugins: [
        vue(),
        unpluginVueI18nDtsGeneration(),
    ],
})
