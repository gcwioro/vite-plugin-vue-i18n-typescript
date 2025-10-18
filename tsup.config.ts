import { defineConfig } from 'tsup'

export default defineConfig([
  // Main plugin entry
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    minify: false,
    target: 'node22',
    external: ['vite', 'fast-glob'],
    shims: true,
    splitting: false,
    treeshake: true,
  },
  // API entry
  {
    entry: ['src/api.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    minify: false,
    target: 'node22',
    external: ['vite', 'fast-glob'],
    shims: true,
    splitting: false,
    treeshake: true,
  },
  // CLI entry (ESM only for bin)
  {
    entry: ['src/cli.ts'],
    format: ['esm'],
    dts: false,
    sourcemap: false,
    minify: false,
    target: 'node22',
    external: ['vite', 'fast-glob'],
    shims: true,
    splitting: false,
    treeshake: true,
  },
])
