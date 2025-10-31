import {defineConfig, type Options} from 'tsup'
//
//
// const defaultOptions = (entryFile: string[] | string) => ({
//   entryFile: entryFile,
//   format: ['cjs', 'esm'],
//   dts: true,
//   clean: true,
//   sourcemap: true,
//
//   minify: false,
//   target: ['node22', 'esnext'],
//   external: ['vite', 'fast-glob'],
//   shims: true,
//   cjsInterop: true,
//   splitting: true,
//   treeshake: 'safest',
//   bundle: true,
// } as Options)
// export default defineConfig([
//   // Main plugin entry
//   // {
//   //   ...defaultOptions('src/index.ts'),
//   //   name: 'vite-plugin-vue-i18n-typescript'
//   // },
//   {
//     ...defaultOptions('src/plugin.ts'),
//     name: 'plugin',
//     outDir: 'dist',
//   },
//   {
//     ...defaultOptions('src/api.ts'),
//     name: 'api',
//     outDir: 'dist/api',
//   },
//   {
//     ...defaultOptions('src/cli.ts'),
//     name: 'cli',
//     outDir: 'dist/cli',
//   },
//
// ])
// import type {Options} from "tsup";/**/

export const tsup: Options = {
  outDir: 'dist',
  splitting: false,
  clean: true,
  sourcemap: true,

  dts: {
    entry: ['src/index.ts', 'src/plugin.ts', 'src/api.ts', 'src/vite-env-override-components.ts',
    ]
  },
  format: ['cjs', 'esm'],
  ignoreWatch: [
    'dist',
    'doc',
  ],
  bundle: true,
  treeshake: true,
  entry: {
    plugin: 'src/plugin.ts',
    index: 'src/index.ts',
    api: 'src/api.ts',
    cli: 'src/cli.ts',
  },
  target: ['node22', 'esnext'],
  external: ['vite', 'fast-glob', 'path'],
};
export default defineConfig(tsup);
