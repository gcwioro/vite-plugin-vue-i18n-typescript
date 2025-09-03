import { defineConfig } from 'vite'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'UnpluginVueI18nDtsGeneration',
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['vite', 'node:path', 'node:fs', 'node:fs/promises', 'node:crypto'],
      output: {
        globals: {
          vite: 'Vite',
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
})