/* eslint-disable no-console */
import path from 'node:path'
import fs from 'node:fs/promises'
import type {Plugin, ViteDevServer} from 'vite'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import type {VirtualKeysDtsOptions, JSONObject} from './types'
import type {PluginOptions} from "@intlify/unplugin-vue-i18n";
import {extractJson, canonicalize, ensureDir, writeFileAtomic, fnv1a32, debounce} from './utils'
import {toDtsContent} from './generator'
import {loadExportFromVirtual} from './loader'

export default async function unpluginVueI18nDtsGeneration(options?: VirtualKeysDtsOptions): Promise<Plugin> {
  const {
    i18nPluginOptions = {},
    sourceId = '@intlify/unplugin-vue-i18n/messages',
    dtsPath = 'src/types/i18n.d.ts',
    watchInDev = true,
    baseLocale = 'en',
    banner,
    transformKeys,
  } = options || {}

  const defaultI18nOptions = {include: ['./src/**/[a-z][a-z].{json,json5,yml,yaml}', path.resolve(__dirname, './src/**/*-[a-z][a-z].{json,json5,yml,yaml}', path.resolve(__dirname, './src/**/[a-z][a-z]-*.{json,json5,yml,yaml}'))]} as PluginOptions
  const i18nPlugin = VueI18nPlugin({...defaultI18nOptions, ...i18nPluginOptions}) as Plugin

  let resolvedRoot = process.cwd()
  let lastWrittenContent = ''      // prevent redundant writes in-process
  let lastComputedHash = ''        // fast short-circuit when nothing semantically changed
  let watcherAddedForOutPath = false
  let isGenerating = false         // concurrency guard for overlapping FS bursts

  async function generate(server: ViteDevServer, rootDir: string) {
    if (isGenerating) return
    isGenerating = true
    const start = (globalThis.performance?.now?.() ?? Date.now())

    try {
      // 1) Extract the normalized object from the virtual module
      const raw = await loadExportFromVirtual(server, sourceId)
      const value = extractJson(raw) as Record<string, unknown>

      // 2) Gather languages & select base locale
      const languages = Object.keys(raw)
      if (!languages.length) {
        throw new Error(`[unplugin-vue-i18n-dts-generation] "${sourceId}" yielded an empty object.`)
      }

      const base = (value[baseLocale] ?? value[languages[0]]) as JSONObject | undefined
      if (!base || typeof base !== 'object' || Array.isArray(base)) {
        throw new Error(
          `[unplugin-vue-i18n-dts-generation] Could not resolve base locale "${baseLocale}". Available: ${Object.keys(value).join(", ")} .`
        )
      }

      // 3) Deterministic inputs for DTS
      const sortedLanguages = Array.from(new Set(languages)).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
      const canonicalBase = canonicalize(base)

      // 4) Build content (deterministic)
      const content = toDtsContent({
        messagesForBaseLocale: canonicalBase,
        supportedLanguages: sortedLanguages,
        banner,
        transformKeys,
      })

      // 5) Short-circuit on semantic hash (stable across line-endings and formatting)
      const semanticHash = fnv1a32(
        JSON.stringify(canonicalBase) + '|' + sortedLanguages.join('|')
      )
      if (semanticHash === lastComputedHash && content === lastWrittenContent) {
        // Nothing new to do
        return
      }

      const outPath = path.isAbsolute(dtsPath) ? dtsPath : path.join(rootDir, dtsPath)
      await ensureDir(outPath)

      // 6) Only write if file content actually changed (covers restart cases)
      let shouldWrite :boolean
      try {
        const existing = await fs.readFile(outPath, 'utf8')
        shouldWrite = existing !== content
      } catch {
        // File does not exist -> write
        shouldWrite = true
      }

      if (shouldWrite) {
        await writeFileAtomic(outPath, content)
        lastWrittenContent = content
        lastComputedHash = semanticHash

        // Make Vite aware of the file in dev so TS server & HMR pick it up
        try {
          if (!watcherAddedForOutPath) {
            server.watcher.add(outPath)
            watcherAddedForOutPath = true
          }
          server.watcher.emit('change', outPath)
        } catch {
          // watcher may not be ready in build mode
        }
      } else {
        lastWrittenContent = content
        lastComputedHash = semanticHash
      }

      server.config.logger.info(
        `[unplugin-vue-i18n-dts-generation] ${path.relative(rootDir, outPath)} generated in ${Math.round((globalThis.performance?.now?.() ?? Date.now()) - start)}ms`,
      )
    } finally {
      isGenerating = false
    }
  }

  const debouncedGenerate = debounce(generate, 400)

  return {
    ...i18nPlugin,
    name: 'unplugin-vue-i18n-dts-generation',

    configResolved(config) {
      const hook = (i18nPlugin as { configResolved?: unknown }).configResolved
      if (typeof hook === 'function') {
        (hook as (c: unknown) => unknown)(config)
      } else {
        (hook as { handler?: (c: unknown) => unknown })?.handler?.(config)
      }
      resolvedRoot = config.root ?? process.cwd()
    },

    async configureServer(server) {
      const hook = (i18nPlugin as { configureServer?: unknown }).configureServer
      if (typeof hook === 'function') {
        await (hook as (s: ViteDevServer) => unknown)(server)
      } else {
        const handler = (hook as { handler?: (s: ViteDevServer) => unknown })?.handler
        if (handler) await handler(server)
      }

      // One initial run when the server is ready
      const run = async () => {
        try {
          server.config.logger.info('[unplugin-vue-i18n-dts-generation] Generating keys for i18n...')
          await generate(server, resolvedRoot)
          server.config.logger.info('[unplugin-vue-i18n-dts-generation] Initial generation complete.')
        } catch (err) {
          server.config.logger.error(
            `[unplugin-vue-i18n-dts-generation] Initial generation failed: ${(err as Error).message}`,
          )
        } finally {
          if (watchInDev) {
            server.config.logger.info('[unplugin-vue-i18n-dts-generation] Watching for changes...')
          }
        }
      }

      try {
        await run()
      } catch {
        // swallow: already logged
      }

      if (watchInDev) {
        // Watch a minimal, relevant set of inputs; ignore .d.ts to avoid loops and .vue/.ts to reduce noise.
        // You can extend this if your virtual source depends on more.
        const globs = [
          'src/**/*.{json,json5,yaml,yml}',
          '!**/*.d.ts*',
          '!**/node_modules/**',
        ]

        const onFsEvent = async () => {
          debouncedGenerate(server, resolvedRoot)
        }

        server.watcher.add(globs)
        server.watcher
          .on('add', onFsEvent)
          .on('unlink', onFsEvent)
          .on('change', onFsEvent)
      }
    },
  }
}
