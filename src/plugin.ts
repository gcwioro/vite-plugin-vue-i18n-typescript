import path from 'node:path'
import fs from 'node:fs/promises'
import {Plugin, ViteDevServer, ResolvedConfig, Logger, Rollup, ViteBuilder} from 'vite'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import type {VirtualKeysDtsOptions, JSONObject, JSONValue} from './types'
import type {PluginOptions} from "@intlify/unplugin-vue-i18n";
import {extractJson, canonicalize, ensureDir, writeFileAtomic, debounce} from './utils'
import {toTypesContent, toConstsContent} from './generator'
import {loadExportFromVirtual} from './loader'

/**
 * Vite plugin for generating TypeScript definitions from unplugin-vue-i18n virtual modules
 * Follows Vite 7 plugin API conventions
 */
export default function unpluginVueI18nDtsGeneration(options?: VirtualKeysDtsOptions) {
  const {
    i18nPluginOptions = {},
    sourceId = '@intlify/unplugin-vue-i18n/messages',
    typesPath = 'src/i18n/i18n.types.gen.d.ts',
    constsPath = 'src/i18n/i18n.gen.ts',
    watchInDev = true,
    baseLocale = 'en',
    banner,

  } = options || {}

  const defaultI18nOptions = {include: ['./**/[a-z][a-z].{json,json5,yml,yaml}', './**/*-[a-z][a-z].{json,json5,yml,yaml}', './**/[a-z][a-z]-*.{json,json5,yml,yaml}']} as PluginOptions

  const i18nPlugin = VueI18nPlugin({...defaultI18nOptions, ...i18nPluginOptions}) as Plugin

  let logger: Logger
  let resolvedRoot = process.cwd()
  let isGenerating = false         // concurrency guard for overlapping FS bursts

  async function generate(server: ViteDevServer, rootDir: string) {
    if (isGenerating) return
    isGenerating = true
    const start = (globalThis.performance?.now?.() ?? Date.now())

    try {
      // 1) Extract the normalized object from the virtual module
      const raw = await loadExportFromVirtual(server, sourceId)
      const value = extractJson({...raw, 'js-reserved': undefined})

      // 2) Gather languages & select base locale
      const languages = [...Object.keys(raw), 'en-US']
      if (!languages.length) {
        throw new Error(`"${sourceId}" yielded an empty object.`)
      }

      const base = (value[baseLocale] ?? value[languages[0]]) as JSONObject | undefined
      if (!base || typeof base !== 'object' || Array.isArray(base)) {
        throw new Error(
          `Could not resolve base locale "${baseLocale}". Available: ${Object.keys(value).join(", ")} .`
        )
      }

      // 3) Deterministic inputs for DTS
      const sortedLanguages = Array.from(new Set(languages.filter(a => a != ' js-reserved'))).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
      const canonicalBase = canonicalize(value as JSONValue) as Record<string, JSONValue>
      const typesOutPath = path.isAbsolute(typesPath) ? typesPath : path.join(rootDir, typesPath)
      const constsOutPath = path.isAbsolute(constsPath) ? constsPath : path.join(rootDir, constsPath)

      const relativePathToTypes = path.relative(path.dirname(constsOutPath), typesOutPath).replace(/\\.d\\.ts$/, '')
      // 4) Generate dual files
      // Generate two separate files
      const typesContent = toTypesContent({
        messages: canonicalBase,
        baseLocale: baseLocale,
        supportedLanguages: sortedLanguages,
        banner,
      })

      const constsContent = toConstsContent({
        messages: canonicalBase,
        typeFilePath: './' + relativePathToTypes,
        baseLocale: baseLocale,
        supportedLanguages: sortedLanguages,
        banner,
      })

      // Write types file
      await ensureDir(typesOutPath)

      let shouldWriteTypes: boolean
      try {
        const existing = await fs.readFile(typesOutPath, 'utf8')
        shouldWriteTypes = existing !== typesContent
      } catch {
        shouldWriteTypes = true
      }

      if (shouldWriteTypes) {
        await writeFileAtomic(typesOutPath, typesContent)
        try {
          server.watcher.add(typesOutPath)
          server.watcher.emit('change', typesOutPath)
        } catch {
          // watcher may not be ready in build mode
        }
      }

      // Write consts file
      await ensureDir(constsOutPath)

      // Update import path in consts file to point to types file
      const relativePath = path.relative(path.dirname(constsOutPath), typesOutPath).replace(/\\.d\\.ts$/, '')
      const adjustedConstsContent = constsContent.replace(
        `from './i18n.types'`,
        `from './${relativePath}'`
      )

      let shouldWriteConsts: boolean
      try {
        const existing = await fs.readFile(constsOutPath, 'utf8')
        shouldWriteConsts = existing !== adjustedConstsContent
      } catch {
        shouldWriteConsts = true
      }

      if (shouldWriteConsts) {
        await writeFileAtomic(constsOutPath, adjustedConstsContent)
        try {
          server.watcher.add(constsOutPath)
          server.watcher.emit('change', constsOutPath)
        } catch {
          // watcher may not be ready in build mode
        }
      }

      logger.info(
        `Generated ${path.relative(rootDir, typesOutPath)} and ${path.relative(rootDir, constsOutPath)} in ${Math.round((globalThis.performance?.now?.() ?? Date.now()) - start)}ms`,
      )
    } finally {
      isGenerating = false
    }
  }

  const debouncedGenerate = debounce(generate, 400)

  return {
    ...i18nPlugin,
    name: 'unplugin-vue-i18n-dts-generation',
    enforce: 'pre' as const,

    configResolved(config: ResolvedConfig) {
      logger = config.logger
      resolvedRoot = config.root ?? process.cwd()

      // Call parent plugin's configResolved hook
      const hook = (i18nPlugin as { configResolved?: unknown }).configResolved
      if (typeof hook === 'function') {
        (hook as (c: unknown) => unknown)(config)
      } else {
        (hook as { handler?: (c: unknown) => unknown })?.handler?.(config)
      }
    },

    async configureServer(server: ViteDevServer) {
      // Call parent plugin's configureServer hook first
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
          logger.info('Generating keys for i18n...', {timestamp: true})
          await generate(server, resolvedRoot)
          logger.info('Initial generation complete.', {timestamp: true})
        } catch (err) {
          logger.error(
            `Initial generation failed: ${(err as Error).message}`,
            {timestamp: true}
          )
        } finally {
          if (watchInDev) {
            logger.info('Watching for changes...', {timestamp: true})
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

    /**
     * Vite 7 handleHotUpdate hook for better HMR support
     */
    async handleHotUpdate({file, server}) {
      // Only regenerate for i18n source files
      if (file.match(/\.(json|json5|yaml|yml)$/)) {
        // Skip generated files to avoid loops
        if (file.includes('.gen.') || file.includes('.d.ts')) {
          return
        }

        logger.info(`i18n source file changed: ${path.basename(file)}`, {timestamp: true})
        await debouncedGenerate(server, resolvedRoot)
      }
    },
  }
}
