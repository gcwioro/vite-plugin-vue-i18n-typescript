/* eslint-disable no-console */
import path from 'node:path'
import fs from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import {
  type Plugin,
  type ViteDevServer,
} from 'vite'

/**
 * Options for the virtual keys DTS generator.
 */
export interface VirtualKeysDtsOptions {
  /**
   * The module id that another plugin exposes virtually, e.g. "virtual:routes".
   * This should be exactly what you'd import in user-land code.
   */
  sourceId: string

  /**
   * Which export to read from the virtual module.
   * - "default" to use default export
   * - any named export, e.g. "icons", "routesMap", etc.
   * Default: "default"
   */
  exportName?: string

  /**
   * Absolute or relative path (from Vite root) where the generated .d.ts file should be written.
   * Example: "src/types/virtual-keys.d.ts"
   * Default: "src/virtual-keys.generated.d.ts"
   */
  dtsPath?: string

  /**
   * Name for the generated union type. (Kept for compatibility; not strictly needed.)
   * Default: "VirtualKey"
   */
  typeName?: string

  /**
   * Optional banner comment at the top of the generated file.
   * If omitted, a deterministic banner without timestamps is emitted.
   */
  banner?: string

  /**
   * If true, the plugin will re-generate on every relevant file change in dev.
   * Default: true
   */
  watchInDev?: boolean

  /**
   * Optional function to post-process the keys (e.g., sort, filter, dedupe).
   * Default: sort ascending, unique.
   */
  transformKeys?: (keys: string[]) => string[]

  /**
   * Base locale to introspect for key-path generation.
   * Default: "de"
   */
  baseLocale?: string
}

/* =========================================================================================
 * Utils
 * =======================================================================================*/

/**
 * Small helper: ensure a directory exists.
 */
async function ensureDir(filePath: string) {
  const dir = path.dirname(filePath)
  await fs.mkdir(dir, { recursive: true })
}

type JSONValue = string | number | boolean | null | JSONObject | JSONArray
interface JSONObject { [key: string]: JSONValue }
type JSONArray = JSONValue[]

/**
 * Create an O(1) set for keys to strip during structural JSON extraction.
 */
const keysToRemoveSet = new Set(['loc', 'type', 'start', 'end'])

/**
 * Structure-normalizing extractor. Removes AST-ish metadata, unwraps translation bodies,
 * and preserves shape while pruning noise. It's defensive and avoids repeated lookups.
 */
export function extractJson<T extends JSONValue>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj

  if (Array.isArray(obj)) {
    const arr = obj as JSONArray
    const out: JSONArray = new Array(arr.length)
    for (let i = 0; i < arr.length; i++) {
      out[i] = extractJson(arr[i])
    }
    return out as T
  }

  const input = obj as JSONObject
  const result: JSONObject = {}

  for (const key of Object.keys(input)) {
    if (keysToRemoveSet.has(key)) continue

    const value = input[key]
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const body = (value as JSONObject)['body'] as JSONValue | undefined

      // Body with { static: ... }
      const hasStatic = !!(body && typeof body === 'object' && !Array.isArray(body) && 'static' in (body as JSONObject))
      if (hasStatic) {
        result[key] = (body as JSONObject)['static'] ?? null
        continue
      }

      // Body with { items: ... }
      const items = body && typeof body === 'object' && !Array.isArray(body) ? (body as JSONObject)['items'] : undefined
      if (items !== undefined) {
        result[key] = extractJson(items as JSONValue)
        continue
      }
    }

    // Default recursive descent
    result[key] = extractJson(value)
  }

  return result as T
}

/**
 * Collect dot-notated leaf paths of an object. Arrays count as leaves.
 * Example: { a: { b: 1 }, c: [1,2] } => ["a.b", "c"]
 */
export function getJsonLeafPaths(obj: JSONValue): string[] {
  const paths: string[] = []

  function walk(value: JSONValue, currentPath: string) {
    if (value !== null && typeof value === 'object') {
      if (Array.isArray(value)) {
        paths.push(currentPath)
        return
      }
      for (const [k, v] of Object.entries(value as JSONObject)) {
        const next = currentPath ? `${currentPath}.${k}` : k
        walk(v, next)
      }
      return
    }
    // primitive leaf
    paths.push(currentPath)
  }

  walk(obj, '')
  return paths
}

/**
 * Default key normalization: unique + ascending lexicographic sort.
 */
function defaultTransformKeys(keys: string[]): string[] {
  const set = new Set<string>()
  for (const k of keys) {
    if (typeof k === 'string' && k) set.add(k)
  }
  return Array.from(set).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
}

/**
 * Canonicalize JSON by sorting object keys recursively.
 * Arrays are preserved in-place to keep their intended order.
 */
function canonicalize<T extends JSONValue>(value: T): T {
  if (value === null || typeof value !== 'object') return value
  if (Array.isArray(value)) {
    const arr = value as JSONArray
    const out: JSONArray = new Array(arr.length)
    for (let i = 0; i < arr.length; i++) out[i] = canonicalize(arr[i])
    return out as T
  }
  const obj = value as JSONObject
  const keys = Object.keys(obj).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
  const out: JSONObject = {}
  for (const k of keys) out[k] = canonicalize(obj[k])
  return out as T
}

/**
 * Lightweight FNV-1a 32-bit hash for short, deterministic content IDs.
 */
function fnv1a32(input: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    // 32-bit multiply by prime 16777619
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0
  }
  return ('00000000' + h.toString(16)).slice(-8)
}

/**
 * Atomic write: write to a temp file in the same folder, then rename.
 */
async function writeFileAtomic(filePath: string, content: string) {
  const dir = path.dirname(filePath)
  const tmp = path.join(dir, `.${path.basename(filePath)}.${randomUUID()}.tmp`)
  await fs.writeFile(tmp, content, 'utf8')
  await fs.rename(tmp, filePath)
}

/**
 * Create .d.ts content. Keeps it tight, deterministic, and TS-friendly.
 */
function toDtsContent(params: {
  messagesForBaseLocale: JSONObject
  supportedLanguages: string[]
  banner?: string
  transformKeys?: (keys: string[]) => string[]
  typeName?: string // reserved for future extension
}) {
  const {
    messagesForBaseLocale,
    supportedLanguages,
    banner,
    transformKeys,
  } = params

  // Derive leaf paths
  const allKeysRaw = getJsonLeafPaths(messagesForBaseLocale)
    .map((p) => p.replace(/\.body\.cases$/g, ''))

  const finalKeys = (transformKeys ?? defaultTransformKeys)(allKeysRaw)

  // Canonicalize the base-locale object to make JSON stable across runs/platforms
  const canonicalBase = canonicalize(messagesForBaseLocale)

  // Deterministic banner (no timestamps). Include a small content hash for traceability.
  const messagesJson = JSON.stringify(canonicalBase)
  const languagesTuple = `['${supportedLanguages.join(`', '`)}']`
  const contentId = fnv1a32(languagesTuple + '|' + finalKeys.join('|') + '|' + messagesJson)

  const autogenerated =
    (banner ??
      `// AUTO-GENERATED FILE. DO NOT EDIT.
// Generated by unplugin-vue-i18n-dts-generation (deterministic)
// Content-Hash: ${contentId}
`)
  // Normalize to LF and ensure trailing newline
  const NL = '\n'

  // We export three things:
  // - _SupportedLanguages (tuple)
  // - AllTranslationKeysGen (union of string literals)
  // - AllTranslationsGen (shape of the base-locale messages)
  // Note: we intentionally keep SupportedLanguagesGen identical to your original type (tuple type).
  // If you want a union, you can additionally use SupportedLanguageUnionGen.
  const body =
    `declare const _SupportedLanguages: readonly ${languagesTuple}
const _messages = ${messagesJson} as const
export type AllTranslationKeysGen = ${finalKeys.length ? `'${finalKeys.join(`' | '`)}'` : 'never'}
export type SupportedLanguagesGen = typeof _SupportedLanguages
export type SupportedLanguageUnionGen = typeof _SupportedLanguages[number]
export type AllTranslationsGen = typeof _messages
`

  // Force POSIX newlines, single trailing newline
  return (autogenerated + body).replace(/\r\n/g, NL).replace(/\r/g, NL).replace(/\n*$/,'\n')
}

/**
 * Load the virtual module via Vite's SSR pipeline so that other plugins (that provide it)
 * can resolve & load it. This returns the actual runtime value of the specified export.
 */
async function loadExportFromVirtual(
  server: ViteDevServer,
  sourceId: string,
  exportName: string = 'default',
): Promise<JSONValue> {
  const mod = await server.ssrLoadModule(sourceId)
  if (!mod) {
    throw new Error(`Could not ssrLoadModule("${sourceId}")`)
  }
  const out =
    exportName === 'default'
      ? (mod as any).default
      : (mod as any)[exportName]

  if (out == null) {
    throw new Error(
      `[unplugin-vue-i18n-dts-generation] Export "${exportName}" not found or is null in "${sourceId}".`,
    )
  }
  if (typeof out !== 'object') {
    throw new Error(
      `[unplugin-vue-i18n-dts-generation] Export "${exportName}" in "${sourceId}" must be an object (received ${typeof out}).`,
    )
  }
  return out
}

/**
 * Simple debounce helper for FS-driven regeneration bursts.
 */
function debounce<T extends (...args: any[]) => any>(fn: T, ms: number) {
  let t: ReturnType<typeof setTimeout> | undefined
  return (...args: Parameters<T>) => {
    if (t) clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }
}

/* =========================================================================================
 * Plugin
 * =======================================================================================*/

export default async function unpluginVueI18nDtsGeneration(options: VirtualKeysDtsOptions): Promise<Plugin> {
  const {
    sourceId,
    dtsPath = 'src/extensions/i18n.gen.d.ts',
    watchInDev = true,
    exportName = 'default',
    baseLocale = 'de',
    banner,
    transformKeys,
  } = options

  if (!sourceId || typeof sourceId !== 'string') {
    throw new Error(`[unplugin-vue-i18n-dts-generation] "sourceId" is required (e.g. "virtual:routes").`)
  }

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
      const raw = await loadExportFromVirtual(server, sourceId, exportName)
      const value = extractJson(raw) as Record<string, unknown>

      // 2) Gather languages & select base locale
      const languages = Object.keys(value)
      if (!languages.length) {
        throw new Error(`[unplugin-vue-i18n-dts-generation] "${sourceId}" yielded an empty object.`)
      }

      const base = (value[baseLocale] ?? value[languages[0]]) as JSONObject | undefined
      if (!base || typeof base !== 'object' || Array.isArray(base)) {
        throw new Error(
          `[unplugin-vue-i18n-dts-generation] Could not resolve base locale "${baseLocale}".`
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
      let shouldWrite = true
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
    name: 'unplugin-vue-i18n-dts-generation',
    apply: 'serve',

    configResolved(config) {
      resolvedRoot = config.root ?? process.cwd()
    },

    async configureServer(server) {
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
          'src/**/*.{json,json5,yml,yaml}',
          '!**/*.d.ts',
          '!**/node_modules/**',
        ]

        const onFsEvent = async (changedPath: string) => {
          // Skip if the change is the generated file itself or clearly irrelevant
          if (changedPath.endsWith('.d.ts')) return
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