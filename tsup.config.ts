import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  target: 'node18',
  external: ['vite'],
  shims: true,
  splitting: false,
  treeshake: true,
})